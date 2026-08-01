// lib/stores/cartStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createClient } from '@/lib/supabase/client'

export interface CartItem {
  id: string
  product_id: string
  name: string
  price: number
  quantity: number
  image: string
  platform?: string
  maxStock?: number
}

interface CartStore {
  items: CartItem[]
  total: number
  itemCount: number
  userId: string | null
  syncedUserId: string | null
  hasHydrated: boolean
  isSyncing: boolean

  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getItemCount: () => number
  isInCart: (productId: string) => boolean

  loadUserCart: (userId: string) => Promise<void>
  handleLogout: () => void
  setHasHydrated: (state: boolean) => void
  setIsSyncing: (state: boolean) => void
  resetSyncState: () => void // ✅ NEW - Force reset
}

const recalculate = (items: CartItem[]) => ({
  total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
})

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      itemCount: 0,
      userId: null,
      syncedUserId: null,
      hasHydrated: false,
      isSyncing: false,

      addItem: (item) => {
        const items = get().items
        const existingIndex = items.findIndex((i) => i.product_id === item.product_id)

        let newItems: CartItem[]
        let newQuantity = 1
        if (existingIndex > -1) {
          newQuantity = items[existingIndex].quantity + 1
          newItems = items.map((i, index) =>
            index === existingIndex ? { ...i, quantity: newQuantity } : i
          )
        } else {
          newItems = [...items, { ...item, quantity: 1 }]
        }

        set({ items: newItems, ...recalculate(newItems) })

        const userId = get().userId
        if (userId) {
          syncAddOrUpdate(userId, item.product_id, newQuantity)
        }
      },

      removeItem: (id: string) => {
        const items = get().items
        const itemToRemove = items.find((i) => i.id === id)
        const newItems = items.filter((i) => i.id !== id)
        set({ items: newItems, ...recalculate(newItems) })

        const userId = get().userId
        if (userId && itemToRemove) {
          syncRemove(userId, itemToRemove.product_id)
        }
      },

      updateQuantity: (id: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }
        const items = get().items.map((i) => (i.id === id ? { ...i, quantity } : i))
        set({ items, ...recalculate(items) })

        const userId = get().userId
        const updatedItem = items.find((i) => i.id === id)
        if (userId && updatedItem) {
          syncAddOrUpdate(userId, updatedItem.product_id, quantity)
        }
      },

      clearCart: () => {
        set({ items: [], total: 0, itemCount: 0 })

        const userId = get().userId
        if (userId) {
          syncClear(userId)
        }
      },

      getCartTotal: () => get().total,
      getItemCount: () => get().itemCount,
      isInCart: (productId) => get().items.some((i) => i.product_id === productId),

      setIsSyncing: (state: boolean) => {
        set({ isSyncing: state })
      },

      resetSyncState: () => {
        set({ syncedUserId: null, isSyncing: false })
      },

      // ✅ COMPLETELY REWRITTEN - CLEAN MERGE WITHOUT DUPLICATION
      loadUserCart: async (userId: string) => {
        // ✅ Prevent multiple simultaneous syncs
        if (get().isSyncing) {
          console.log('⏭️ Cart sync already in progress, skipping...')
          return
        }

        // ✅ If already synced with THIS user, skip entirely
        if (get().syncedUserId === userId && get().userId === userId) {
          console.log('⏭️ Already synced with user:', userId)
          return
        }

        set({ isSyncing: true })
        console.log('🔄 Starting cart sync for user:', userId)

        try {
          const supabase = createClient()
          const currentItems = get().items // Guest items

          // ✅ STEP 1: Fetch user's cart from database
          const { data, error } = await supabase
            .from('cart_items')
            .select('*, product:products(*)')
            .eq('user_id', userId)

          if (error) {
            console.error('❌ Error loading user cart:', error)
            set({ isSyncing: false })
            return
          }

          // ✅ STEP 2: Build user items array
          const userItems: CartItem[] = (data || [])
            .filter((row: any) => row.product)
            .map((row: any) => ({
              id: row.product.id,
              product_id: row.product.id,
              name: row.product.name,
              price: row.product.discount_price || row.product.price,
              quantity: row.quantity,
              image: row.product.images?.[0] || '/images/placeholder.jpg',
              platform: row.product.platform?.[0],
            }))

          console.log('📦 User items from DB:', userItems.length)
          console.log('📦 Current guest items:', currentItems.length)

          // ✅ STEP 3: Determine what to do
          if (currentItems.length === 0 && userItems.length === 0) {
            // ✅ Both empty - just set user
            set({ userId, syncedUserId: userId, isSyncing: false })
            console.log('✅ Both carts empty, just set user')
            return
          }

          if (currentItems.length === 0 && userItems.length > 0) {
            // ✅ Only user has items - load them
            set({
              items: userItems,
              userId,
              syncedUserId: userId,
              ...recalculate(userItems),
              isSyncing: false
            })
            console.log('✅ Loaded user cart:', userItems.length, 'items')
            return
          }

          if (currentItems.length > 0 && userItems.length === 0) {
            // ✅ Only guest has items - save them to DB
            for (const item of currentItems) {
              await syncAddOrUpdate(userId, item.product_id, item.quantity, false)
            }
            set({
              userId,
              syncedUserId: userId,
              isSyncing: false
            })
            console.log('✅ Saved guest items to DB:', currentItems.length, 'items')
            return
          }

          // ✅ STEP 4: BOTH have items - MERGE (no duplication)
          if (currentItems.length > 0 && userItems.length > 0) {
            console.log('🔄 Merging carts...')

            // ✅ Create a map for merged items
            const mergedMap = new Map<string, CartItem>()

            // ✅ Add user items first
            userItems.forEach(item => {
              mergedMap.set(item.product_id, { ...item })
            })

            // ✅ Add/merge guest items
            currentItems.forEach(guestItem => {
              if (mergedMap.has(guestItem.product_id)) {
                // ✅ Same product - ADD quantities
                const existing = mergedMap.get(guestItem.product_id)!
                existing.quantity += guestItem.quantity
                console.log(`  ➕ Merged ${guestItem.name}: +${guestItem.quantity} (now ${existing.quantity})`)
              } else {
                // ✅ New product - ADD it
                mergedMap.set(guestItem.product_id, { ...guestItem })
                console.log(`  ➕ Added ${guestItem.name}: ${guestItem.quantity}`)
              }
            })

            const mergedItems = Array.from(mergedMap.values())
            console.log('📦 Merged items:', mergedItems.length)

            // ✅ STEP 5: CLEAR the user's cart in DB first
            await syncClear(userId)
            console.log('🗑️ Cleared user cart in DB')

            // ✅ STEP 6: Insert all merged items
            for (const item of mergedItems) {
              await syncAddOrUpdate(userId, item.product_id, item.quantity, false)
              console.log(`  💾 Saved ${item.name}: ${item.quantity}`)
            }

            // ✅ STEP 7: Set the store with merged items
            set({
              items: mergedItems,
              userId,
              syncedUserId: userId,
              ...recalculate(mergedItems),
              isSyncing: false
            })

            console.log('✅ Cart merge complete! Items:', mergedItems.length)
          }
        } catch (error) {
          console.error('❌ Error in loadUserCart:', error)
          set({ isSyncing: false })
        }
      },

      handleLogout: () => {
        set({
          items: [],
          total: 0,
          itemCount: 0,
          userId: null,
          syncedUserId: null,
          isSyncing: false
        })
      },

      setHasHydrated: (state: boolean) => {
        set({ hasHydrated: state })
      },
    }),
    {
      name: 'cart-storage',
      skipHydration: true,
      partialize: (state) => ({
        items: state.items,
        userId: state.userId,
        syncedUserId: state.syncedUserId
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)

async function syncAddOrUpdate(
  userId: string,
  productId: string,
  quantity: number,
  isMerge: boolean = false
) {
  try {
    const supabase = createClient()

    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle()

    if (existing) {
      const finalQuantity = isMerge ? existing.quantity + quantity : quantity
      await supabase
        .from('cart_items')
        .update({ quantity: finalQuantity, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
    } else {
      await supabase.from('cart_items').insert({
        user_id: userId,
        product_id: productId,
        quantity,
      })
    }
  } catch (error) {
    console.error('Error syncing cart item:', error)
  }
}

async function syncRemove(userId: string, productId: string) {
  try {
    const supabase = createClient()
    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId)
  } catch (error) {
    console.error('Error removing cart item:', error)
  }
}

async function syncClear(userId: string) {
  try {
    const supabase = createClient()
    await supabase.from('cart_items').delete().eq('user_id', userId)
  } catch (error) {
    console.error('Error clearing cart:', error)
  }
}

let rehydrationTriggered = false

export function ensureCartHydrated(): Promise<void> {
  return new Promise((resolve) => {
    const state = useCartStore.getState()
    if (state.hasHydrated) {
      resolve()
      return
    }

    if (!rehydrationTriggered) {
      rehydrationTriggered = true
      useCartStore.persist.rehydrate()
    }

    const unsubscribe = useCartStore.subscribe((s) => {
      if (s.hasHydrated) {
        unsubscribe()
        resolve()
      }
    })
  })
}