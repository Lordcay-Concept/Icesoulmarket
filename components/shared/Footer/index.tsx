import Link from 'next/link'
import { Gamepad2, Sparkles, Mail } from 'lucide-react'
import { WhatsAppButton } from '@/components/shared/WhatsAppButton'

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
    <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z"/>
  </svg>
)

export function Footer() {
  return (
    <footer className="border-t border-theme-10 bg-black">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <Gamepad2 className="h-6 w-6 text-theme" />
              <span className="text-xl font-bold">
                <span className="text-white">Icesoul</span>
                <span className="text-theme">Market</span>
              </span>
              <Sparkles className="h-4 w-4 text-theme-70" />
            </Link>
            <p className="text-sm text-gray-400">
              Premium gaming accounts, skins, and in-game currency, delivered instantly.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-white font-semibold">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products" className="text-gray-400 hover:text-theme transition-colors">All Products</Link></li>
              <li><Link href="/categories" className="text-gray-400 hover:text-theme transition-colors">Categories</Link></li>
              <li><Link href="/products?sort=popular" className="text-gray-400 hover:text-theme transition-colors">Best Sellers</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-white font-semibold">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/contact" className="text-gray-400 hover:text-theme transition-colors">Contact Us</Link></li>
              <li><Link href="/account/orders" className="text-gray-400 hover:text-theme transition-colors">Track Order</Link></li>
              <li><Link href="/faq" className="text-gray-400 hover:text-theme transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-white font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="text-gray-400 hover:text-theme transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-theme transition-colors">Terms of Service</Link></li>
            </ul>
            <div className="pt-2">
              <a
                href="https://www.tiktok.com/@icesoulmarket.com?_r=1&_t=ZG-98MOI5C35Mm"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-theme transition-colors"
              >
                <TikTokIcon />
                <span className="text-sm">Follow us on TikTok</span>
              </a>
            </div>
            <div className="pt-2">
            <WhatsAppButton variant="inline" />
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-theme-10 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} IcesoulMarket. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <Mail className="h-3 w-3" />
            <span>admin@icesoulmarket.com</span>
          </div>
        </div>
      </div>
    </footer>
  )
}