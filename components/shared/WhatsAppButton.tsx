// components/shared/WhatsAppButton.tsx
'use client'

import { MessageCircle } from 'lucide-react'

const WHATSAPP_NUMBER = '4917670457435'
const DEFAULT_MESSAGE = 'Hi! I have a question about a product on IcesoulMarket.'

interface WhatsAppButtonProps {
  message?: string
  variant?: 'floating' | 'inline'
}

export function WhatsAppButton({ message = DEFAULT_MESSAGE, variant = 'floating' }: WhatsAppButtonProps) {
  const link = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`

  if (variant === 'inline') {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-theme transition-colors"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="text-sm">Chat with us on WhatsApp</span>
      </a>
    )
  }

  // Floating button - uses theme colors with subtle WhatsApp hint
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-theme hover:bg-theme/80 shadow-lg shadow-black/30 transition-all hover:scale-110 group"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-7 w-7 text-theme-text-on-primary fill-theme-text-on-primary group-hover:scale-110 transition-transform" />
    </a>
  )
}