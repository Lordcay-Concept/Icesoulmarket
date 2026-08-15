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
import { 
  CheckCircle, 
  Lock, 
  Truck, 
  Shield, 
  User, 
  Mail, 
  Gamepad2, 
  KeyRound,
  ChevronRight,
  ShoppingBag,
  CreditCard,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

export default function CheckoutPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const { items, clearCart, hasHydrated } = useCartStore()
  const { formatPrice } = useCurrency()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<any>(null)
  const [promoError, setPromoError] = useState('')
  const [activeStep, setActiveStep] = useState(1)
  const orderPlacedRef = useRef(false)

  // Category lookups + optional fulfillment fields
  const [pointsCategoryId, setPointsCategoryId] = useState<string | null>(null)
  const [accountsCategoryId, setAccountsCategoryId] = useState<string | null>(null)
  const [coinsUsername, setCoinsUsername] = useState('')
  const [coinsPassword, setCoinsPassword] = useState('')
  const [deliveryEmail, setDeliveryEmail] = useState('')

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Fetch the real category IDs for Points and Accounts once, on mount
  useEffect(() => {
    const fetchCategoryIds = async () => {
      const supabase = DatabaseService.getSupabaseClient()
      const { data } = await supabase
        .from('categories')
        .select('id, slug')
        .in('slug', ['points', 'accounts'])

      data?.forEach((cat: any) => {
        if (cat.slug === 'points') setPointsCategoryId(cat.id)
        if (cat.slug === 'accounts') setAccountsCategoryId(cat.id)
      })
    }
    fetchCategoryIds()
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

  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const eligibleItems = appliedPromo?.restricted_category_id
    ? items.filter((item) => item.category_id === appliedPromo.restricted_category_id)
    : items

  const eligibleSubtotal = eligibleItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const discountAmount = appliedPromo ? (eligibleSubtotal * appliedPromo.discount_percentage) / 100 : 0
  const finalTotal = subtotal - discountAmount

  // Does the cart contain items from these categories?
  const hasPointsItem = pointsCategoryId
    ? items.some((item) => item.category_id === pointsCategoryId)
    : false
  const hasAccountsItem = accountsCategoryId
    ? items.some((item) => item.category_id === accountsCategoryId)
    : false

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
        coins_login_username: coinsUsername || null,
        coins_login_password: coinsPassword || null,
        account_delivery_email: deliveryEmail || null,
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

      // Notify admin
      fetch('/api/notify/new-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: order.order_number,
          amount: formatPrice(finalTotal),
          customerEmail: formData.get('email'),
        }),
      }).catch((err) => console.error('New order notification failed:', err))

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
      <main className="min-h-screen pt-20 bg-gradient-to-b from-black via-black to-theme-950/10">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-theme-10">
                  <ShoppingBag className="h-6 w-6 text-theme" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    <span className="text-theme neon-glow">Secure</span> Checkout
                  </h1>
                  <p className="text-sm text-gray-400">
                    Complete your purchase in a few easy steps
                  </p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <span className="text-theme">●</span> Secure
                </span>
                <span className="text-gray-600">|</span>
                <span className="flex items-center gap-1">
                  <span className="text-theme">●</span> Encrypted
                </span>
                <span className="text-gray-600">|</span>
                <span className="flex items-center gap-1">
                  <span className="text-theme">●</span> Trusted
                </span>
              </div>
            </div>

            {/* Steps Indicator */}
            <div className="mt-6 flex items-center justify-between max-w-2xl">
              {[
                { step: 1, label: 'Contact' },
                { step: 2, label: 'Details' },
                { step: 3, label: 'Payment' },
              ].map((s, index) => (
                <div key={s.step} className="flex items-center flex-1">
                  <div 
                    className={`flex items-center gap-2 cursor-pointer ${
                      activeStep >= s.step ? 'text-theme' : 'text-gray-500'
                    }`}
                    onClick={() => setActiveStep(s.step)}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      activeStep >= s.step 
                        ? 'bg-theme text-black' 
                        : 'bg-gray-800 text-gray-400'
                    }`}>
                      {s.step}
                    </div>
                    <span className="text-sm hidden sm:inline">{s.label}</span>
                  </div>
                  {index < 2 && (
                    <div className={`flex-1 h-0.5 mx-2 transition-all ${
                      activeStep > s.step ? 'bg-theme' : 'bg-gray-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content - Left & Center */}
              <div className="lg:col-span-2 space-y-6">
                {/* Step 1: Contact Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="glass border-theme-20 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <User className="h-5 w-5 text-theme" />
                        Contact Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-gray-300 text-sm">Full Name</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-theme" />
                            <Input 
                              id="fullName" 
                              name="fullName"
                              placeholder="John Doe" 
                              defaultValue={user?.user_metadata?.full_name || ''}
                              className="pl-9 bg-black/50 border-theme-20 focus:border-theme text-white h-12 rounded-xl transition-all"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-300 text-sm">Email Address</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-theme" />
                            <Input 
                              id="email" 
                              name="email"
                              type="email" 
                              placeholder="john@example.com"
                              defaultValue={user?.email || ''}
                              className="pl-9 bg-black/50 border-theme-20 focus:border-theme text-white h-12 rounded-xl transition-all"
                              required
                            />
                          </div>
                        </div>
                      </div>
                      <div className="bg-theme-5 border border-theme-20 rounded-xl p-3 flex items-start gap-2">
                        <Info className="h-4 w-4 text-theme flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-gray-400">
                          Your order confirmation and delivery details will be sent to this email.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Step 2: Order Details */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Card className="glass border-theme-20 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5 text-theme" />
                        Order Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Items Summary */}
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {items.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 py-2 border-b border-theme-10 last:border-0">
                            <div className="w-12 h-12 rounded-lg bg-black/50 border border-theme-10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                              <Image src={item.image} alt={item.name} className="w-full h-full object-contain" width={48} height={48} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium truncate">{item.name}</p>
                              <p className="text-gray-400 text-xs">× {item.quantity}</p>
                            </div>
                            <p className="text-white font-medium">{formatPrice(item.price * item.quantity)}</p>
                          </div>
                        ))}
                      </div>

                      {/* Promo Code */}
                      <div className="pt-2">
                        <Label className="text-sm text-gray-400 mb-1 block">Have a promo code?</Label>
                        <div className="flex gap-2">
                          <Input
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            placeholder="Enter code"
                            className="bg-black/50 border-theme-20 focus:border-theme text-white h-12 rounded-xl"
                            disabled={!!appliedPromo}
                          />
                          <Button 
                            type="button" 
                            onClick={handleApplyPromo} 
                            disabled={!!appliedPromo} 
                            variant="outline" 
                            className="border-theme-30 text-theme hover:bg-theme-10 h-12 px-6 rounded-xl"
                          >
                            Apply
                          </Button>
                        </div>
                        {promoError && <p className="text-sm text-red-400 mt-1">{promoError}</p>}
                        {appliedPromo && (
                          <p className="text-sm text-theme mt-1 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            {appliedPromo.discount_percentage}% discount applied
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Step 3: Fulfillment Details (Conditional) */}
                {(hasPointsItem || hasAccountsItem) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <Card className="glass border-theme-20 rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <KeyRound className="h-5 w-5 text-theme" />
                          Delivery Preferences
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-gray-400">
                          Provide additional details to help us deliver your digital items faster.
                        </p>

                        {hasPointsItem && (
                          <div className="space-y-3 p-4 rounded-xl bg-theme-5 border border-theme-20">
                            <h4 className="text-white font-medium text-sm">Coins/Points Delivery</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label className="text-gray-400 text-xs">Username / Email</Label>
                                <Input
                                  value={coinsUsername}
                                  onChange={(e) => setCoinsUsername(e.target.value)}
                                  placeholder="Your game account username"
                                  className="bg-black/50 border-theme-20 focus:border-theme text-white h-10 rounded-lg text-sm"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-gray-400 text-xs">Password</Label>
                                <Input
                                  type="password"
                                  value={coinsPassword}
                                  onChange={(e) => setCoinsPassword(e.target.value)}
                                  placeholder="Your game account password"
                                  className="bg-black/50 border-theme-20 focus:border-theme text-white h-10 rounded-lg text-sm"
                                />
                              </div>
                            </div>
                            <p className="text-xs text-gray-500">Optional — you can also arrange this later</p>
                          </div>
                        )}

                        {hasAccountsItem && (
                          <div className="space-y-3 p-4 rounded-xl bg-theme-5 border border-theme-20">
                            <h4 className="text-white font-medium text-sm">Account Delivery</h4>
                            <div className="space-y-1">
                              <Label className="text-gray-400 text-xs">Delivery Email</Label>
                              <Input
                                type="email"
                                value={deliveryEmail}
                                onChange={(e) => setDeliveryEmail(e.target.value)}
                                placeholder="account-recipient@example.com"
                                className="bg-black/50 border-theme-20 focus:border-theme text-white h-10 rounded-lg text-sm"
                              />
                            </div>
                            <p className="text-xs text-gray-500">Optional — we&apos;ll use your contact email if left blank</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>

              {/* Sidebar - Order Summary */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="sticky top-24"
                >
                  <Card className="glass border-theme-20 rounded-2xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-theme" />
                        Order Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Subtotal</span>
                          <span className="text-white">{formatPrice(subtotal)}</span>
                        </div>
                        {appliedPromo && (
                          <div className="flex justify-between text-sm text-theme">
                            <span>Discount ({appliedPromo.discount_percentage}%)</span>
                            <span>-{formatPrice(discountAmount)}</span>
                          </div>
                        )}
                        <Separator className="bg-theme-20" />
                        <div className="flex justify-between text-lg font-bold">
                          <span className="text-white">Total</span>
                          <span className="text-theme neon-glow">{formatPrice(finalTotal)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Truck className="h-4 w-4" />
                        <span>Instant digital delivery</span>
                      </div>

                      <Separator className="bg-theme-20" />

                      {/* Security Badges */}
                      <div className="grid grid-cols-3 gap-2 pt-2">
                        <div className="flex flex-col items-center text-center p-2 rounded-lg bg-theme-5 border border-theme-10">
                          <Shield className="h-5 w-5 text-theme mb-1" />
                          <span className="text-[10px] text-gray-400">Secure</span>
                        </div>
                        <div className="flex flex-col items-center text-center p-2 rounded-lg bg-theme-5 border border-theme-10">
                          <Lock className="h-5 w-5 text-theme mb-1" />
                          <span className="text-[10px] text-gray-400">Encrypted</span>
                        </div>
                        <div className="flex flex-col items-center text-center p-2 rounded-lg bg-theme-5 border border-theme-10">
                          <Sparkles className="h-5 w-5 text-theme mb-1" />
                          <span className="text-[10px] text-gray-400">Trusted</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-3 pt-2">
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
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </>
                        )}
                      </Button>
                      <Link href="/cart" className="w-full">
                        <Button variant="outline" className="w-full border-theme-30 text-white hover:bg-theme-10 h-12 rounded-xl">
                          Back to Cart
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </motion.div>
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