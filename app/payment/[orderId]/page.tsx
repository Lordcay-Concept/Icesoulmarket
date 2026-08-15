// app/payment/[orderId]/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react' 
import { useParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/shared/Navbar'
import { Footer } from '@/components/shared/Footer'
import { WhatsAppButton } from '@/components/shared/WhatsAppButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/components/ui/use-toast'
import { DatabaseService } from '@/lib/services/database.service'
import { useCurrency } from '@/lib/hooks/useCurrency'
import { 
  Copy, 
  Check, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Building2, 
  User, 
  Hash, 
  FileText,
  Banknote,
  ArrowLeft,
  Shield,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

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

 const loadData = useCallback(async () => {
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
  }, [orderId]) 

  useEffect(() => {
    loadData()
  }, [loadData]) 

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
        <main className="min-h-screen pt-20 bg-gradient-to-b from-black via-black to-theme-950/10 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 text-theme animate-spin" />
            <p className="text-gray-400">Loading payment details...</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (!order) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-20 bg-gradient-to-b from-black via-black to-theme-950/10 flex items-center justify-center">
          <div className="text-center">
            <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Order Not Found</h2>
            <p className="text-gray-400">The order you&rsquo;re looking for doesn&rsquo;t exist.</p>
            <Link href="/account/orders">
              <Button className="mt-6 gaming-btn">View My Orders</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const getStatusDisplay = () => {
    if (order.status === 'pending_verification') {
      return {
        icon: Clock,
        color: 'text-yellow-400',
        bg: 'bg-yellow-400/10',
        border: 'border-yellow-400/20',
        text: 'Payment submitted — awaiting admin approval'
      }
    }
    if (order.status === 'payment_approved') {
      return {
        icon: CheckCircle,
        color: 'text-theme',
        bg: 'bg-theme/10',
        border: 'border-theme/20',
        text: 'Order confirmed! Your order is being processed.'
      }
    }
    if (order.status === 'payment_rejected') {
      return {
        icon: XCircle,
        color: 'text-red-400',
        bg: 'bg-red-400/10',
        border: 'border-red-400/20',
        text: 'We couldn\'t verify this payment. Please contact support.'
      }
    }
    return null
  }

  const statusInfo = getStatusDisplay()

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
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <Link href="/account/orders" className="text-gray-400 hover:text-theme transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  <span className="text-theme neon-glow">Complete</span> Payment
                </h1>
                <p className="text-sm text-gray-400">
                  Order #{order.order_number}
                </p>
              </div>
            </div>
          </motion.div>

          <div className="max-w-2xl mx-auto space-y-6">
            {/* Status Banner */}
            {statusInfo && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className={`flex items-center gap-3 p-4 rounded-xl ${statusInfo.bg} border ${statusInfo.border} ${statusInfo.color}`}
              >
                <statusInfo.icon className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{statusInfo.text}</span>
              </motion.div>
            )}

            {/* Bank Details Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Card className="glass border-theme-20 rounded-2xl overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-theme-10">
                      <Building2 className="h-5 w-5 text-theme" />
                    </div>
                    <div>
                      <CardTitle className="text-white">Bank Transfer Details</CardTitle>
                      <p className="text-sm text-gray-400">Transfer the exact amount to complete your order</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Bank Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-black/30 border border-theme-10">
                      <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                        <Building2 className="h-3.5 w-3.5" />
                        Bank Name
                      </div>
                      <p className="text-white font-medium">{bankSettings?.bank_name || 'N/A'}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-black/30 border border-theme-10">
                      <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                        <User className="h-3.5 w-3.5" />
                        Account Name
                      </div>
                      <p className="text-white font-medium">{bankSettings?.account_name || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Account Number - Highlighted */}
                  <div className="p-4 rounded-xl bg-theme-5 border border-theme-20">
                    <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                      <Hash className="h-3.5 w-3.5 text-theme" />
                      Account Number
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-2xl font-bold text-theme font-mono tracking-wider">
                        {bankSettings?.account_number || 'N/A'}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-theme-30 text-theme hover:bg-theme-10 flex-shrink-0"
                        onClick={copyAccountNumber}
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Branch (if exists) */}
                  {bankSettings?.branch && (
                    <div className="p-4 rounded-xl bg-black/30 border border-theme-10">
                      <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                        <Building2 className="h-3.5 w-3.5" />
                        Branch
                      </div>
                      <p className="text-white font-medium">{bankSettings.branch}</p>
                    </div>
                  )}

                  {/* Instructions */}
                  {bankSettings?.instructions && (
                    <div className="p-4 rounded-xl bg-theme-5 border border-theme-20">
                      <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                        <FileText className="h-3.5 w-3.5 text-theme" />
                        Instructions
                      </div>
                      <p className="text-gray-300 text-sm">{bankSettings.instructions}</p>
                    </div>
                  )}

                  <Separator className="bg-theme-20" />

                  {/* Amount Summary */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Amount to Pay</p>
                      <p className="text-gray-500 text-xs">Please transfer the exact amount</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-theme neon-glow">
                        {formatPrice(order.total_amount)}
                      </div>
                      <p className="text-xs text-gray-500">Total including all fees</p>
                    </div>
                  </div>

                  {/* Security Note */}
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-theme-5 border border-theme-10">
                    <Shield className="h-4 w-4 text-theme flex-shrink-0" />
                    <p className="text-xs text-gray-400">
                      Your payment is secure and encrypted. We&apos;ll notify you once verified.
                    </p>
                  </div>

                  {/* Confirm Button */}
                  {order.status === 'payment_pending' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                    >
                      <Button
                        onClick={handleConfirmPayment}
                        disabled={isSubmitting}
                        className="w-full gaming-btn text-lg py-6"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Submitting...
                          </div>
                        ) : (
                          <>
                            <Banknote className="mr-2 h-5 w-5" />
                            I Have Sent The Money
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-gray-500 text-center mt-3">
                        By clicking this button, you confirm that you have made the transfer.
                        Our team will verify your payment shortly.
                      </p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Back to Orders */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="text-center"
            >
              <Link href="/account/orders" className="text-sm text-gray-400 hover:text-theme transition-colors">
                ← Back to My Orders
              </Link>
            </motion.div>
          </div>
        </div>
      </main>
      <WhatsAppButton />
      <Footer />
    </>
  )
}