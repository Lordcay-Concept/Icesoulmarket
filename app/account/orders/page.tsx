// app/account/orders/page.tsx
'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { DatabaseService } from '@/lib/services/database.service'
import { Navbar } from '@/components/shared/Navbar'
import { Footer } from '@/components/shared/Footer'
import { WhatsAppButton } from '@/components/shared/WhatsAppButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Package, ArrowLeft, Gamepad2, Sparkles, Clock, CheckCircle, XCircle, Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from '@/components/ui/use-toast'
import { useCurrency } from '@/lib/hooks/useCurrency'

type OrderStatus =
  | 'payment_pending'
  | 'pending_verification'
  | 'payment_approved'
  | 'payment_rejected'
  | 'processing'
  | 'completed'
  | 'cancelled'
  | 'refunded'

interface Order {
  id: string
  order_number: string
  created_at: string
  total_amount: number
  status: OrderStatus
  order_items: {
    id: string
    product_name: string
    quantity: number
    product_price: number
  }[]
}

const getStatusConfig = (status: OrderStatus) => {
  switch (status) {
    case 'payment_pending':
      return { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: Clock, label: 'Awaiting Payment', spin: false }
    case 'pending_verification':
      return { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock, label: 'Awaiting Approval', spin: false }
    case 'payment_approved':
      return { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle, label: 'Order Confirmed', spin: false }
    case 'payment_rejected':
      return { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: AlertCircle, label: 'Payment Issue', spin: false }
    case 'processing':
      return { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Loader2, label: 'Processing', spin: true }
    case 'completed':
      return { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle, label: 'Completed', spin: false }
    case 'cancelled':
      return { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle, label: 'Cancelled', spin: false }
    case 'refunded':
      return { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: XCircle, label: 'Refunded', spin: false }
    default:
      return { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: Clock, label: status || 'Unknown', spin: false }
  }
}

export default function OrdersPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { formatPrice } = useCurrency()
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!loading && !user && isHydrated) {
      router.push('/login?redirect=/account/orders')
    }
  }, [user, loading, router, isHydrated])

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return
      
      try {
        setLoadingOrders(true)
        const data = await DatabaseService.getOrders(user.id)
        setOrders(data || [])
      } catch (error) {
        console.error('Error fetching orders:', error)
        toast({
          title: 'Error',
          description: 'Failed to load your orders. Please try again.',
          variant: 'destructive',
        })
      } finally {
        setLoadingOrders(false)
      }
    }

    if (isHydrated && user) {
      fetchOrders()
    }
  }, [user, isHydrated])

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId)
  }

  if (!isHydrated || loading || loadingOrders) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-20 bg-gradient-to-b from-black via-black to-emerald-950/10 flex items-center justify-center">
          <div className="text-gray-400">Loading orders...</div>
        </main>
      </>
    )
  }

  if (!user) {
    return null
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
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <Link href="/account" className="p-2 rounded-xl glass border border-emerald-400/20 hover:border-emerald-400/40 transition-all">
                <ArrowLeft className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
              </Link>
              <div className="flex items-center gap-3">
                <Gamepad2 className="h-8 w-8 text-emerald-400 neon-glow" />
                <h1 className="text-4xl font-bold text-white">
                  My <span className="text-emerald-400 neon-glow">Orders</span>
                </h1>
                <Sparkles className="h-5 w-5 text-emerald-300 animate-pulse" />
              </div>
              {orders.length > 0 && (
                <span className="ml-auto text-sm text-gray-400">
                  {orders.length} {orders.length === 1 ? 'order' : 'orders'}
                </span>
              )}
            </div>

            {orders.length === 0 ? (
              <Card className="glass border-emerald-400/20 rounded-2xl">
                <CardContent className="py-16 text-center">
                  <Package className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Orders Yet</h3>
                  <p className="text-gray-400 mb-6">You haven&apos;t placed any orders yet.</p>
                  <Link href="/products">
                    <Button className="gaming-btn">
                      Start Shopping
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {orders.map((order, index) => {
                  const statusConfig = getStatusConfig(order.status)
                  const StatusIcon = statusConfig.icon
                  const isExpanded = expandedOrder === order.id

                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="glass border-emerald-400/20 rounded-2xl hover:border-emerald-400/40 transition-all overflow-hidden">
                        {/* Order Header - Always visible */}
                        <div 
                          className="p-5 cursor-pointer hover:bg-emerald-400/5 transition-colors"
                          onClick={() => toggleOrderExpand(order.id)}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 flex-wrap">
                                <CardTitle className="text-white text-base sm:text-lg font-bold">
                                  #{order.order_number}
                                </CardTitle>
                                <Badge className={`${statusConfig.color} border px-2.5 py-0.5 text-xs font-medium`}>
                                  <StatusIcon className={`h-3 w-3 mr-1 inline ${statusConfig.spin ? 'animate-spin' : ''}`} />
                                  {statusConfig.label}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 mt-1.5 text-xs sm:text-sm text-gray-400">
                                <span>
                                  {new Date(order.created_at).toLocaleDateString()} at{' '}
                                  {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="text-gray-600">•</span>
                                <span>
                                  {order.order_items?.length || 0} {order.order_items?.length === 1 ? 'item' : 'items'}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="text-sm text-gray-400">Total</div>
                                <div className="text-lg font-bold text-emerald-400 neon-glow">
                                  {formatPrice(order.total_amount)}
                                </div>
                              </div>
                              <button 
                                className="p-1.5 rounded-full hover:bg-emerald-400/10 transition-colors text-gray-400 hover:text-white"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleOrderExpand(order.id)
                                }}
                              >
                                {isExpanded ? (
                                  <ChevronUp className="h-5 w-5" />
                                ) : (
                                  <ChevronDown className="h-5 w-5" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Order Details - Expandable */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: 'easeInOut' }}
                              className="overflow-hidden"
                            >
                              <Separator className="bg-emerald-400/10" />
                              <div className="p-5 space-y-4">
                                {/* Items List */}
                                <div>
                                  <h4 className="text-sm font-medium text-gray-400 mb-3">Order Items</h4>
                                  <div className="space-y-2 bg-black/30 rounded-xl p-3">
                                    {order.order_items?.map((item, idx) => (
                                      <div key={idx} className="flex justify-between items-center text-sm py-1.5 border-b border-emerald-400/5 last:border-0">
                                        <div className="flex items-center gap-3">
                                          <span className="text-gray-300">
                                            {item.product_name}
                                          </span>
                                          <span className="text-xs text-gray-500">× {item.quantity}</span>
                                        </div>
                                        <span className="text-white font-medium">
                                          {formatPrice(item.product_price * item.quantity)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Order Summary */}
                                <div className="bg-emerald-400/5 rounded-xl p-4 border border-emerald-400/10">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Subtotal</span>
                                    <span className="text-white">{formatPrice(order.total_amount)}</span>
                                  </div>
                                  <div className="flex justify-between text-sm mt-1">
                                    <span className="text-gray-400">Shipping</span>
                                    <span className="text-emerald-400">Free</span>
                                  </div>
                                  <Separator className="my-2 bg-emerald-400/10" />
                                  <div className="flex justify-between font-bold">
                                    <span className="text-white">Total</span>
                                    <span className="text-emerald-400 neon-glow">{formatPrice(order.total_amount)}</span>
                                  </div>
                                </div>

                                {/* Action Button */}
                                {order.status === 'payment_pending' && (
                                  <Link href={`/payment/${order.id}`}>
                                    <Button className="w-full gaming-btn">
                                      Complete Payment
                                    </Button>
                                  </Link>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <WhatsAppButton />
      <Footer />
    </>
  )
}