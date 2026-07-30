// app/api/notify/payment-rejected/route.ts
import { NextResponse } from 'next/server'
import { sendUserPaymentRejected } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const { userEmail, orderNumber } = await request.json()
    await sendUserPaymentRejected(userEmail, orderNumber)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Email error:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}