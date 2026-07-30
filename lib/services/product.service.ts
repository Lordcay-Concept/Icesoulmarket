// lib/services/product.service.ts
import { DatabaseService } from './database.service'
import { Product, Category, ProductFilters } from '@/types/product.types'

export class ProductService {
  static async getProducts(filters?: ProductFilters): Promise<Product[]> {
    return DatabaseService.getProducts(filters)
  }

  static async getProductBySlug(slug: string): Promise<Product | null> {
    return DatabaseService.getProductBySlug(slug)
  }

  static async getProductById(id: string): Promise<Product | null> {
    return DatabaseService.getProductById(id)
  }

  static async getFeaturedProducts(): Promise<Product[]> {
    return DatabaseService.getFeaturedProducts()
  }

  static async getProductsByCategory(categorySlug: string): Promise<Product[]> {
    return DatabaseService.getProductsByCategory(categorySlug)
  }

  static async getCategories(): Promise<Category[]> {
    return DatabaseService.getCategories()
  }

  static async getCategoryBySlug(slug: string): Promise<Category | null> {
    return DatabaseService.getCategoryBySlug(slug)
  }
}