// app/terms/page.tsx
import { Navbar } from '@/components/shared/Navbar'
import { Footer } from '@/components/shared/Footer'
import { WhatsAppButton } from '@/components/shared/WhatsAppButton'
import { FileText, Sparkles } from 'lucide-react'

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 bg-gradient-to-b from-black via-black to-emerald-950/10">
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-8 w-8 text-emerald-400 neon-glow" />
              <h1 className="gaming-title text-4xl md:text-5xl">
                Terms of Service
              </h1>
              <Sparkles className="h-5 w-5 text-emerald-300 animate-pulse" />
            </div>
            <p className="text-gray-400 text-lg">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="space-y-8 text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing or using IcesoulMarket, you agree to be bound by these Terms of Service. If you do
                not agree with any part of these terms, please do not use our platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">2. Nature of Products</h2>
              <p>
                IcesoulMarket sells digital gaming products, including but not limited to gaming accounts,
                weapon skins, cosmetic items, and in-game currency. All products are delivered digitally;
                no physical goods are shipped.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">3. Orders & Payment</h2>
              <p>
                Orders are placed through our checkout process and paid for via bank transfer. Payments are
                manually verified by our team before an order is marked as approved. Delivery occurs only
                after payment has been confirmed.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">4. Refund Policy</h2>
              <p>
                Due to the nature of digital goods, all sales are final once a product has been delivered.
                We do not offer refunds for change of mind. If you believe an item was misrepresented or
                you did not receive what you ordered, contact us immediately with your order number so we
                can investigate.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">5. Account Security</h2>
              <p>
                Once you receive a gaming account or item, you are responsible for securing it. We strongly
                recommend changing passwords immediately and enabling two-factor authentication where
                supported by the platform. IcesoulMarket is not responsible for losses resulting from a
                buyer&s failure to secure a purchased account after delivery.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">6. Prohibited Use</h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Use our platform for any unlawful purpose</li>
                <li>Attempt to defraud or circumvent our payment verification process</li>
                <li>Resell purchased accounts or items in violation of the original game publisher&apos;s terms</li>
                <li>Submit false or misleading reviews</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">7. Account Termination</h2>
              <p>
                We reserve the right to suspend or terminate accounts that violate these terms, engage in
                fraudulent activity, or abuse our platform in any way.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">8. Limitation of Liability</h2>
              <p>
                IcesoulMarket is not liable for indirect, incidental, or consequential damages arising from
                the use of purchased accounts or items, including but not limited to bans, suspensions, or
                restrictions issued by third-party game publishers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">9. Changes to These Terms</h2>
              <p>
                We may update these Terms of Service from time to time. Continued use of our platform after
                changes are posted constitutes acceptance of the revised terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">10. Contact Us</h2>
              <p>
                Questions about these Terms of Service can be directed to us via our{' '}
                <a href="/contact" className="text-emerald-400 hover:text-emerald-300 hover:underline transition-colors">
                  Contact page
                </a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <WhatsAppButton />
      <Footer />
    </>
  )
}