// app/privacy/page.tsx
import { Navbar } from '@/components/shared/Navbar'
import { Footer } from '@/components/shared/Footer'
import { Shield, Sparkles } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 bg-gradient-to-b from-black via-black to-emerald-950/10">
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-8 w-8 text-emerald-400 neon-glow" />
              <h1 className="gaming-title text-4xl md:text-5xl">
                Privacy Policy
              </h1>
              <Sparkles className="h-5 w-5 text-emerald-300 animate-pulse" />
            </div>
            <p className="text-gray-400 text-lg">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="space-y-8 text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
              <p>
                When you create an account, place an order, or contact us, we collect information such as your name,
                email address, and order details. When you complete a bank transfer payment, we do not collect or
                store your banking credentials — payment is handled directly between you and your bank.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Process and deliver your orders</li>
                <li>Send order confirmations and payment status updates</li>
                <li>Respond to support requests</li>
                <li>Improve our products and services</li>
                <li>Prevent fraud and maintain the security of our platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">3. Data Storage & Security</h2>
              <p>
                Your data is stored securely using industry-standard encryption and access controls. We use
                Row Level Security to ensure that only you (and authorized administrators, where necessary)
                can access your account and order information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">4. Third-Party Services</h2>
              <p>
                We use trusted third-party services to operate our platform, including email delivery services
                for order notifications. These providers only receive the minimum information necessary to
                perform their function and are not permitted to use your data for any other purpose.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">5. Cookies</h2>
              <p>
                We use essential cookies to keep you logged in and to remember items in your shopping cart.
                We do not use cookies for third-party advertising or tracking purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">6. Your Rights</h2>
              <p>
                You may request access to, correction of, or deletion of your personal data at any time by
                contacting us. You can also update your profile information directly from your account settings.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">7. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy or how your data is handled, please reach
                out via our{' '}
                <a href="/contact" className="text-emerald-400 hover:text-emerald-300 hover:underline transition-colors">
                  Contact page
                </a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}