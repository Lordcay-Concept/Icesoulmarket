// app/checkout/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/stores/cartStore'
import { DatabaseService } from '@/lib/services/database.service'
import { Navbar } from '@/components/shared/Navbar'
import { Footer } from '@/components/shared/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/lib/hooks/useAuth'
import { useCurrency } from '@/lib/hooks/useCurrency'
import { toast } from '@/components/ui/use-toast'
import { CheckCircle, Lock, Truck, Shield, User, Mail } from 'lucide-react'
import Link from 'next/link'

export default function CheckoutPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const { items, total, clearCart } = useCartStore()
  const { formatPrice } = useCurrency()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  // Set to true the instant an order is placed, BEFORE the cart is cleared.
  // Refs update synchronously (no re-render wait), so the empty-cart effect
  // below sees this immediately and never fires a false "cart is empty" redirect.
  const orderPlacedRef = useRef(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!loading && !user && isHydrated) {
      toast({
        title: 'Login Required',
        description: 'Please login to proceed with checkout.',
        variant: 'destructive',
      })
      router.push('/login?redirect=/checkout')
    }
  }, [user, loading, router, isHydrated])

  useEffect(() => {
    // Skip this check entirely if we just placed an order — the cart is
    // SUPPOSED to be empty at that point, it's not a stale/invalid visit.
    if (orderPlacedRef.current) return

    if (isHydrated && items.length === 0 && !loading) {
      toast({
        title: 'Cart is Empty',
        description: 'Please add items to your cart before checking out.',
        variant: 'destructive',
      })
      router.push('/products')
    }
  }, [items, router, isHydrated, loading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`

      const orderData = {
        order_number: orderNumber,
        user_id: user?.id,
        total_amount: total,
        status: 'payment_pending',
        payment_method: 'bank_transfer',
        shipping_address: {
          email: formData.get('email'),
          fullName: formData.get('fullName'),
        },
      }

      const order = await DatabaseService.createOrder(orderData)

      const supabase = DatabaseService.getSupabaseClient()
      for (const item of items) {
        await supabase
          .from('order_items')
          .insert({
            order_id: order.id,
            product_id: item.product_id,
            product_name: item.name,
            product_price: item.price,
            quantity: item.quantity,
            product_snapshot: item,
          })
      }

      await DatabaseService.createPayment({
        order_id: order.id,
        user_id: user?.id,
        amount: total,
        status: 'pending',
      })

      // Mark the order as placed BEFORE clearing the cart, so the
      // empty-cart-guard effect above knows to skip its redirect.
      orderPlacedRef.current = true

      await DatabaseService.clearCart(user?.id!)
      clearCart()

      toast({
        title: 'Order Placed! 🎉',
        description: 'Your order has been placed. Please proceed to payment.',
        variant: 'success',
      })

      router.push(`/payment/${order.id}`)
    } catch (error) {
      console.error('Checkout error:', error)
      toast({
        title: 'Order Failed',
        description: 'There was an error processing your order. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isHydrated || loading) {
    return (
      <>
        <Navbar />
        <main className="container mx-auto px-4 py-24">
          <div className="flex items-center justify-center h-96">
            <div className="text-gray-400">Loading checkout...</div>
          </div>
        </main>
      </>
    )
  }

  if (!user || items.length === 0) {
    return null
  }

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">
            <span className="text-gaming-green">Checkout</span>
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card className="gaming-card">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <User className="h-5 w-5 text-gaming-green" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-gray-300">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input 
                          id="fullName" 
                          name="fullName"
                          placeholder="John Doe" 
                          defaultValue={user?.user_metadata?.full_name || ''}
                          className="pl-9 bg-black-light border-gaming-green/20 focus:border-gaming-green"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input 
                          id="email" 
                          name="email"
                          type="email" 
                          placeholder="john@example.com"
                          defaultValue={user?.email || ''}
                          className="pl-9 bg-black-light border-gaming-green/20 focus:border-gaming-green"
                          required
                        />
                      </div>
                    </div>
                    <div className="bg-gaming-green/5 border border-gaming-green/20 rounded-lg p-3">
                      <p className="text-xs text-gray-400">
                        📧 Your order details and account information will be sent to this email.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="gaming-card">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Lock className="h-5 w-5 text-gaming-green" />
                      Payment Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-gaming-green/5 border border-gaming-green/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-gaming-green">
                        <Shield className="h-5 w-5" />
                        <span className="font-semibold">Secure Bank Transfer</span>
                      </div>
                      <p className="text-sm text-gray-400 mt-2">
                        After placing your order, you will receive bank transfer details to complete your payment.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-gray-300">Order Notes (Optional)</Label>
                      <Input 
                        id="notes" 
                        name="notes"
                        placeholder="Any special instructions..." 
                        className="bg-black-light border-gaming-green/20 focus:border-gaming-green"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-1">
                <Card className="gaming-card sticky top-24">
                  <CardHeader>
                    <CardTitle className="text-white">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-300">
                            {item.name} × {item.quantity}
                          </span>
                          <span className="text-white">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <Separator className="bg-gaming-green/20" />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-gray-400">
                        <span>Subtotal</span>
                        <span>{formatPrice(subtotal)}</span>
                      </div>
                    </div>
                    
                    <Separator className="bg-gaming-green/20" />
                    
                    <div className="flex justify-between text-lg font-bold text-white">
                      <span>Total</span>
                      <span className="text-gaming-green">{formatPrice(subtotal)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Truck className="h-4 w-4" />
                      <span>Instant digital delivery</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-3">
                    <Button 
                      type="submit" 
                      className="w-full bg-gaming-green text-black hover:bg-gaming-green/80 text-lg py-6"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                          Processing...
                        </div>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-5 w-5" />
                          Place Order
                        </>
                      )}
                    </Button>
                    <Link href="/cart" className="w-full">
                      <Button variant="outline" className="w-full border-gaming-green/30 text-white hover:bg-gaming-green/10">
                        Back to Cart
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  )
}