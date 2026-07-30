// app/payment/[orderId]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/shared/Navbar'
import { Footer } from '@/components/shared/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/components/ui/use-toast'
import { DatabaseService } from '@/lib/services/database.service'
import { useCurrency } from '@/lib/hooks/useCurrency'
import { Copy, Check, Clock, CheckCircle, XCircle, Building2 } from 'lucide-react'

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.orderId as string
  const { formatPrice } = useCurrency()

  const [order, setOrder] = useState<any>(null)
  const [bankSettings, setBankSettings] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [orderId])

  const loadData = async () => {
    try {
      setLoading(true)
      const supabase = DatabaseService.getSupabaseClient()

      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

      const bank = await DatabaseService.getBankSettings()

      setOrder(orderData)
      setBankSettings(bank)
    } catch (error) {
      console.error('Error loading payment page:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyAccountNumber = () => {
    navigator.clipboard.writeText(bankSettings?.account_number || '')
    setCopied(true)
    toast({ title: 'Copied!', description: 'Account number copied to clipboard.' })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleConfirmPayment = async () => {
    setIsSubmitting(true)
    try {
      const supabase = DatabaseService.getSupabaseClient()

      // Controlled, ownership-checked status transition — replaces the
      // direct table updates that were silently blocked by RLS before.
      const { error: rpcError } = await supabase.rpc('confirm_payment_sent', {
        p_order_id: orderId,
      })

      if (rpcError) throw rpcError

      const { data: { user } } = await supabase.auth.getUser()

      const emailResponse = await fetch('/api/notify/payment-submitted', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: order.order_number,
          amount: formatPrice(order.total_amount),
          customerEmail: user?.email,
        }),
      })

      if (!emailResponse.ok) {
        console.error('Admin notification email failed to send:', await emailResponse.text())
      }

      toast({
        title: 'Payment Confirmation Sent',
        description: 'We\'ll verify your payment and email you once approved.',
        variant: 'success',
      })

      // Professional flow: send them to their order history, not leave
      // them stuck on a payment page whose job is now done.
      router.push('/account/orders')
    } catch (error: any) {
      console.error('Error confirming payment:', error)
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="container mx-auto px-4 py-24 flex items-center justify-center">
          <div className="text-gray-400">Loading payment details...</div>
        </main>
      </>
    )
  }

  if (!order) {
    return (
      <>
        <Navbar />
        <main className="container mx-auto px-4 py-24 text-center">
          <p className="text-gray-400">Order not found.</p>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Complete Your Payment</h1>
          <p className="text-gray-400 mb-8">Order #{order.order_number}</p>

          {order.status === 'pending_verification' && (
            <div className="mb-6 flex items-center gap-3 p-4 rounded-lg bg-yellow-400/10 border border-yellow-400/20 text-yellow-400">
              <Clock className="h-5 w-5 flex-shrink-0" />
              <span>Payment submitted — awaiting admin approval.</span>
            </div>
          )}
          {order.status === 'payment_approved' && (
            <div className="mb-6 flex items-center gap-3 p-4 rounded-lg bg-emerald-400/10 border border-emerald-400/20 text-emerald-400">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <span>Order confirmed! Your order is being processed.</span>
            </div>
          )}
          {order.status === 'payment_rejected' && (
            <div className="mb-6 flex items-center gap-3 p-4 rounded-lg bg-red-400/10 border border-red-400/20 text-red-400">
              <XCircle className="h-5 w-5 flex-shrink-0" />
              <span>We couldn&apos;t verify this payment. Please contact support.</span>
            </div>
          )}

          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-gaming-green" />
                Bank Transfer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Bank Name</p>
                  <p className="text-white font-medium">{bankSettings?.bank_name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Account Name</p>
                  <p className="text-white font-medium">{bankSettings?.account_name}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">Account Number</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-white font-mono text-lg">{bankSettings?.account_number}</p>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 border-gaming-green/30"
                      onClick={copyAccountNumber}
                    >
                      {copied ? <Check className="h-4 w-4 text-gaming-green" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                {bankSettings?.branch && (
                  <div className="col-span-2">
                    <p className="text-gray-500">Branch</p>
                    <p className="text-white font-medium">{bankSettings.branch}</p>
                  </div>
                )}
              </div>

              {bankSettings?.instructions && (
                <div className="bg-gaming-green/5 border border-gaming-green/20 rounded-lg p-3 text-sm text-gray-300">
                  {bankSettings.instructions}
                </div>
              )}

              <Separator className="bg-gaming-green/20" />

              <div className="flex justify-between text-lg font-bold text-white">
                <span>Amount to Pay</span>
                <span className="text-gaming-green">{formatPrice(order.total_amount)}</span>
              </div>

              {order.status === 'payment_pending' && (
                <Button
                  onClick={handleConfirmPayment}
                  disabled={isSubmitting}
                  className="w-full bg-gaming-green text-black hover:bg-gaming-green/80 text-lg py-6"
                >
                  {isSubmitting ? 'Submitting...' : 'I Have Sent The Money'}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  )
}