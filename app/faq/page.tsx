// app/faq/page.tsx
import { Navbar } from '@/components/shared/Navbar'
import { Footer } from '@/components/shared/Footer'
import {WhatsAppButton} from '@/components/shared/WhatsAppButton'
import { HelpCircle, Gamepad2, Sparkles } from 'lucide-react'

const faqs = [
  {
    question: 'How fast is delivery after payment?',
    answer: 'Most orders are processed within 1-24 hours after your payment is verified by our team. Since payments are confirmed manually, delivery isn\'t instant, but we aim to process every order as quickly as possible.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We currently accept bank transfer. After placing an order, you\'ll receive our account details on the payment page. Once you\'ve sent the payment, click "I Have Sent The Money" and our team will verify and confirm it.',
  },
  {
    question: 'Is it safe to buy gaming accounts here?',
    answer: 'Yes. Every account and item listed is checked before being made available. That said, always use a strong, unique password after receiving an account, and enable two-factor authentication where the platform supports it.',
  },
  {
    question: 'What happens after my payment is approved?',
    answer: 'You\'ll receive an email confirming your payment was approved, and your order status will update to "Approved" in your account. Account credentials or digital items will then be delivered according to the product listing.',
  },
  {
    question: 'Can I get a refund?',
    answer: 'Due to the digital nature of our products, all sales are final once an item or account has been delivered. If you experience an issue with your order, contact us immediately through our Contact page and we\'ll do our best to resolve it.',
  },
  {
    question: 'Do you offer support after purchase?',
    answer: 'Yes. If you run into any issues with an account or item you\'ve purchased, reach out via our Contact page with your order number and we\'ll assist you.',
  },
  {
    question: 'Can I leave a review on a product?',
    answer: 'Yes, but only for products you\'ve actually purchased. This keeps reviews trustworthy and helps other customers make informed decisions.',
  },
  {
    question: 'Do I need an account to browse products?',
    answer: 'No, you can browse and add items to your cart without an account. However, you\'ll need to create one to complete checkout and track your orders.',
  },
]

export default function FAQPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 bg-gradient-to-b from-black via-black to-theme-950/10">
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <HelpCircle className="h-8 w-8 text-theme neon-glow" />
              <h1 className="gaming-title text-4xl md:text-5xl">
                Frequently Asked Questions
              </h1>
              <Sparkles className="h-5 w-5 text-theme-300 animate-pulse" />
            </div>
            <p className="text-gray-400 text-lg">
              Everything you need to know before you buy
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="p-6 rounded-xl glass border border-theme/10 hover:border-theme/20 transition-all"
              >
                <h3 className="text-lg font-semibold text-white mb-2 flex items-start gap-2">
                  <Gamepad2 className="h-5 w-5 text-theme flex-shrink-0 mt-0.5" />
                  {faq.question}
                </h3>
                <p className="text-gray-400 leading-relaxed pl-7">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 p-6 rounded-xl bg-theme/5 border border-theme/20 text-center">
            <p className="text-gray-300">
              Still have questions?{' '}
              <a href="/contact" className="text-theme hover:text-theme-300 font-medium hover:underline transition-colors">
                Get in touch with us
              </a>
            </p>
          </div>
        </div>
      </main>
      <WhatsAppButton />
      <Footer />
    </>
  )
}