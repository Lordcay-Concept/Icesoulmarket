// app/api/notify/payment-approved/route.ts
import { NextResponse } from 'next/server'
import { sendUserPaymentApproved } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const { userEmail, orderNumber } = await request.json()
    await sendUserPaymentApproved(userEmail, orderNumber)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Email error:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}