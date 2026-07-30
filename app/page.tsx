// app/page.tsx
import { Navbar } from '@/components/shared/Navbar'
import { Footer } from '@/components/shared/Footer'
import { Hero } from '@/components/shared/Hero'
import { ProductList } from '@/components/product/ProductList'
import { DatabaseService } from '@/lib/services/database.service'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  ArrowRight, 
  Gamepad2, 
  Sparkles, 
  Trophy, 
  Users, 
  TrendingUp,
  Shield,
  Zap,
  Crown,
  Coins,
  Palette,
  Package
} from 'lucide-react'

export default async function Home() {
  const featuredProducts = await DatabaseService.getFeaturedProducts()
  const categories = await DatabaseService.getCategories()
  
  // Get icon for category
  const getCategoryIcon = (icon: string | null) => {
    switch(icon) {
      case '👾': return <Gamepad2 className="h-8 w-8" />
      case '🎨': return <Palette className="h-8 w-8" />
      case '💰': return <Coins className="h-8 w-8" />
      case '📦': return <Package className="h-8 w-8" />
      default: return <Gamepad2 className="h-8 w-8" />
    }
  }
  
  // Stats data
  const stats = [
    { icon: Users, label: 'Active Gamers', value: '10,000+' },
    { icon: Trophy, label: 'Accounts Sold', value: '5,000+' },
    { icon: TrendingUp, label: 'Items Listed', value: '500+' },
    { icon: Shield, label: 'Secure Transactions', value: '100%' },
  ]
  
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        
        {/* Stats Section */}
        <section className="py-12 bg-gradient-to-b from-transparent via-black to-black border-t border-emerald-400/5">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className="glass rounded-xl p-6 text-center border border-emerald-400/10 hover:border-emerald-400/30 transition-all hover:scale-105"
                >
                  <stat.icon className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white neon-glow">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Featured Products */}
        <section className="py-16 bg-gradient-to-b from-black via-black/95 to-emerald-950/5">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Crown className="h-6 w-6 text-emerald-400" />
                  <h2 className="text-3xl font-bold text-white">
                    <span className="text-emerald-400 neon-glow">Featured</span> Items
                  </h2>
                </div>
                <p className="text-gray-400">Handpicked premium Call of Duty products for elite gamers</p>
              </div>
              <Link href="/products">
                <Button variant="ghost" className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 group">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            <ProductList products={featuredProducts.slice(0, 4)} />
          </div>
        </section>
        
        {/* Categories Section - Now with proper context */}
         <section className="py-16 bg-gradient-to-b from-emerald-950/5 via-black to-black border-t border-emerald-400/10">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Gamepad2 className="h-8 w-8 text-emerald-400 neon-glow" />
                <h2 className="text-4xl font-bold text-white">
                  Shop by <span className="text-emerald-400 neon-glow">Category</span>
                </h2>
              </div>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Find exactly what you&apos;re looking for - from premium accounts to exclusive skins
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Accounts */}
              <Link
                href="/products?category=accounts"
                className="group relative p-6 rounded-xl glass border border-emerald-400/10 hover:border-emerald-400/30 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-emerald-400/10 overflow-hidden"
              >
                <div className="absolute top-0 right-0 text-7xl opacity-5 group-hover:opacity-10 transition-opacity">👾</div>
                <div className="relative z-10">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">👾</div>
                  <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                    Accounts
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">Premium COD accounts with exclusive content</p>
                </div>
              </Link>
              
              {/* Skins */}
              <Link
                href="/products?category=skins"
                className="group relative p-6 rounded-xl glass border border-emerald-400/10 hover:border-emerald-400/30 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-emerald-400/10 overflow-hidden"
              >
                <div className="absolute top-0 right-0 text-7xl opacity-5 group-hover:opacity-10 transition-opacity">🎨</div>
                <div className="relative z-10">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🎨</div>
                  <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                    Skins
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">Exclusive weapon skins and camo collections</p>
                </div>
              </Link>
              
              {/* Themes */}
              <Link
                href="/products?category=themes"
                className="group relative p-6 rounded-xl glass border border-emerald-400/10 hover:border-emerald-400/30 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-emerald-400/10 overflow-hidden"
              >
                <div className="absolute top-0 right-0 text-7xl opacity-5 group-hover:opacity-10 transition-opacity">🖌️</div>
                <div className="relative z-10">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🖌️</div>
                  <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                    Themes
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">Custom UI designs and animated backgrounds</p>
                </div>
              </Link>
              
              {/* Points */}
              <Link
                href="/products?category=points"
                className="group relative p-6 rounded-xl glass border border-emerald-400/10 hover:border-emerald-400/30 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-emerald-400/10 overflow-hidden"
              >
                <div className="absolute top-0 right-0 text-7xl opacity-5 group-hover:opacity-10 transition-opacity">💰</div>
                <div className="relative z-10">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">💰</div>
                  <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                    Points
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">COD Points and in-game currency</p>
                </div>
              </Link>
            </div>
          </div>
        </section>
        
        {/* Why Choose Us */}
        <section className="py-16 bg-gradient-to-b from-black to-black/95 border-t border-emerald-400/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-3">
                Why Choose <span className="text-emerald-400 neon-glow">Icesoulmarket</span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                The premier destination for Call of Duty gamers worldwide
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Shield,
                  title: 'Secure Transactions',
                  description: 'All payments are processed securely with bank transfer verification'
                },
                {
                  icon: Zap,
                  title: 'Instant Delivery',
                  description: 'Get your items immediately after payment confirmation'
                },
                {
                  icon: Users,
                  title: 'Trusted Community',
                  description: 'Join thousands of satisfied gamers who trust Icesoulmarket'
                }
              ].map((item, index) => (
                <div 
                  key={index}
                  className="glass rounded-xl p-8 text-center border border-emerald-400/10 hover:border-emerald-400/30 transition-all hover:scale-105"
                >
                  <item.icon className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-emerald-950/20 via-black to-emerald-950/20 border-t border-emerald-400/10">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to <span className="text-emerald-400 neon-glow">Level Up</span> Your Gaming?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto mb-8">
              Join thousands of gamers who have upgraded their Call of Duty experience with Icesoulmarket
            </p>
            <Link href="/products">
              <Button className="gaming-btn text-lg px-8 py-6">
                Start Shopping Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}