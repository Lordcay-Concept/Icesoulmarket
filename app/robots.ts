// app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/account/', '/checkout', '/payment/'],
    },
    sitemap: 'https://icesoulmarket.com/sitemap.xml',
  }
}