// app/product/[slug]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Navbar } from '@/components/shared/Navbar'
import { Footer } from '@/components/shared/Footer'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ProductService } from '@/lib/services/product.service'
import { Star, Check, Shield, Truck } from 'lucide-react'
import { ProductList } from '@/components/product/ProductList'
import { AddToCartButton } from '@/components/product/AddToCartButton'
import { ProductPrice } from '@/components/product/ProductPrice'
import { ReviewForm } from '@/components/product/ReviewForm'
import { ReviewList } from '@/components/product/ReviewList'
import { ProductGallery } from '@/components/product/ProductGallery'
import { WhatsAppButton } from '@/components/shared/WhatsAppButton'
import { Product } from '@/types/product.types'
import { createClient } from '@/lib/supabase/server'

interface ProductDetailPageProps {
  params: {
    slug: string
  }
}

type FeatureValue = string | number | boolean | string[]
type FeatureEntry = [string, FeatureValue]

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const product = await ProductService.getProductBySlug(params.slug)

  if (!product) {
    return { title: 'Product Not Found' }
  }

  const price = product.discount_price || product.price

  return {
    title: product.name,
    description: product.description?.slice(0, 160) || `Buy ${product.name} at IcesoulMarket. Secure payment, instant delivery.`,
    openGraph: {
      title: product.name,
      description: product.description?.slice(0, 160),
      images: product.images?.[0] ? [{ url: product.images[0], width: 800, height: 800, alt: product.name }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description?.slice(0, 160),
      images: product.images?.[0] ? [product.images[0]] : [],
    },
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const product: Product | null = await ProductService.getProductBySlug(params.slug)
  
  if (!product) {
    notFound()
  }
  
  const relatedProducts: Product[] = await ProductService.getProducts({
    category: product.category?.slug,
  })

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, profile:profiles(username, avatar_url)')
    .eq('product_id', product.id)
    .order('created_at', { ascending: false })

  const reviewList = reviews || []
  const reviewCount = reviewList.length
  const avgRating = reviewCount > 0
    ? reviewList.reduce((sum, r) => sum + r.rating, 0) / reviewCount
    : 0

  const existingReview = user
    ? reviewList.find((r) => r.user_id === user.id) || null
    : null

  let hasPurchased = false
  if (user) {
    const { data } = await supabase.rpc('has_purchased_product', {
      p_product_id: product.id,
      p_user_id: user.id,
    })
    hasPurchased = !!data
  }
  
  const hasDiscount: boolean = product.discount_price !== null && product.discount_price < product.price
  const discountPercentage: number = hasDiscount 
    ? Math.round(((product.price - product.discount_price!) / product.price) * 100)
    : 0
  
  const productFeatures: FeatureEntry[] = Object.entries(product.features || {})
    .filter((entry): entry is [string, FeatureValue] => {
      const [, value] = entry
      return value !== undefined && value !== null
    })
    .map(([key, value]) => [key, value as FeatureValue])
  
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="relative">
            <ProductGallery images={product.images} productName={product.name} />
            {hasDiscount && (
              <Badge className="absolute top-4 right-4 z-10 bg-red-500 text-white text-lg px-4 py-2">
                -{discountPercentage}%
              </Badge>
            )}
          </div>
          
          {/* Product Info */}
          <div className="space-y-6">
            <div>
              {product.category && (
                <Badge className="mb-2 bg-emerald-400/20 text-emerald-400">
                  {product.category.name}
                </Badge>
              )}
              <h1 className="text-3xl font-bold text-white">{product.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex text-emerald-400">
                  {[...Array(5)].map((_: unknown, index: number) => (
                    <Star
                      key={index}
                      className={`h-4 w-4 ${
                        index < Math.round(avgRating) ? 'fill-current' : 'text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-400">
                  {reviewCount > 0
                    ? `${avgRating.toFixed(1)} out of 5 (${reviewCount} review${reviewCount === 1 ? '' : 's'})`
                    : 'No reviews yet'}
                </span>
              </div>
            </div>
            
            <ProductPrice
              price={product.price}
              discountPrice={product.discount_price}
              hasDiscount={hasDiscount}
              stockQuantity={product.stock_quantity}
            />
            
            <p className="text-gray-300 leading-relaxed">
              {product.description}
            </p>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-white">Platforms:</h3>
              <div className="flex flex-wrap gap-2">
                {product.platform.map((platform: string) => (
                  <Badge key={platform} className="bg-black-light border-emerald-400/30">
                    {platform}
                  </Badge>
                ))}
              </div>
            </div>
            
            {productFeatures.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-white">Features:</h3>
                <ul className="space-y-1">
                  {productFeatures.map(([key, value]: FeatureEntry) => (
                    <li key={key} className="flex items-center gap-2 text-gray-300">
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                      <span>
                        {Array.isArray(value) ? (value as string[]).join(', ') : String(value)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="flex flex-col gap-3 pt-4">
              <AddToCartButton product={product} />
            </div>

            <WhatsAppButton
              variant="inline"
              message={`Hi! I'm interested in "${product.name}" (€${product.price}). Can you tell me more?`}
            />
            
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="flex flex-col items-center text-center p-3 rounded-lg bg-black-light">
                <Shield className="h-6 w-6 text-emerald-400 mb-1" />
                <span className="text-xs text-gray-400">Secure Payment</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-lg bg-black-light">
                <Truck className="h-6 w-6 text-emerald-400 mb-1" />
                <span className="text-xs text-gray-400">Instant Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-lg bg-black-light">
                <Star className="h-6 w-6 text-emerald-400 mb-1" />
                <span className="text-xs text-gray-400">Trusted Seller</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews & Ratings */}
        <div className="mt-16">
          <Separator className="bg-emerald-400/20 mb-8" />
          <h2 className="text-2xl font-bold text-white mb-6">Reviews & Ratings</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* ✅ Pass current user ID to ReviewList - NO onReviewUpdated */}
            <ReviewList 
              reviews={reviewList} 
              currentUserId={user?.id}
            />

            <div>
              {!user && (
                <p className="text-gray-400 p-4 rounded-lg bg-black-light border border-emerald-400/10">
                  Please log in to write a review.
                </p>
              )}
              {user && !hasPurchased && (
                <p className="text-gray-400 p-4 rounded-lg bg-black-light border border-emerald-400/10">
                  Only customers who have purchased this product can leave a review.
                </p>
              )}
              {user && hasPurchased && (
                <ReviewForm
                  productId={product.id}
                  userId={user.id}
                  existingReview={existingReview}
                />
              )}
            </div>
          </div>
        </div>
        
        {/* Related Products */}
        {relatedProducts.filter((p: Product) => p.id !== product.id).length > 0 && (
          <div className="mt-16">
            <Separator className="bg-emerald-400/20 mb-8" />
            <ProductList 
              products={relatedProducts.filter((p: Product) => p.id !== product.id).slice(0, 4)}
              title="Related Products"
            />
          </div>
        )}
      </main>
      <WhatsAppButton />
      <Footer />
    </>
  )
}