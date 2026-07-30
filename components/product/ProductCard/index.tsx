// components/product/ProductCard/index.tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/types/product.types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { ShoppingCart, Star, Sparkles } from 'lucide-react'
import { useCartStore } from '@/lib/stores/cartStore'
import { toast } from '@/components/ui/use-toast'
import { useCurrency } from '@/lib/hooks/useCurrency'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)
  const { formatPrice } = useCurrency()
  
  const handleAddToCart = (): void => {
    addItem({
      id: product.id,
      product_id: product.id,
      name: product.name,
      price: product.discount_price || product.price,
      image: product.images[0] || '/images/placeholder.jpg',
      platform: product.platform[0],
    })
    
    toast({
      title: 'Added to cart! 🎮',
      description: `${product.name} has been added to your cart.`,
      variant: 'success',
    })
  }
  
  const hasDiscount = product.discount_price !== null && product.discount_price < product.price
  const discountPercentage = hasDiscount 
    ? Math.round(((product.price - product.discount_price!) / product.price) * 100)
    : 0
  
  return (
    <Card className="gaming-card group h-full flex flex-col overflow-hidden border-emerald-400/10 hover:border-emerald-400/30">
      <CardHeader className="p-0 relative">
        <Link href={`/product/${product.slug}`}>
          <div className="relative aspect-square overflow-hidden bg-gradient-to-b from-black to-emerald-950/20">
            <Image
              src={product.images[0] || '/images/placeholder.jpg'}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            {hasDiscount && (
              <Badge className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-red-600 text-white border-none px-3 py-1">
                -{discountPercentage}%
              </Badge>
            )}
            {product.is_featured && (
              <Badge className="absolute top-3 left-3 bg-gradient-to-r from-emerald-400 to-green-500 text-black border-none">
                <Star className="mr-1 h-3 w-3 fill-current" />
                Featured
              </Badge>
            )}
          </div>
        </Link>
      </CardHeader>
      
      <CardContent className="flex-grow p-4 space-y-2">
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-semibold text-lg text-white hover:text-emerald-400 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        
        {product.category && (
          <p className="text-sm text-emerald-400/70">{product.category.name}</p>
        )}
        
        <p className="text-sm text-gray-400 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex flex-wrap gap-1 pt-1">
          {product.platform.slice(0, 2).map((platform: string) => (
            <Badge key={platform} variant="outline" className="text-xs border-emerald-400/20 text-gray-300">
              {platform}
            </Badge>
          ))}
          {product.platform.length > 2 && (
            <Badge variant="outline" className="text-xs border-emerald-400/20 text-gray-300">
              +{product.platform.length - 2}
            </Badge>
          )}
        </div>
        
        <div className="flex items-baseline gap-2 pt-1">
          {hasDiscount ? (
            <>
              <span className="text-2xl font-bold text-emerald-400 neon-glow">
                {formatPrice(product.discount_price!)}
              </span>
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.price)}
              </span>
            </>
          ) : (
            <span className="text-2xl font-bold text-emerald-400 neon-glow">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full gaming-btn text-sm"
          onClick={handleAddToCart}
          disabled={product.stock_quantity <= 0}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </CardFooter>
    </Card>
  )
}