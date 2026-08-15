// lib/email.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendAdminPaymentNotification(orderNumber: string, amount: string, customerEmail: string) {
  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: process.env.ADMIN_EMAIL!,
    subject: `💰 Payment submitted for Order ${orderNumber}`,
    html: `
      <h2>Payment Confirmation Pending</h2>
      <p>Order <strong>${orderNumber}</strong> (${amount}) has been marked as paid by ${customerEmail}.</p>
      <p>Please verify and approve it from the admin dashboard.</p>
    `,
  })
}

export async function sendUserPaymentApproved(userEmail: string, orderNumber: string) {
  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: userEmail,
    subject: `✅ Payment Approved — Order ${orderNumber}`,
    html: `
      <h2>Your payment has been approved!</h2>
      <p>Order <strong>${orderNumber}</strong> is confirmed. Your items will be delivered shortly.</p>
    `,
  })
}

export async function sendUserPaymentRejected(userEmail: string, orderNumber: string) {
  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: userEmail,
    subject: `⚠️ Payment Issue — Order ${orderNumber}`,
    html: `
      <h2>We couldn't verify your payment</h2>
      <p>Order <strong>${orderNumber}</strong> payment could not be confirmed. Please contact support or try again.</p>
    `,
  })
}

export async function sendNewOrderNotification(adminEmails: string[], orderNumber: string, amount: string, customerEmail: string) {
  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: adminEmails,
    subject: `🛒 New Order Received — ${orderNumber}`,
    html: `
      <h2>New Order Placed</h2>
      <p>Order <strong>${orderNumber}</strong> (${amount}) was just placed by ${customerEmail}.</p>
      <p>It's awaiting customer payment. Check the admin dashboard once payment is confirmed.</p>
    `,
  })
}