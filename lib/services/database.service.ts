// lib/services/database.service.ts
import { createClient } from '@/lib/supabase/client'
import { Product, Category, ProductFilters } from '@/types/product.types'

export class DatabaseService {
  private static supabase = createClient()

  static getSupabaseClient() {
    return this.supabase
  }

  // Products
  static async getProducts(filters?: ProductFilters): Promise<Product[]> {
    try {
      console.log('🔍 Fetching products with filters:', filters)
      
      let query = this.supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('is_active', true)

      if (filters) {
        if (filters.category) {
          console.log('📂 Filtering by category slug:', filters.category)
          
          const { data: categoryData, error: categoryError } = await this.supabase
            .from('categories')
            .select('id')
            .eq('slug', filters.category)
            .maybeSingle()
          
          if (categoryError) {
            console.log('⚠️ Error finding category:', categoryError)
          }
          
          if (categoryData) {
            console.log('📂 Found category by slug, ID:', categoryData.id)
            query = query.eq('category_id', categoryData.id)
          } else {
            console.log('📂 Trying category as direct ID:', filters.category)
            query = query.eq('category_id', filters.category)
          }
        }
        
        if (filters.platform && filters.platform !== 'All Platforms') {
          console.log('🎮 Filtering by platform:', filters.platform)
          query = query.contains('platform', [filters.platform])
        }
        
        if (filters.minPrice !== undefined) {
          query = query.gte('price', filters.minPrice)
        }
        if (filters.maxPrice !== undefined) {
          query = query.lte('price', filters.maxPrice)
        }
        
        if (filters.search) {
          console.log('🔎 Searching for:', filters.search)
          query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
        }
        
        if (filters.sortBy) {
          switch (filters.sortBy) {
            case 'price_asc':
              query = query.order('price', { ascending: true })
              break
            case 'price_desc':
              query = query.order('price', { ascending: false })
              break
            case 'newest':
              query = query.order('created_at', { ascending: false })
              break
            default:
              query = query.order('created_at', { ascending: false })
          }
        } else {
          query = query.order('created_at', { ascending: false })
        }
      } else {
        query = query.order('created_at', { ascending: false })
      }

      const { data, error } = await query

      if (error) {
        console.error('❌ Error fetching products:', error)
        return []
      }

      console.log('✅ Products found:', data?.length || 0)
      return data || []
    } catch (error) {
      console.error('❌ Error in getProducts:', error)
      return []
    }
  }

static async getProductsPaginated(
  filters?: ProductFilters,
  page: number = 1,
  pageSize: number = 12
): Promise<{ products: Product[]; totalCount: number; totalPages: number }> {
  try {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = this.supabase
      .from('products')
      .select(`*, category:categories(*)`, { count: 'exact' })
      .eq('is_active', true)

    if (filters) {
      if (filters.category) {
        const { data: categoryData } = await this.supabase
          .from('categories')
          .select('id')
          .eq('slug', filters.category)
          .maybeSingle()

        if (categoryData) {
          query = query.eq('category_id', categoryData.id)
        } else {
          query = query.eq('category_id', filters.category)
        }
      }

      if (filters.platform && filters.platform !== 'All Platforms') {
        query = query.contains('platform', [filters.platform])
      }
      if (filters.minPrice !== undefined) query = query.gte('price', filters.minPrice)
      if (filters.maxPrice !== undefined) query = query.lte('price', filters.maxPrice)
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      switch (filters.sortBy) {
        case 'price_asc':
          query = query.order('price', { ascending: true })
          break
        case 'price_desc':
          query = query.order('price', { ascending: false })
          break
        default:
          query = query.order('created_at', { ascending: false })
      }
    } else {
      query = query.order('created_at', { ascending: false })
    }

    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error('❌ Error fetching paginated products:', error)
      return { products: [], totalCount: 0, totalPages: 0 }
    }

    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / pageSize)

