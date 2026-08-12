// app/sitemap.ts
import { MetadataRoute } from 'next'

// ✅ Remove revalidate - Next.js handles this for sitemaps
// export const revalidate = 0  // <- REMOVE THIS

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://icesoulmarket.com'

  try {
    // ✅ Dynamically import DatabaseService only when needed
    const { DatabaseService } = await import('@/lib/services/database.service')
    
    const [products, categories] = await Promise.all([
      DatabaseService.getProducts(),
      DatabaseService.getCategories(),
    ])

    const staticPages: MetadataRoute.Sitemap = [
      { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
      { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
      { url: `${baseUrl}/categories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
      { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    ]

    const productPages: MetadataRoute.Sitemap = (products || []).map((product: any) => ({
      url: `${baseUrl}/product/${product.slug}`,
      lastModified: new Date(product.updated_at || product.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    const categoryPages: MetadataRoute.Sitemap = (categories || []).map((category: any) => ({
      url: `${baseUrl}/products?category=${category.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

    return [...staticPages, ...productPages, ...categoryPages]
    
  } catch (error) {
    console.error('Sitemap generation error:', error)
    // ✅ Return at least static pages if database fails
    return [
      { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
      { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
      { url: `${baseUrl}/categories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
      { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    ]
  }
}