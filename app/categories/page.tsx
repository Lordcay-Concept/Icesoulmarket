// app/categories/page.tsx
import { Navbar } from '@/components/shared/Navbar'
import { Footer } from '@/components/shared/Footer'
import { DatabaseService } from '@/lib/services/database.service'
import Link from 'next/link'
import { ArrowRight, Gamepad2, Sparkles } from 'lucide-react'
import { Category } from '@/types/product.types'

export const dynamic = 'force-dynamic'

const fallbackCategories: Category[] = [
  {
    id: 'cat-accounts',
    name: 'Accounts',
    slug: 'accounts',
    description: 'Premium Call of Duty accounts with exclusive content and skins',
    icon: '👾',
    created_at: new Date().toISOString(),
  },
  {
    id: 'cat-skins',
    name: 'Skins',
    slug: 'skins',
    description: 'Exclusive weapon skins, camo collections, and cosmetic items',
    icon: '🎨',
    created_at: new Date().toISOString(),
  },
  {
    id: 'cat-themes',
    name: 'Themes',
    slug: 'themes',
    description: 'Custom themes, UI designs, and animated backgrounds',
    icon: '🖌️',
    created_at: new Date().toISOString(),
  },
  {
    id: 'cat-points',
    name: 'Points',
    slug: 'points',
    description: 'COD Points and in-game currency for battle passes',
    icon: '💰',
    created_at: new Date().toISOString(),
  },
]

const getCategoryIcon = (category: Category): string => {
  if (category.icon) return category.icon
  const name = category.name?.toLowerCase() || ''
  if (name.includes('account')) return '👾'
  if (name.includes('skin')) return '🎨'
  if (name.includes('theme')) return '🖌️'
  if (name.includes('point') || name.includes('currency')) return '💰'
  return '🎮'
}

export default async function CategoriesPage() {
  try {
    let categories: Category[] = await DatabaseService.getCategories()
    
    if (!categories || categories.length === 0) {
      categories = fallbackCategories
    }

    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-20 bg-gradient-to-b from-black via-black to-emerald-950/10">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <Gamepad2 className="h-8 w-8 text-emerald-400 neon-glow" />
                <h1 className="gaming-title text-4xl md:text-5xl">
                  Shop by Category
                </h1>
                <Sparkles className="h-5 w-5 text-emerald-300 animate-pulse" />
              </div>
              <p className="text-gray-400 text-lg">
                Find the perfect gaming items by category
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category) => {
                const icon = getCategoryIcon(category)
                return (
                  <Link
                    key={category.id}
                    href={`/products?category=${category.slug}`}
                    className="group relative p-8 rounded-xl glass border border-emerald-400/10 hover:border-emerald-400/30 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-emerald-400/10 overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 text-8xl opacity-5 group-hover:opacity-10 transition-opacity">
                      {icon}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/0 via-emerald-400/0 to-emerald-400/5 group-hover:to-emerald-400/10 transition-all" />
                    <div className="relative z-10">
                      <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                        {icon}
                      </div>
                      <h3 className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-gray-400 mt-2">{category.description}</p>
                      <div className="flex items-center gap-2 text-emerald-400 mt-4 group-hover:gap-3 transition-all">
                        <span>Browse Products</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  } catch (error) {
    console.error('❌ Error loading categories:', error)
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-20 bg-gradient-to-b from-black via-black to-emerald-950/10">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <Gamepad2 className="h-8 w-8 text-emerald-400 neon-glow" />
                <h1 className="gaming-title text-4xl md:text-5xl">
                  Shop by Category
                </h1>
                <Sparkles className="h-5 w-5 text-emerald-300 animate-pulse" />
              </div>
              <p className="text-gray-400 text-lg">
                Find the perfect gaming items by category
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {fallbackCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${category.slug}`}
                  className="group relative p-8 rounded-xl glass border border-emerald-400/10 hover:border-emerald-400/30 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-emerald-400/10 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 text-8xl opacity-5 group-hover:opacity-10 transition-opacity">
                    {category.icon}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/0 via-emerald-400/0 to-emerald-400/5 group-hover:to-emerald-400/10 transition-all" />
                  <div className="relative z-10">
                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                      {category.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-gray-400 mt-2">{category.description}</p>
                    <div className="flex items-center gap-2 text-emerald-400 mt-4 group-hover:gap-3 transition-all">
                      <span>Browse Products</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }
}