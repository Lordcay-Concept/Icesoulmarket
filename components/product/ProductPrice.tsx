'use client'

import { useCurrency } from '@/lib/hooks/useCurrency'
import { Badge } from '@/components/ui/badge'

interface ProductPriceProps {
  price: number
  discountPrice: number | null
  hasDiscount: boolean
  stockQuantity: number
}

export function ProductPrice({ price, discountPrice, hasDiscount, stockQuantity }: ProductPriceProps) {
  const { formatPrice } = useCurrency()

  return (
    <div className="flex items-baseline gap-3">
      {hasDiscount ? (
        <>
          <span className="text-4xl font-bold text-gaming-green">
            {formatPrice(discountPrice!)}
          </span>
          <span className="text-xl text-gray-400 line-through">
            {formatPrice(price)}
          </span>
        </>
      ) : (
        <span className="text-4xl font-bold text-gaming-green">
          {formatPrice(price)}
        </span>
      )}
      <Badge variant="outline" className="border-gaming-green/30">
        {stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
      </Badge>
    </div>
  )
}