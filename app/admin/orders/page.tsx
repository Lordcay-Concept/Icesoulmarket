// app/admin/orders/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { DatabaseService } from '@/lib/services/database.service'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCurrency } from '@/lib/hooks/useCurrency'
import { 
  ShoppingBag, 
  Search,
  CheckCircle,
  XCircle,
  Clock,
  PlayCircle
} from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-400/20 text-emerald-400'
      case 'processing': return 'bg-blue-400/20 text-blue-400'
      case 'payment_approved': return 'bg-emerald-400/20 text-emerald-400'
      case 'pending_verification': return 'bg-yellow-400/20 text-yellow-400'
      case 'payment_pending': return 'bg-gray-400/20 text-gray-400'
      case 'payment_rejected': return 'bg-red-400/20 text-red-400'
      case 'cancelled': return 'bg-red-400/20 text-red-400'
      case 'refunded': return 'bg-purple-400/20 text-purple-400'
      default: return 'bg-gray-400/20 text-gray-400'
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
          <span className="text-emerald-400 neon-glow">Orders</span>
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
            className="pl-9 bg-black/50 border-emerald-400/20 focus:border-emerald-400 text-white"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="glass border-emerald-400/10 rounded-2xl hover:border-emerald-400/30 transition-all">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="h-5 w-5 text-emerald-400" />
                    <span className="text-white font-medium">#{order.order_number}</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    {new Date(order.created_at).toLocaleDateString()} at{' '}
                    {new Date(order.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-emerald-400 font-bold">
                    {formatPrice(order.total_amount)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                  <div className="flex gap-2">
                    {/* Before payment is confirmed, admin can only cancel — approval happens on the Payments page */}
                    {(order.status === 'payment_pending' || order.status === 'pending_verification') && (
                      <Button
                        size="sm"
                        className="bg-red-400/10 text-red-400 hover:bg-red-400/20"
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Cancel
                      </Button>
                    )}
                    {/* Payment approved on Payments page → admin now fulfills the order */}
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
                        className="bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20"
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Mark Completed
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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