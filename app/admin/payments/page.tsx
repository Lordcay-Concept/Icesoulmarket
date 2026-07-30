// app/admin/payments/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { DatabaseService } from '@/lib/services/database.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  CreditCard,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Copy
} from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { useCurrency } from '@/lib/hooks/useCurrency'

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const { formatPrice } = useCurrency()

  useEffect(() => {
    loadPayments()
  }, [])

  const loadPayments = async () => {
    try {
      setLoading(true)
      const data = await DatabaseService.getPayments()
      setPayments(data)
    } catch (error) {
      console.error('Error loading payments:', error)
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
      case 'approved': return 'bg-emerald-400/20 text-emerald-400'
      case 'pending_verification': return 'bg-yellow-400/20 text-yellow-400'
      case 'rejected': return 'bg-red-400/20 text-red-400'
      case 'pending': return 'bg-gray-400/20 text-gray-400'
      default: return 'bg-gray-400/20 text-gray-400'
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
    p.order_id?.toLowerCase().includes(search.toLowerCase())
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
          <span className="text-emerald-400 neon-glow">Payments</span>
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
            className="pl-9 bg-black/50 border-emerald-400/20 focus:border-emerald-400 text-white"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredPayments.map((payment) => (
          <Card key={payment.id} className="glass border-emerald-400/10 rounded-2xl hover:border-emerald-400/30 transition-all">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-emerald-400" />
                    <span className="text-white font-medium">Payment #{payment.id.slice(0, 8)}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-sm text-gray-400">
                      Order: {payment.order_id?.slice(0, 8)}
                    </p>
                    <p className="text-sm text-gray-400">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {payment.transfer_receipt_url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 mt-1"
                      onClick={() => copyToClipboard(payment.transfer_receipt_url)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Reference: {payment.transfer_receipt_url}
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400 font-bold">
                    {formatPrice(payment.amount)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                    {getStatusLabel(payment.status)}
                  </span>
                  {payment.status === 'pending_verification' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        disabled={processingId === payment.id}
                        className="bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20"
                        onClick={() => handleApprove(payment)}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={processingId === payment.id}
                        className="border-red-400/30 text-red-400 hover:bg-red-400/10"
                        onClick={() => handleReject(payment)}
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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