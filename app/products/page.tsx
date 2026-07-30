// app/products/page.tsx
import type { Metadata } from 'next'
import { Navbar } from '@/components/shared/Navbar'
import { Footer } from '@/components/shared/Footer'
import { ProductList } from '@/components/product/ProductList'
import { ProductFiltersComponent } from '@/components/product/ProductFilters'
import { Pagination } from '@/components/product/Pagination'
import { DatabaseService } from '@/lib/services/database.service'
import { ProductFilters } from '@/types/product.types'
import { Suspense } from 'react'
import { Gamepad2, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface ProductsPageProps {
  searchParams: {
    category?: string
    platform?: string
    search?: string
    sort?: string
    page?: string
  }
}

export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
  if (searchParams.category) {
    const categories = await DatabaseService.getCategories()
    const category = categories.find((c) => c.slug === searchParams.category)
    if (category) {
      return {
        title: category.name,
        description: category.description || `Browse ${category.name} at IcesoulMarket.`,
      }
    }
  }
  return {
    title: 'All Products',
    description: 'Browse our full collection of premium Call of Duty accounts, skins, and items.',
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  try {
    const filters: ProductFilters = {
      category: searchParams.category,
      platform: searchParams.platform,
      search: searchParams.search,
      sortBy: searchParams.sort as any,
    }

    const currentPage = Math.max(1, parseInt(searchParams.page || '1', 10) || 1)
    const pageSize = 12

    const [{ products, totalPages }, categories] = await Promise.all([
      DatabaseService.getProductsPaginated(filters, currentPage, pageSize),
      DatabaseService.getCategories(),
    ])

    const activeCategory = searchParams.category
      ? categories?.find((cat) => cat.slug === searchParams.category)
      : null

    const pageTitle = activeCategory ? activeCategory.name : 'Premium Products'
    const pageDescription = activeCategory
      ? activeCategory.description
      : 'Browse our collection of premium Call of Duty items'
    
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-20 bg-gradient-to-b from-black via-black to-emerald-950/10">
          <div className="container mx-auto px-4 py-8">

            {activeCategory && (
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                <Link href="/categories" className="hover:text-emerald-400 transition-colors">
                  Categories
                </Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-emerald-400">{activeCategory.name}</span>
              </div>
            )}

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <Gamepad2 className="h-8 w-8 text-emerald-400 neon-glow" />
                <h1 className="gaming-title text-4xl md:text-5xl">
                  {pageTitle}
                </h1>
                <Sparkles className="h-5 w-5 text-emerald-300 animate-pulse" />
              </div>
              <p className="text-gray-400 text-lg">
                {pageDescription}
              </p>
            </div>
            
            <div className="mb-8">
              <Suspense fallback={<div className="h-24" />}>
                <ProductFiltersComponent categories={categories || []} />
              </Suspense>
            </div>
            
            <ProductList 
              products={products || []}
              emptyMessage={
                activeCategory
                  ? `No products found in ${activeCategory.name}. Check back soon!`
                  : 'No products found. Check back soon for new items!'
              }
            />

            <Suspense fallback={null}>
              <Pagination currentPage={currentPage} totalPages={totalPages} />
            </Suspense>
          </div>
        </main>
        <Footer />
      </>
    )
  } catch (error) {
    console.error('Error loading products:', error)
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-20 bg-gradient-to-b from-black via-black to-emerald-950/10">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-white mb-4">Error Loading Products</h2>
              <p className="text-gray-400">Please try again later.</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }
}