// app/checkout/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/stores/cartStore'
import { DatabaseService } from '@/lib/services/database.service'
import { Navbar } from '@/components/shared/Navbar'
import { Footer } from '@/components/shared/Footer'
import { WhatsAppButton } from '@/components/shared/WhatsAppButton'
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
  const { items, total, clearCart, hasHydrated} = useCartStore()
  const { formatPrice } = useCurrency()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<any>(null)
  const [promoError, setPromoError] = useState('')
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
    if (orderPlacedRef.current) return

    if (hasHydrated && items.length === 0 && !loading) {
      toast({
        title: 'Cart is Empty',
        description: 'Please add items to your cart before checking out.',
        variant: 'destructive',
      })
      router.push('/products')
    }
  }, [items, router, hasHydrated, loading])

  // ✅ Calculate subtotal
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const eligibleItems = appliedPromo?.restricted_category_id
    ? items.filter((item) => item.category_id === appliedPromo.restricted_category_id)
    : items

  const eligibleSubtotal = eligibleItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const discountAmount = appliedPromo ? (eligibleSubtotal * appliedPromo.discount_percentage) / 100 : 0
  const finalTotal = subtotal - discountAmount

  const handleApplyPromo = async () => {
  setPromoError('')
  if (!promoCode.trim()) return

  const supabase = DatabaseService.getSupabaseClient()
  const { data, error } = await supabase
    .from('promo_codes')
    .select('*, restricted_category:categories!restricted_category_id(name)')
    .eq('code', promoCode.toUpperCase().trim())
    .eq('is_active', true)
    .maybeSingle()

  if (error || !data) {
    setPromoError('Invalid promo code')
    setAppliedPromo(null)
    return
  }

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    setPromoError('This code has expired')
    setAppliedPromo(null)
    return
  }

  // Check that at least one cart item actually qualifies for a restricted code
  if (data.restricted_category_id) {
    const hasEligibleItem = items.some((item) => item.category_id === data.restricted_category_id)
    if (!hasEligibleItem) {
      setPromoError(`This code only applies to ${data.restricted_category?.name || 'certain'} products, which aren't in your cart`)
      setAppliedPromo(null)
      return
    }
  }

  setAppliedPromo(data)
  toast({
    title: 'Promo code applied! 🎉',
    description: data.restricted_category_id
      ? `${data.discount_percentage}% off eligible items`
      : `${data.discount_percentage}% discount applied!`,
    variant: 'success',
  })
}

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`

      const orderData = {
        order_number: orderNumber,
        user_id: user?.id,
        total_amount: finalTotal,
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
        amount: finalTotal,
        status: 'pending',
      })

      // ✅ Save promo code usage if applied
      if (appliedPromo) {
        const commissionAmount = (eligibleSubtotal * (appliedPromo.commission_percentage || 0)) / 100
        await supabase.from('promo_code_usages').insert({
          promo_code_id: appliedPromo.id,
          order_id: order.id,
          order_total: subtotal,
          discount_amount: discountAmount,
          commission_amount: commissionAmount,
        })
      }

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

  if (!hasHydrated || loading) {
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

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">
            <span className="text-emerald-400 neon-glow">Checkout</span>
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {/* Contact Information */}
                <Card className="glass border-emerald-400/20 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <User className="h-5 w-5 text-emerald-400" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-gray-300">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                        <Input 
                          id="fullName" 
                          name="fullName"
                          placeholder="John Doe" 
                          defaultValue={user?.user_metadata?.full_name || ''}
                          className="pl-9 bg-black/50 border-emerald-400/20 focus:border-emerald-400 text-white"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                        <Input 
                          id="email" 
                          name="email"
                          type="email" 
                          placeholder="john@example.com"
                          defaultValue={user?.email || ''}
                          className="pl-9 bg-black/50 border-emerald-400/20 focus:border-emerald-400 text-white"
                          required
                        />
                      </div>
                    </div>
                    <div className="bg-emerald-400/5 border border-emerald-400/20 rounded-lg p-3">
                      <p className="text-xs text-gray-400">
                        📧 Your order details and account information will be sent to this email.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Information */}
                <Card className="glass border-emerald-400/20 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Lock className="h-5 w-5 text-emerald-400" />
                      Payment Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-emerald-400/5 border border-emerald-400/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-emerald-400">
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
                        className="bg-black/50 border-emerald-400/20 focus:border-emerald-400 text-white"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="glass border-emerald-400/20 rounded-2xl sticky top-24">
                  <CardHeader>
                    <CardTitle className="text-white">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                    {items.map((item) => {
                      const isEligible = appliedPromo && eligibleItems.some((e) => e.id === item.id)
                      const itemOriginalTotal = item.price * item.quantity
                      const itemDiscountedTotal = isEligible
                        ? itemOriginalTotal - (itemOriginalTotal * appliedPromo.discount_percentage) / 100
                        : itemOriginalTotal

                      return (
                        <div
                          key={item.id}
                          className={`text-sm rounded-lg transition-all ${
                            isEligible
                              ? 'bg-emerald-400/10 border border-emerald-400/30 p-2'
                              : 'p-2'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-gray-300 flex-1">
                              {item.name} × {item.quantity}
                            </span>
                            <div className="text-right flex-shrink-0">
                              {isEligible ? (
                                <>
                                  <span className="text-gray-500 line-through text-xs block">
                                    {formatPrice(itemOriginalTotal)}
                                  </span>
                                  <span className="text-emerald-400 font-semibold">
                                    {formatPrice(itemDiscountedTotal)}
                                  </span>
                                </>
                              ) : (
                                <span className="text-white">
                                  {formatPrice(itemOriginalTotal)}
                                </span>
                              )}
                            </div>
                          </div>
                          {isEligible && (
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-[10px] font-medium bg-emerald-400/20 text-emerald-400 px-2 py-0.5 rounded-full">
                                -{appliedPromo.discount_percentage}% applied
                              </span>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                    
                    <Separator className="bg-emerald-400/20" />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-gray-400">
                        <span>Subtotal</span>
                        <span className="text-white">{formatPrice(subtotal)}</span>
                      </div>
                      
                      {appliedPromo && (
                        <div className="flex justify-between text-emerald-400">
                          <span>
                            Discount ({appliedPromo.discount_percentage}%
                            {appliedPromo.restricted_category_id ? ' on eligible items' : ''})
                          </span>
                          <span>-{formatPrice(discountAmount)}</span>
                        </div>
                      )}
                    </div>
                    
                    <Separator className="bg-emerald-400/20" />
                    
                    <div className="flex justify-between text-lg font-bold text-white">
                    <span>Total</span>
                    <span className="text-emerald-400 neon-glow" data-testid="checkout-total">
                      {formatPrice(finalTotal)}
                    </span>
                  </div>

                    {/* ✅ Promo Code Section - Inside Order Summary */}
                    <div className="pt-2">
                      <Label className="text-sm text-gray-400 mb-1 block">Promo Code</Label>
                      <div className="flex gap-2">
                        <Input
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          placeholder="Enter code"
                          className="bg-black/50 border-emerald-400/20 focus:border-emerald-400 text-white"
                          disabled={!!appliedPromo}
                        />
                        <Button 
                          type="button" 
                          onClick={handleApplyPromo} 
                          disabled={!!appliedPromo} 
                          variant="outline" 
                          className="border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/10"
                        >
                          Apply
                        </Button>
                      </div>
                      {promoError && <p className="text-sm text-red-400 mt-1">{promoError}</p>}
                      {appliedPromo && (
                        <p className="text-sm text-emerald-400 mt-1">
                          ✓ {appliedPromo.discount_percentage}% discount applied
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Truck className="h-4 w-4" />
                      <span>Instant digital delivery</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-3">
                    <Button 
                      type="submit" 
                      className="w-full gaming-btn text-lg py-6"
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
                      <Button variant="outline" className="w-full border-emerald-400/30 text-white hover:bg-emerald-400/10">
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
      <WhatsAppButton />
      <Footer />
    </>
  )
}