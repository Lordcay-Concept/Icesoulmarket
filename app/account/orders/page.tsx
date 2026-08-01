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
import { Package, ArrowLeft, Gamepad2, Sparkles, Clock, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
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

// In account/orders/page.tsx, replace getStatusConfig with this:
const getStatusConfig = (status: OrderStatus) => {
  switch (status) {
    case 'payment_pending':
      return { color: 'bg-gray-500', icon: Clock, label: 'Awaiting Payment', spin: false }
    case 'pending_verification':
      return { color: 'bg-yellow-500', icon: Clock, label: 'Awaiting Approval', spin: false }
    case 'payment_approved':
      return { color: 'bg-emerald-500', icon: CheckCircle, label: 'Order Confirmed', spin: false }
    case 'payment_rejected':
      return { color: 'bg-red-500', icon: AlertCircle, label: 'Payment Issue', spin: false }
    case 'processing':
      return { color: 'bg-blue-500', icon: Loader2, label: 'Processing', spin: true }
    case 'completed':
      return { color: 'bg-emerald-500', icon: CheckCircle, label: 'Completed', spin: false }
    case 'cancelled':
      return { color: 'bg-red-500', icon: XCircle, label: 'Cancelled', spin: false }
    case 'refunded':
      return { color: 'bg-purple-500', icon: XCircle, label: 'Refunded', spin: false }
    default:
      return { color: 'bg-gray-500', icon: Clock, label: status || 'Unknown', spin: false }
  }
}

export default function OrdersPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { formatPrice } = useCurrency()
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)

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
              <div className="space-y-4">
                {orders.map((order, index) => {
                  const statusConfig = getStatusConfig(order.status)
                  const StatusIcon = statusConfig.icon
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="glass border-emerald-400/20 rounded-2xl hover:border-emerald-400/40 transition-all">
                        <CardHeader>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <CardTitle className="text-white text-lg">
                                Order #{order.order_number}
                              </CardTitle>
                              <div className="flex items-center gap-3 mt-1">
                                <p className="text-sm text-gray-400">
                                  {new Date(order.created_at).toLocaleDateString()} at{' '}
                                  {new Date(order.created_at).toLocaleTimeString()}
                                </p>
                                <span className="text-gray-600">•</span>
                                <p className="text-sm text-gray-400">
                                  {order.order_items?.length || 0} {order.order_items?.length === 1 ? 'item' : 'items'}
                                </p>
                              </div>
                            </div>
                            <Badge className={`${statusConfig.color} text-white border-none px-3 py-1`}>
                              <StatusIcon className={`h-3 w-3 mr-1 ${statusConfig.spin ? 'animate-spin' : ''}`} />
                              {statusConfig.label}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {order.order_items?.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm py-1 border-b border-emerald-400/5 last:border-0">
                                <span className="text-gray-300">
                                  {item.product_name} × {item.quantity}
                                </span>
                                <span className="text-white font-medium">
                                  {formatPrice(item.product_price * item.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 pt-4 border-t border-emerald-400/10">
                            <div className="flex justify-between font-bold">
                              <span className="text-white">Total</span>
                              <span className="text-emerald-400 neon-glow">{formatPrice(order.total_amount)}</span>
                            </div>
                          </div>
                          {order.status === 'payment_pending' && (
                            <div className="mt-4">
                              <Link href={`/payment/${order.id}`}>
                                <Button className="w-full gaming-btn">
                                  Complete Payment
                                </Button>
                              </Link>
                            </div>
                          )}
                        </CardContent>
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