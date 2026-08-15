// app/admin/orders/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { DatabaseService } from '@/lib/services/database.service'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useCurrency } from '@/lib/hooks/useCurrency'
import { 
  ShoppingBag, 
  Search,
  CheckCircle,
  XCircle,
  Clock,
  PlayCircle,
  ChevronDown,
  ChevronUp,
  User,
  Package,
  CreditCard,
  Calendar,
  KeyRound,
  Gamepad2,
  Mail,
  Trash2
} from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null)
  const { formatPrice } = useCurrency()

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const data = await DatabaseService.getOrders('all')
      setOrders(data)
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    if (status === 'cancelled') {
      if (!confirm('Are you sure you want to cancel this order? This cannot be undone.')) {
        return
      }
    }
    try {
      await DatabaseService.updateOrderStatus(orderId, status)
      toast({
        title: 'Success!',
        description: `Order status updated`,
        variant: 'success',
      })
      loadOrders()
    } catch (error) {
      console.error('Error updating order:', error)
      toast({
        title: 'Error',
        description: 'Failed to update order',
        variant: 'destructive',
      })
    }
  }

  // ✅ NEW: Delete order function - Only for cancelled orders
  const deleteOrder = async (orderId: string) => {
    // ✅ Show confirmation alert
    if (!confirm('⚠️ Are you sure you want to permanently delete this cancelled order? This action cannot be undone.')) {
      return
    }

    setDeletingOrderId(orderId)
    try {
      const supabase = DatabaseService.getSupabaseClient()
      
      // ✅ First delete order items (foreign key constraint)
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId)

      if (itemsError) throw itemsError

      // ✅ Then delete the order
      const { error: orderError } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId)

      if (orderError) throw orderError

      toast({
        title: 'Order Deleted!',
        description: 'The cancelled order has been permanently removed.',
        variant: 'success',
      })
      
      // ✅ Refresh the orders list
      loadOrders()
    } catch (error) {
      console.error('Error deleting order:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete order. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setDeletingOrderId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-theme/20 text-theme border-theme-500/30'
      case 'processing': return 'bg-blue-400/20 text-blue-400 border-blue-500/30'
      case 'payment_approved': return 'bg-theme/20 text-theme border-theme-500/30'
      case 'pending_verification': return 'bg-yellow-400/20 text-yellow-400 border-yellow-500/30'
      case 'payment_pending': return 'bg-gray-400/20 text-gray-400 border-gray-500/30'
      case 'payment_rejected': return 'bg-red-400/20 text-red-400 border-red-500/30'
      case 'cancelled': return 'bg-red-400/20 text-red-400 border-red-500/30'
      case 'refunded': return 'bg-purple-400/20 text-purple-400 border-purple-500/30'
      default: return 'bg-gray-400/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'payment_pending': return 'Awaiting Payment'
      case 'pending_verification': return 'Verifying Payment'
      case 'payment_approved': return 'Payment Approved'
      case 'payment_rejected': return 'Payment Rejected'
      case 'processing': return 'Processing'
      case 'completed': return 'Completed'
      case 'cancelled': return 'Cancelled'
      case 'refunded': return 'Refunded'
      default: return status
    }
  }

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId)
  }

  const hasFulfillmentFields = (order: any) => {
    return order.coins_login_username || 
           order.coins_login_password || 
           order.account_delivery_email
  }

  const filteredOrders = orders.filter(o =>
    o.order_number?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading orders...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          <span className="text-theme neon-glow">Orders</span>
        </h1>
        <p className="text-gray-400 mt-1">Manage customer orders</p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-black/50 border-theme/20 focus:border-theme text-white"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const isExpanded = expandedOrder === order.id
          const statusColor = getStatusColor(order.status)
          const statusLabel = getStatusLabel(order.status)
          const hasFulfillment = hasFulfillmentFields(order)
          const isCancelled = order.status === 'cancelled'
          const isDeleting = deletingOrderId === order.id
          
          return (
            <Card key={order.id} className="glass border-theme/10 rounded-2xl hover:border-theme/30 transition-all overflow-hidden">
              {/* Order Header */}
              <div 
                className="p-5 cursor-pointer hover:bg-theme/5 transition-colors"
                onClick={() => toggleOrderExpand(order.id)}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-white font-bold text-base sm:text-lg">
                        #{order.order_number}
                      </span>
                      <Badge className={`${statusColor} border px-2.5 py-0.5 text-xs font-medium`}>
                        {statusLabel}
                      </Badge>
                      {hasFulfillment && (
                        <Badge className="bg-purple-400/20 text-purple-400 border-purple-500/30 text-xs">
                          <KeyRound className="h-3 w-3 mr-1" />
                          Fulfillment Info
                        </Badge>
                      )}
                      {isCancelled && (
                        <Badge className="bg-red-400/20 text-red-400 border-red-500/30 text-xs">
                          <XCircle className="h-3 w-3 mr-1" />
                          Deletable
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs sm:text-sm text-gray-400">
                      <span>
                        {new Date(order.created_at).toLocaleDateString()} at{' '}
                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-gray-600">•</span>
                      <span>
                        {order.order_items?.length || 0} items
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Total</div>
                      <div className="text-lg font-bold text-theme neon-glow">
                        {formatPrice(order.total_amount)}
                      </div>
                    </div>
                    <button 
                      className="p-1.5 rounded-full hover:bg-theme/10 transition-colors text-gray-400 hover:text-white"
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
                    <Separator className="bg-theme/10" />
                    <div className="p-5 space-y-4">
                      {/* Customer Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-black/30 rounded-xl p-4 border border-theme/10">
                          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                            <User className="h-4 w-4" />
                            Customer Information
                          </div>
                          <p className="text-white font-medium">
                            {order.shipping_address?.fullName || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-400">
                            {order.shipping_address?.email || order.user_id}
                          </p>
                        </div>
                        <div className="bg-black/30 rounded-xl p-4 border border-theme/10">
                          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                            <Calendar className="h-4 w-4" />
                            Order Details
                          </div>
                          <p className="text-white">
                            Order ID: <span className="text-sm text-gray-400">{order.id}</span>
                          </p>
                          <p className="text-white">
                            Payment: <span className="text-sm text-gray-400">{order.payment_method || 'Bank Transfer'}</span>
                          </p>
                        </div>
                      </div>

                      {/* Fulfillment Fields */}
                      {hasFulfillment && (
                        <div className="bg-purple-400/5 rounded-xl p-4 border border-purple-400/20">
                          <div className="flex items-center gap-2 text-sm text-purple-400 mb-3">
                            <KeyRound className="h-4 w-4" />
                            <span className="font-medium">Fulfillment Information</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {(order.coins_login_username || order.coins_login_password) && (
                              <div className="bg-black/30 rounded-lg p-3 border border-purple-400/10">
                                <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                                  <Gamepad2 className="h-3 w-3 text-purple-400" />
                                  <span>Coins/Points Login</span>
                                </div>
                                {order.coins_login_username && (
                                  <p className="text-white text-sm">
                                    Username: <span className="text-gray-300">{order.coins_login_username}</span>
                                  </p>
                                )}
                                {order.coins_login_password && (
                                  <p className="text-white text-sm">
                                    Password: <span className="text-gray-300 font-mono text-xs">{order.coins_login_password}</span>
                                  </p>
                                )}
                              </div>
                            )}
                            {order.account_delivery_email && (
                              <div className="bg-black/30 rounded-lg p-3 border border-purple-400/10">
                                <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                                  <Mail className="h-3 w-3 text-purple-400" />
                                  <span>Account Delivery Email</span>
                                </div>
                                <p className="text-white text-sm">
                                  {order.account_delivery_email}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Items List */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          Order Items
                        </h4>
                        <div className="space-y-2 bg-black/30 rounded-xl p-3">
                          {order.order_items?.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center text-sm py-1.5 border-b border-theme/5 last:border-0">
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
                      <div className="bg-theme/5 rounded-xl p-4 border border-theme/10">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Subtotal</span>
                          <span className="text-white">{formatPrice(order.total_amount)}</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-gray-400">Shipping</span>
                          <span className="text-theme">Free</span>
                        </div>
                        <Separator className="my-2 bg-theme/10" />
                        <div className="flex justify-between font-bold">
                          <span className="text-white">Total</span>
                          <span className="text-theme neon-glow">{formatPrice(order.total_amount)}</span>
                        </div>
                      </div>

                      {/* ✅ Action Buttons - Including Delete */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {(order.status === 'payment_pending' || order.status === 'pending_verification') && (
                          <Button
                            size="sm"
                            className="bg-red-400/10 text-red-400 hover:bg-red-400/20"
                            onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Cancel Order
                          </Button>
                        )}
                        {order.status === 'payment_approved' && (
                          <Button
                            size="sm"
                            className="bg-blue-400/10 text-blue-400 hover:bg-blue-400/20"
                            onClick={() => updateOrderStatus(order.id, 'processing')}
                          >
                            <PlayCircle className="h-3 w-3 mr-1" />
                            Start Processing
                          </Button>
                        )}
                        {order.status === 'processing' && (
                          <Button
                            size="sm"
                            className="bg-theme/10 text-theme hover:bg-theme/20"
                            onClick={() => updateOrderStatus(order.id, 'completed')}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Mark Completed
                          </Button>
                        )}
                        {/* ✅ NEW: Delete button - ONLY for cancelled orders */}
                        {isCancelled && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-400/30 text-red-400 hover:bg-red-400/10 hover:border-red-400/50"
                            onClick={() => deleteOrder(order.id)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <>
                                <div className="h-3 w-3 animate-spin rounded-full border-2 border-red-400 border-t-transparent mr-1" />
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete Permanently
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          )
        })}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <ShoppingBag className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No orders found</p>
        </div>
      )}
    </div>
  )
}