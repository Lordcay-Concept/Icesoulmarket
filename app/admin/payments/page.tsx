// app/admin/payments/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { DatabaseService } from '@/lib/services/database.service'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  CreditCard,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Copy,
  ChevronDown,
  ChevronUp,
  Package,
  User,
  Calendar,
  DollarSign,
  Tag,
  Percent
} from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { useCurrency } from '@/lib/hooks/useCurrency'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [expandedPayment, setExpandedPayment] = useState<string | null>(null)
  const { formatPrice } = useCurrency()

  useEffect(() => {
    loadPayments()
  }, [])

  const loadPayments = async () => {
    try {
      setLoading(true)
      const supabase = DatabaseService.getSupabaseClient()
      
      // ✅ Get all payments with order and promo usage
      const { data: paymentsData, error } = await supabase
        .from('payments')
        .select(`
          *,
          orders:order_id (
            order_number,
            shipping_address,
            status
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // ✅ Fetch promo code usage for each payment
      const paymentsWithPromo = await Promise.all(
        (paymentsData || []).map(async (payment) => {
          const { data: promoUsage } = await supabase
            .from('promo_code_usages')
            .select(`
              *,
              promo_code:promo_code_id (
                code,
                discount_percentage,
                commission_percentage,
                restricted_category_id
              )
            `)
            .eq('order_id', payment.order_id)
            .maybeSingle()
          
          return {
            ...payment,
            promo_usage: promoUsage || null
          }
        })
      )
      
      setPayments(paymentsWithPromo)
    } catch (error) {
      console.error('Error loading payments:', error)
      toast({
        title: 'Error',
        description: 'Failed to load payments',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (payment: any) => {
    setProcessingId(payment.id)
    try {
      const supabase = DatabaseService.getSupabaseClient()

      const { data: order } = await supabase
        .from('orders')
        .select('order_number, shipping_address')
        .eq('id', payment.order_id)
        .single()

      await supabase.from('payments').update({ status: 'approved' }).eq('id', payment.id)
      await supabase.from('orders').update({ status: 'payment_approved' }).eq('id', payment.order_id)

      const customerEmail = order?.shipping_address?.email
      if (customerEmail) {
        await fetch('/api/notify/payment-approved', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userEmail: customerEmail,
            orderNumber: order?.order_number,
          }),
        })
      }

      toast({
        title: 'Payment Approved',
        description: 'Customer has been notified by email.',
        variant: 'success',
      })
      loadPayments()
    } catch (error) {
      console.error('Error approving payment:', error)
      toast({
        title: 'Error',
        description: 'Failed to approve payment',
        variant: 'destructive',
      })
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (payment: any) => {
    if (!confirm('Reject this payment? The customer will be notified.')) return

    setProcessingId(payment.id)
    try {
      const supabase = DatabaseService.getSupabaseClient()

      const { data: order } = await supabase
        .from('orders')
        .select('order_number, shipping_address')
        .eq('id', payment.order_id)
        .single()

      await supabase.from('payments').update({ status: 'rejected' }).eq('id', payment.id)
      await supabase.from('orders').update({ status: 'payment_rejected' }).eq('id', payment.order_id)

      const customerEmail = order?.shipping_address?.email
      if (customerEmail) {
        await fetch('/api/notify/payment-rejected', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userEmail: customerEmail,
            orderNumber: order?.order_number,
          }),
        })
      }

      toast({
        title: 'Payment Rejected',
        description: 'Customer has been notified by email.',
        variant: 'default',
      })
      loadPayments()
    } catch (error) {
      console.error('Error rejecting payment:', error)
      toast({
        title: 'Error',
        description: 'Failed to reject payment',
        variant: 'destructive',
      })
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-theme/20 text-theme border-theme-500/30'
      case 'pending_verification': return 'bg-yellow-400/20 text-yellow-400 border-yellow-500/30'
      case 'rejected': return 'bg-red-400/20 text-red-400 border-red-500/30'
      case 'pending': return 'bg-gray-400/20 text-gray-400 border-gray-500/30'
      default: return 'bg-gray-400/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Awaiting Customer'
      case 'pending_verification': return 'Awaiting Approval'
      case 'approved': return 'Approved'
      case 'rejected': return 'Rejected'
      default: return status
    }
  }

  const togglePaymentExpand = (paymentId: string) => {
    setExpandedPayment(expandedPayment === paymentId ? null : paymentId)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copied!',
      description: 'Reference copied to clipboard',
      variant: 'success',
    })
  }

  const filteredPayments = payments.filter(p =>
    p.id?.toLowerCase().includes(search.toLowerCase()) ||
    p.order_id?.toLowerCase().includes(search.toLowerCase()) ||
    p.orders?.order_number?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading payments...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          <span className="text-theme neon-glow">Payments</span>
        </h1>
        <p className="text-gray-400 mt-1">Manage payment verifications</p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search payments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-black/50 border-theme/20 focus:border-theme text-white"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredPayments.map((payment) => {
          const isExpanded = expandedPayment === payment.id
          const statusColor = getStatusColor(payment.status)
          const statusLabel = getStatusLabel(payment.status)
          const hasPromo = payment.promo_usage !== null
          const order = payment.orders
          
          return (
            <Card key={payment.id} className="glass border-theme/10 rounded-2xl hover:border-theme/30 transition-all overflow-hidden">
              {/* Payment Header */}
              <div 
                className="p-5 cursor-pointer hover:bg-theme/5 transition-colors"
                onClick={() => togglePaymentExpand(payment.id)}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-white font-medium text-base sm:text-lg">
                        Payment #{payment.id.slice(0, 8)}
                      </span>
                      <Badge className={`${statusColor} border px-2.5 py-0.5 text-xs font-medium`}>
                        {statusLabel}
                      </Badge>
                      {hasPromo && (
                        <Badge className="bg-purple-400/20 text-purple-400 border-purple-500/30 text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          Promo Applied
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs sm:text-sm text-gray-400">
                      <span>
                        {new Date(payment.created_at).toLocaleDateString()} at{' '}
                        {new Date(payment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-gray-600">•</span>
                      <span>
                        Order: #{order?.order_number || payment.order_id?.slice(0, 8)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Amount</div>
                      <div className="text-lg font-bold text-theme neon-glow">
                        {formatPrice(payment.amount)}
                      </div>
                    </div>
                    <button 
                      className="p-1.5 rounded-full hover:bg-theme/10 transition-colors text-gray-400 hover:text-white"
                      onClick={(e) => {
                        e.stopPropagation()
                        togglePaymentExpand(payment.id)
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

              {/* Payment Details - Expandable */}
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
                      {/* Payment Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-black/30 rounded-xl p-4 border border-theme/10">
                          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                            <CreditCard className="h-4 w-4" />
                            Payment Details
                          </div>
                          <p className="text-white">
                            Payment ID: <span className="text-sm text-gray-400">{payment.id}</span>
                          </p>
                          <p className="text-white">
                            Amount: <span className="text-sm text-theme font-bold">{formatPrice(payment.amount)}</span>
                          </p>
                          <p className="text-white">
                            Status: <span className="text-sm">{statusLabel}</span>
                          </p>
                        </div>
                        <div className="bg-black/30 rounded-xl p-4 border border-theme/10">
                          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                            <Calendar className="h-4 w-4" />
                            Order Information
                          </div>
                          <p className="text-white">
                            Order #: <span className="text-sm text-gray-400">{order?.order_number || 'N/A'}</span>
                          </p>
                          <p className="text-white">
                            Payment Method: <span className="text-sm text-gray-400">Bank Transfer</span>
                          </p>
                          <p className="text-white">
                            Reference: <span className="text-sm text-gray-400">{payment.transfer_receipt_url || 'N/A'}</span>
                          </p>
                        </div>
                      </div>

                      {/* ✅ Promo Code Details - Show if promo was used */}
                      {hasPromo && (
                        <div className="bg-purple-400/5 rounded-xl p-4 border border-purple-400/20">
                          <div className="flex items-center gap-2 text-sm text-purple-400 mb-3">
                            <Tag className="h-4 w-4" />
                            <span className="font-medium">Promo Code Applied</span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="bg-black/30 rounded-lg p-3">
                              <p className="text-xs text-gray-400">Promo Code</p>
                              <p className="text-white font-medium font-mono">
                                {payment.promo_usage.promo_code?.code || 'N/A'}
                              </p>
                            </div>
                            <div className="bg-black/30 rounded-lg p-3">
                              <p className="text-xs text-gray-400">Discount</p>
                              <p className="text-theme font-medium">
                                {payment.promo_usage.promo_code?.discount_percentage || 0}%
                              </p>
                            </div>
                            <div className="bg-black/30 rounded-lg p-3">
                              <p className="text-xs text-gray-400">Discount Amount</p>
                              <p className="text-theme font-medium">
                                -{formatPrice(payment.promo_usage.discount_amount || 0)}
                              </p>
                            </div>
                            <div className="bg-black/30 rounded-lg p-3">
                              <p className="text-xs text-gray-400">Original Total</p>
                              <p className="text-white font-medium line-through text-gray-400">
                                {formatPrice(payment.promo_usage.order_total || 0)}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-gray-400">
                            <span className="text-purple-400">ℹ️</span> Promo code was applied to this order
                          </div>
                        </div>
                      )}

                      {/* Order Items */}
                      {payment.order_id && (
                        <PaymentOrderItems 
                          orderId={payment.order_id} 
                          promoUsage={payment.promo_usage}
                        />
                      )}

                      {/* Actions */}
                      {payment.status === 'pending_verification' && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          <Button
                            size="sm"
                            disabled={processingId === payment.id}
                            className="bg-theme/10 text-theme hover:bg-theme/20"
                            onClick={() => handleApprove(payment)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approve Payment
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={processingId === payment.id}
                            className="border-red-400/30 text-red-400 hover:bg-red-400/10"
                            onClick={() => handleReject(payment)}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Reject Payment
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          )
        })}
      </div>

      {filteredPayments.length === 0 && (
        <div className="text-center py-12">
          <CreditCard className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No payments found</p>
        </div>
      )}
    </div>
  )
}

// ✅ Helper component to fetch and display order items with promo info
function PaymentOrderItems({ orderId, promoUsage }: { orderId: string; promoUsage?: any }) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { formatPrice } = useCurrency()

  useEffect(() => {
    const fetchOrderItems = async () => {
      try {
        const supabase = DatabaseService.getSupabaseClient()
        const { data } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', orderId)
        setItems(data || [])
      } catch (error) {
        console.error('Error fetching order items:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchOrderItems()
  }, [orderId])

  if (loading) {
    return (
      <div className="bg-black/30 rounded-xl p-4 border border-theme/10">
        <div className="text-gray-400 text-sm">Loading items...</div>
      </div>
    )
  }

  if (items.length === 0) {
    return null
  }

  const subtotal = items.reduce((sum, i) => sum + (i.product_price * i.quantity), 0)
  
  // ✅ Get discount from promo usage if available
  const discountAmount = promoUsage?.discount_amount || 0
  const finalTotal = subtotal - discountAmount

  return (
    <div>
      <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
        <Package className="h-4 w-4" />
        Order Items
      </h4>
      <div className="space-y-2 bg-black/30 rounded-xl p-3 border border-theme/10">
        {items.map((item, idx) => (
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
        
        <Separator className="bg-theme/10 my-2" />
        
        {/* ✅ Show subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Subtotal</span>
          <span className="text-white">{formatPrice(subtotal)}</span>
        </div>
        
        {/* ✅ Show discount if promo was applied */}
        {discountAmount > 0 && promoUsage && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">
              Discount ({promoUsage.promo_code?.discount_percentage || 0}%)
            </span>
            <span className="text-theme">-{formatPrice(discountAmount)}</span>
          </div>
        )}
        
        <Separator className="bg-theme/10 my-2" />
        
        <div className="flex justify-between font-bold">
          <span className="text-white">Total</span>
          <span className="text-theme neon-glow">
            {formatPrice(finalTotal)}
          </span>
        </div>
        
        {/* ✅ Show original total if promo was applied */}
        {discountAmount > 0 && promoUsage && (
          <div className="flex justify-between text-xs text-gray-500">
            <span>Original total before discount</span>
            <span className="line-through">{formatPrice(subtotal)}</span>
          </div>
        )}
      </div>
    </div>
  )
}