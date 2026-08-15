// app/payment/confirmation/[orderId]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/shared/Navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/hooks/useAuth'
import { DatabaseService } from '@/lib/services/database.service'
import { CheckCircle, Clock, Mail, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function PaymentConfirmationPage({ params }: { params: { orderId: string } }) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { orderId } = params
  
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<any>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    const fetchOrder = async () => {
      if (!user || !orderId) return

      try {
        const orderData = await DatabaseService.getOrderById(orderId)
        if (orderData) {
          setOrder(orderData)
        }
      } catch (error) {
        console.error('Error fetching order:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isHydrated) {
      fetchOrder()
    }
  }, [orderId, user, isHydrated])

  if (!isHydrated || authLoading || loading) {
    return (
      <>
        <Navbar />
        <main className="container mx-auto px-4 py-24">
          <div className="flex items-center justify-center h-96">
            <div className="text-gray-400">Loading confirmation...</div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-2xl mx-auto">
          <Card className="gaming-card border-theme/30">
            <CardContent className="py-12 text-center">
              <div className="mb-6">
                <div className="h-20 w-20 rounded-full bg-theme/10 mx-auto flex items-center justify-center">
                  <CheckCircle className="h-12 w-12 text-theme" />
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-white mb-2">
                Payment Confirmed! 🎉
              </h1>
              <p className="text-gray-400 mb-6">
                Your payment confirmation has been received and is pending admin verification.
              </p>

              <div className="bg-black-light/50 rounded-lg p-4 mb-6 text-left">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Order Number</span>
                    <span className="text-theme font-mono">#{order?.order_number}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Amount</span>
                    <span className="text-white font-bold">${order?.total_amount?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Status</span>
                    <span className="text-yellow-400 flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Pending Verification
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-theme/5 border border-theme/20 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 text-theme mb-2">
                  <Mail className="h-5 w-5" />
                  <span className="font-semibold">What happens next?</span>
                </div>
                <ul className="text-sm text-gray-400 space-y-2 text-left">
                  <li>• Admin will verify your bank transfer</li>
                  <li>• You will receive a confirmation email once verified</li>
                  <li>• Your order will be processed for delivery</li>
                  <li>• You can track status in your orders page</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/account/orders">
                  <Button className="bg-theme text-black hover:bg-theme/80">
                    View My Orders
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="border-theme/30 text-white hover:bg-theme/10">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}