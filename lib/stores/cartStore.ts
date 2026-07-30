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

  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getItemCount: () => number
  isInCart: (productId: string) => boolean

  loadUserCart: (userId: string) => Promise<void>
  handleLogout: () => void
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

      removeItem: (id) => {
        const items = get().items.filter((i) => i.id !== id)
        set({ items, ...recalculate(items) })

        const userId = get().userId
        if (userId) {
          syncRemove(userId, id)
        }
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }
        const items = get().items.map((i) => (i.id === id ? { ...i, quantity } : i))
        set({ items, ...recalculate(items) })

        const userId = get().userId
        if (userId) {
          syncAddOrUpdate(userId, id, quantity)
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

      
      loadUserCart: async (userId: string) => {
        const alreadyMerged = get().syncedUserId === userId
        const supabase = createClient()
        const guestItems = get().items

        set({ userId })

         if (!alreadyMerged) {
          set({ syncedUserId: userId })

        for (const item of guestItems) {
          await syncAddOrUpdate(userId, item.product_id, item.quantity, true)
        }
      }

        const { data, error } = await supabase
          .from('cart_items')
          .select('*, product:products(*)')
          .eq('user_id', userId)

        if (error) {
          console.error('Error loading user cart:', error)
          return
        }

        const items: CartItem[] = (data || [])
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

        set({ items, ...recalculate(items) })
      },

      
      handleLogout: () => {
        set({ items: [], total: 0, itemCount: 0, userId: null })
      },
    }),
    {
      name: 'cart-storage',
      skipHydration: true,
      partialize: (state) => ({ items: state.items }), 
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
      // On merge, add guest quantity to whatever's already saved; otherwise just set the new quantity
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