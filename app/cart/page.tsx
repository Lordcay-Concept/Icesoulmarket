// app/cart/page.tsx
'use client'

import { useCartStore } from '@/lib/stores/cartStore'
import { Navbar } from '@/components/shared/Navbar'
import { Footer } from '@/components/shared/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Gamepad2, Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { toast } from '@/components/ui/use-toast'
import { motion } from 'framer-motion'
import { useCurrency } from '@/lib/hooks/useCurrency'

export default function CartPage() {
  const { 
    items, 
    total, 
    updateQuantity, 
    removeItem,
    clearCart 
  } = useCartStore()
  
  const [isHydrated, setIsHydrated] = useState(false)
  const { formatPrice } = useCurrency()
  
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  const handleUpdateQuantity = (id: string, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change
    if (newQuantity === 0) {
      removeItem(id)
      toast({
        title: 'Removed from cart',
        description: 'Item has been removed from your cart.',
        variant: 'default',
      })
    } else {
      updateQuantity(id, newQuantity)
    }
  }

  const handleClearCart = () => {
    if (items.length === 0) return
    clearCart()
    toast({
      title: 'Cart cleared',
      description: 'All items have been removed from your cart.',
      variant: 'default',
    })
  }

  if (!isHydrated) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-20 bg-gradient-to-b from-black via-black to-emerald-950/10 flex items-center justify-center">
          <div className="text-gray-400">Loading cart...</div>
        </main>
        <Footer />
      </>
    )
  }

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-20 bg-gradient-to-b from-black via-black to-emerald-950/10">
          <div className="container mx-auto px-4 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl mx-auto text-center py-16"
            >
              <div className="text-8xl mb-6">🛒</div>
              <h1 className="text-4xl font-bold text-white mb-4">Your Cart is Empty</h1>
              <p className="text-gray-400 mb-8">Looks like you haven&apos;t added any items to your cart yet.</p>
              <Link href="/products">
                <Button className="gaming-btn text-lg px-8 py-6">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Start Shopping
                </Button>
              </Link>
            </motion.div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 bg-gradient-to-b from-black via-black to-emerald-950/10">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Gamepad2 className="h-8 w-8 text-emerald-400 neon-glow" />
                <h1 className="text-4xl font-bold text-white">
                  Shopping <span className="text-emerald-400 neon-glow">Cart</span>
                </h1>
                <Sparkles className="h-5 w-5 text-emerald-300 animate-pulse" />
              </div>
              <Button 
                variant="ghost" 
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                onClick={handleClearCart}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Cart
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="glass border-emerald-400/20 rounded-2xl hover:border-emerald-400/40 transition-all">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {/* Product Image */}
                          <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-black/50 border border-emerald-400/10">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          
                          {/* Product Info */}
                          <div className="flex-grow space-y-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-white">{item.name}</h3>
                                {item.platform && (
                                  <p className="text-sm text-gray-400">{item.platform}</p>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                                onClick={() => {
                                  removeItem(item.id)
                                  toast({
                                    title: 'Removed from cart',
                                    description: `${item.name} has been removed.`,
                                    variant: 'default',
                                  })
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 border-emerald-400/30 hover:bg-emerald-400/10 text-white"
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center text-white font-medium">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 border-emerald-400/30 hover:bg-emerald-400/10 text-white"
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-emerald-400 neon-glow">
                                  {formatPrice(item.price * item.quantity)}
                                </div>
                                <div className="text-sm text-gray-400">
                                  {formatPrice(item.price)} each
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card className="glass border-emerald-400/20 rounded-2xl sticky top-24">
                    <CardHeader>
                      <CardTitle className="text-white">Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-gray-400">
                          <span>Subtotal</span>
                          <span className="text-white">{formatPrice(total)}</span>
                        </div>
                      </div>
                      
                      <Separator className="bg-emerald-400/10" />
                      
                      <div className="flex justify-between text-lg font-bold text-white">
                        <span>Total</span>
                        <span className="text-emerald-400 neon-glow">{formatPrice(total)}</span>
                      </div>

                      <div className="text-xs text-gray-400">
                        {items.length} {items.length === 1 ? 'item' : 'items'} in cart
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Link href="/checkout" className="w-full">
                        <Button className="w-full gaming-btn text-lg py-6">
                          Proceed to Checkout
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  )
}