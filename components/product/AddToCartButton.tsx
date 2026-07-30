'use client'

import { Button } from '@/components/ui/button'
import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/lib/stores/cartStore'
import { toast } from '@/components/ui/use-toast'
import { Product } from '@/types/product.types'

interface AddToCartButtonProps {
  product: Product
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem)

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

  return (
    <Button 
      className="w-full bg-gaming-green text-black hover:bg-gaming-green/80 text-lg py-6"
      onClick={handleAddToCart}
      disabled={product.stock_quantity <= 0}
    >
      <ShoppingCart className="mr-2 h-5 w-5" />
      {product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
    </Button>
  )
}