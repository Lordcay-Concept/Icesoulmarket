// types/product.types.ts
export interface Product {
  id: string
  name: string
  slug: string
  category_id: string | null
  category?: Category | null
  description: string
  price: number
  discount_price: number | null
  stock_quantity: number
  images: string[]
  platform: string[]
  features: ProductFeatures
  is_active: boolean
  is_featured: boolean
  meta_title: string | null
  meta_description: string | null
  icon: string | null 
  created_at: string
  updated_at: string
}

export interface ProductFeatures {
  rank?: string
  level?: number
  skins?: string[]
  weapons?: string[]
  battle_pass?: boolean
  prestige_level?: number
  [key: string]: string | number | boolean | string[] | undefined
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  created_at: string
}

export interface ProductFilters {
  category?: string
  platform?: string
  minPrice?: number
  maxPrice?: number
  search?: string
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular'
}