    return { products: data || [], totalCount, totalPages }
  } catch (error) {
    console.error('❌ Error in getProductsPaginated:', error)
    return { products: [], totalCount: 0, totalPages: 0 }
  }
}

  static async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('slug', slug)
        .single()

      if (error) {
        console.error('Error fetching product:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getProductBySlug:', error)
      return null
    }
  }

  static async getProductById(id: string): Promise<Product | null> {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching product:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getProductById:', error)
      return null
    }
  }

  static async getFeaturedProducts(): Promise<Product[]> {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('is_featured', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(8)

      if (error) {
        console.error('Error fetching featured products:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getFeaturedProducts:', error)
      return []
    }
  }

  static async getProductsByCategory(categorySlug: string): Promise<Product[]> {
    try {
      console.log('🔍 Fetching products for category slug:', categorySlug)
      
      const { data: categoryData, error: categoryError } = await this.supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .single()

      if (categoryError) {
        console.error('❌ Category not found:', categorySlug, categoryError)
        return []
      }

      if (!categoryData) {
        console.log('⚠️ No category found with slug:', categorySlug)
        return []
      }

      console.log('📂 Found category ID:', categoryData.id)

      const { data, error } = await this.supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('category_id', categoryData.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching products by category:', error)
        return []
      }

      console.log('✅ Products found for category:', data?.length || 0)
      return data || []
    } catch (error) {
      console.error('❌ Error in getProductsByCategory:', error)
      return []
    }
  }

  // Categories
  static async getCategories(): Promise<Category[]> {
    try {
      console.log('🔍 Fetching categories...')
      
      const { data, error } = await this.supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })

      if (error) {
        console.error('❌ Error fetching categories:', error)
        return []
      }

      console.log('✅ Categories found:', data?.length || 0)
      return data || []
    } catch (error) {
      console.error('❌ Error in getCategories:', error)
      return []
    }
  }

  static async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      const { data, error } = await this.supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error) {
        console.error('Error fetching category:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getCategoryBySlug:', error)
      return null
    }
  }

  // Cart
  static async getCartItems(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('cart_items')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', userId)

      if (error) {
        console.error('Error fetching cart:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getCartItems:', error)
      return []
    }
  }

  static async addToCart(userId: string, productId: string, quantity: number = 1) {
    try {
      const { data, error } = await this.supabase
        .from('cart_items')
        .insert({
          user_id: userId,
          product_id: productId,
          quantity,
        })
        .select()
        .single()

      if (error) {
        console.error('Error adding to cart:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in addToCart:', error)
      throw error
    }
  }

  static async updateCartItem(cartItemId: string, quantity: number) {
    try {
      const { data, error } = await this.supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', cartItemId)
        .select()
        .single()

      if (error) {
        console.error('Error updating cart:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in updateCartItem:', error)
      throw error
    }
  }

  static async removeFromCart(cartItemId: string) {
    try {
      const { error } = await this.supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId)

      if (error) {
        console.error('Error removing from cart:', error)
        throw error
      }
    } catch (error) {
      console.error('Error in removeFromCart:', error)
      throw error
    }
  }

  static async clearCart(userId: string) {
    try {
      const { error } = await this.supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId)

      if (error) {
        console.error('Error clearing cart:', error)
        throw error
      }
    } catch (error) {
      console.error('Error in clearCart:', error)
      throw error
    }
  }

  // Orders
  static async createOrder(orderData: any) {
    try {
      const { data, error } = await this.supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single()

      if (error) {
        console.error('Error creating order:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in createOrder:', error)
      throw error
    }
  }

  // ✅ SINGLE getOrders method - handles both admin and user
  static async getOrders(userId?: string) {
    try {
      let query = this.supabase
        .from('orders')
        .select(`
          *,
          order_items(*)
        `)
        .order('created_at', { ascending: false })

      if (userId && userId !== 'all') {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching orders:', error)
        return []
      }
      return data || []
    } catch (error) {
      console.error('Error in getOrders:', error)
      return []
    }
  }

  static async getOrderById(orderId: string) {
    try {
      const { data, error } = await this.supabase
        .from('orders')
        .select(`
          *,
          order_items(*),
          payments(*)
        `)
        .eq('id', orderId)
        .single()

      if (error) {
        console.error('Error fetching order:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getOrderById:', error)
      return null
    }
  }

  static async updateOrderStatus(orderId: string, status: string) {
    try {
      const { data, error } = await this.supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single()

      if (error) {
        console.error('Error updating order:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in updateOrderStatus:', error)
      throw error
    }
  }

  // Payments
  static async createPayment(paymentData: any) {
    try {
      const { data, error } = await this.supabase
        .from('payments')
        .insert(paymentData)
        .select()
        .single()

      if (error) {
        console.error('Error creating payment:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in createPayment:', error)
      throw error
    }
  }

  static async confirmPayment(paymentId: string, adminId: string) {
  try {
    const { data, error } = await this.supabase
      .from('payments')
      .update({
        status: 'approved',
        confirmed_by: adminId,
        confirmed_at: new Date().toISOString(),
      })
      .eq('id', paymentId)
      .select()
      .single()

    if (error) {
      console.error('Error confirming payment:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in confirmPayment:', error)
    throw error
  }
}

  // Get all payments (admin only)
  static async getPayments() {
    try {
      const { data, error } = await this.supabase
        .from('payments')
        .select(`
          *,
          orders(*)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching payments:', error)
        return []
      }
      return data || []
    } catch (error) {
      console.error('Error in getPayments:', error)
      return []
    }
  }

  // Get all users (admin only)
  static async getUsers() {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching users:', error)
        return []
      }
      return data || []
    } catch (error) {
      console.error('Error in getUsers:', error)
      return []
    }
  }

  // Bank Settings
  static async getBankSettings() {
    try {
      const { data, error } = await this.supabase
        .from('bank_settings')
        .select('*')
        .eq('is_active', true)
        .single()

      if (error) {
        console.error('Error fetching bank settings:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getBankSettings:', error)
      return null
    }
  }

  static async updateBankSettings(settingsData: any, adminId: string) {
    try {
      const { data, error } = await this.supabase
        .from('bank_settings')
        .update({
          ...settingsData,
          updated_by: adminId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settingsData.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating bank settings:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in updateBankSettings:', error)
      throw error
    }
  }

  static async getStoreSettings() {
  const supabase = this.getSupabaseClient()
  const { data, error } = await supabase
    .from('store_settings')
    .select('*')
    .single()

  if (error) {
    console.error('Error fetching store settings:', error.message)
    return { default_currency: 'USD' }
  }
  return data
}

static async updateStoreSettings(defaultCurrency: string, userId: string) {
  const supabase = this.getSupabaseClient()
  const { data: existing } = await supabase
    .from('store_settings')
    .select('id')
    .single()

  const { error } = await supabase
    .from('store_settings')
    .update({
      default_currency: defaultCurrency,
      updated_at: new Date().toISOString(),
      updated_by: userId,
    })
    .eq('id', existing?.id)

  if (error) throw error
}

static async updateCategoryCurrency(categoryId: string, currencyOverride: string | null) {
  const supabase = this.getSupabaseClient()
  const { error } = await supabase
    .from('categories')
    .update({ currency_override: currencyOverride })
    .eq('id', categoryId)

  if (error) throw error
}
}