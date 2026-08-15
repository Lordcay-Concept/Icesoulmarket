// app/payment/[orderId]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/shared/Navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/lib/hooks/useAuth'
import { DatabaseService } from '@/lib/services/database.service'
import { toast } from '@/components/ui/use-toast'
import { 
  Copy, 
  CheckCircle, 
  Clock, 
  Banknote, 
  ArrowLeft,
  Loader2,
  Building2,
  User,
  Hash,
  FileText
} from 'lucide-react'
import Link from 'next/link'

interface BankDetails {
  bank_name: string
  account_name: string
  account_number: string
  branch: string
  instructions: string
}

export default function PaymentPage({ params }: { params: { orderId: string } }) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { orderId } = params
  
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<any>(null)
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null)
  const [transferReference, setTransferReference] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Fetch order and bank details
  useEffect(() => {
    const fetchData = async () => {
      if (!user || !orderId) return

      try {
        setLoading(true)
        
        // Fetch order
        const orderData = await DatabaseService.getOrderById(orderId)
        if (!orderData) {
          setError('Order not found')
          return
        }
        
        // Check if order belongs to user
        if (orderData.user_id !== user.id) {
          setError('You do not have permission to view this order')
          return
        }

        // Check order status
        if (orderData.status === 'completed' || orderData.status === 'cancelled') {
          setError(`This order has already been ${orderData.status}`)
          return
        }

        setOrder(orderData)

        // Fetch bank details
        const bankData = await DatabaseService.getBankSettings()
        if (bankData) {
          setBankDetails({
            bank_name: bankData.bank_name,
            account_name: bankData.account_name,
            account_number: bankData.account_number,
            branch: bankData.branch || 'Main Branch',
            instructions: bankData.instructions || 'Please transfer the exact amount and use your order number as reference.'
          })
        }

        setError(null)
      } catch (err) {
        console.error('Error fetching payment data:', err)
        setError('Failed to load payment information')
      } finally {
        setLoading(false)
      }
    }

    if (isHydrated) {
      fetchData()
    }
  }, [orderId, user, isHydrated])

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user && isHydrated) {
      toast({
        title: 'Login Required',
        description: 'Please login to view payment details.',
        variant: 'destructive',
      })
      router.push('/login?redirect=/payment/' + orderId)
    }
  }, [user, authLoading, router, orderId, isHydrated])

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast({
      title: 'Copied!',
      description: 'Account number copied to clipboard.',
      variant: 'success',
    })
    setTimeout(() => setCopied(false), 3000)
  }

  const handleConfirmPayment = async () => {
    if (!transferReference.trim()) {
      toast({
        title: 'Reference Required',
        description: 'Please enter the transaction reference from your bank transfer.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Get Supabase client
      const supabase = DatabaseService.getSupabaseClient()

      // Update order with bank transfer reference
      await supabase
        .from('orders')
        .update({
          bank_transfer_reference: transferReference,
          status: 'pending_verification'
        })
        .eq('id', orderId)

      // Create payment record
      await DatabaseService.createPayment({
        order_id: orderId,
        user_id: user?.id,
        amount: order.total_amount,
        status: 'pending_verification',
        transfer_receipt_url: transferReference,
        admin_notes: `User confirmed transfer with reference: ${transferReference}`
      })

      toast({
        title: 'Payment Confirmed! 🎉',
        description: 'We have received your confirmation. The admin will verify your payment shortly.',
        variant: 'success',
      })

      // Send email notification to admin (using Resend)
      try {
        await fetch('/api/notify-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            userId: user?.id,
            amount: order.total_amount,
            reference: transferReference,
          }),
        })
      } catch (emailError) {
        console.error('Failed to send admin notification:', emailError)
        // Don't fail the flow if email fails
      }

      // Redirect to confirmation page
      router.push(`/payment/confirmation/${orderId}`)
    } catch (error) {
      console.error('Error confirming payment:', error)
      toast({
        title: 'Confirmation Failed',
        description: 'There was an error confirming your payment. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isHydrated || authLoading || loading) {
    return (
      <>
        <Navbar />
        <main className="container mx-auto px-4 py-24">
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-theme" />
          </div>
        </main>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Navbar />
        <main className="container mx-auto px-4 py-24">
          <Card className="gaming-card max-w-md mx-auto">
            <CardContent className="py-12 text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold text-white mb-2">Error</h2>
              <p className="text-gray-400">{error}</p>
              <Button 
                className="mt-4 bg-theme text-black hover:bg-theme/80"
                onClick={() => router.push('/account/orders')}
              >
                View My Orders
              </Button>
            </CardContent>
          </Card>
        </main>
      </>
    )
  }

  if (!order || !bankDetails) {
    return (
      <>
        <Navbar />
        <main className="container mx-auto px-4 py-24">
          <div className="flex items-center justify-center h-96">
            <div className="text-gray-400">Loading payment details...</div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Link href="/account/orders" className="text-theme hover:underline flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Orders
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">
              Complete <span className="text-theme">Payment</span>
            </h1>
            <p className="text-gray-400 mt-1">
              Order #{order.order_number} • Total: ${order.total_amount.toFixed(2)}
            </p>
          </div>

          <div className="space-y-6">
            {/* Order Status */}
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-theme" />
                  Order Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-yellow-500 animate-pulse" />
                  <span className="text-gray-300">Awaiting Payment Verification</span>
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  Please complete the bank transfer below and confirm your payment.
                </p>
              </CardContent>
            </Card>

            {/* Bank Details */}
            <Card className="gaming-card border-theme/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Banknote className="h-5 w-5 text-theme" />
                  Bank Transfer Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-black-light/50 border border-theme/10">
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                      <Building2 className="h-4 w-4" />
                      Bank
                    </div>
                    <p className="text-white font-semibold">{bankDetails.bank_name}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-black-light/50 border border-theme/10">
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                      <User className="h-4 w-4" />
                      Account Name
                    </div>
                    <p className="text-white font-semibold">{bankDetails.account_name}</p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-theme/5 border border-theme/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Hash className="h-4 w-4" />
                        Account Number
                      </div>
                      <p className="text-2xl font-bold text-theme font-mono tracking-wider">
                        {bankDetails.account_number}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="border-theme/30 text-theme hover:bg-theme/10"
                      onClick={() => handleCopy(bankDetails.account_number)}
                    >
                      {copied ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      <span className="ml-2">{copied ? 'Copied!' : 'Copy'}</span>
                    </Button>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-black-light/50 border border-theme/10">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <FileText className="h-4 w-4" />
                    Instructions
                  </div>
                  <p className="text-gray-300 text-sm">{bankDetails.instructions}</p>
                  <p className="text-theme text-sm mt-2">
                    <strong>Important:</strong> Use your order number #{order.order_number} as reference.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                  <p className="text-yellow-400 text-sm">
                    <strong>⏰ Important:</strong> Please ensure you transfer the exact amount of 
                    <span className="font-bold text-white"> ${order.total_amount.toFixed(2)}</span> 
                    and use your order number as reference.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Confirm Payment */}
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="text-white">Confirm Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-400 text-sm">
                  After making the bank transfer, enter the transaction reference and click confirm.
                </p>
                
                <div className="space-y-2">
                  <Label htmlFor="reference" className="text-gray-300">
                    Transaction Reference / Receipt Number
                  </Label>
                  <Input
                    id="reference"
                    placeholder="e.g., TRF-2024-001234"
                    className="bg-black-light border-theme/20 focus:border-theme"
                    value={transferReference}
                    onChange={(e) => setTransferReference(e.target.value)}
                    required
                  />
                </div>

                <Button
                  className="w-full bg-theme text-black hover:bg-theme/80 text-lg py-6"
                  onClick={handleConfirmPayment}
                  disabled={isSubmitting || !transferReference.trim()}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5" />
                      I Have Sent the Money
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-400 text-center">
                  By clicking this button, you confirm that you have made the bank transfer.
                  Our admin will verify your payment shortly.
                </p>
              </CardContent>
            </Card>

            {/* Payment Summary */}
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="text-white">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-300">
                    <span>Order Number</span>
                    <span className="font-mono text-theme">#{order.order_number}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Total Amount</span>
                    <span className="font-bold text-white">${order.total_amount.toFixed(2)}</span>
                  </div>
                  <Separator className="bg-theme/20" />
                  <div className="flex justify-between text-gray-300">
                    <span>Payment Method</span>
                    <span className="text-white">Bank Transfer</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Bank</span>
                    <span className="text-white">{bankDetails.bank_name}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}