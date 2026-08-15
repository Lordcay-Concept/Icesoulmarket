import { NextResponse } from 'next/server'
import { sendNewOrderNotification } from '@/lib/email'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { orderNumber, amount, customerEmail } = await request.json()

    // Server-side client with service context to read all admin emails
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: admins, error } = await supabase
      .from('profiles')
      .select('email')
      .eq('is_admin', true)

    if (error || !admins || admins.length === 0) {
      console.error('No admin emails found:', error)
      return NextResponse.json({ success: false }, { status: 500 })
    }

    const adminEmails = admins.map((a) => a.email).filter(Boolean)
    await sendNewOrderNotification(adminEmails, orderNumber, amount, customerEmail)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Email error:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}