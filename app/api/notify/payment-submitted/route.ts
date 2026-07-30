// app/api/notify/payment-submitted/route.ts
import { NextResponse } from 'next/server'
import { sendAdminPaymentNotification } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const { orderNumber, amount, customerEmail } = await request.json()
    await sendAdminPaymentNotification(orderNumber, amount, customerEmail)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Email error:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}