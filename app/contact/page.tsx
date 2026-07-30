// app/contact/page.tsx
'use client'

import { useState } from 'react'
import { Navbar } from '@/components/shared/Navbar'
import { Footer } from '@/components/shared/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'
import { DatabaseService } from '@/lib/services/database.service'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  Clock, 
  Gamepad2, 
  Sparkles,
  MessageCircle,
  Headphones,
  Shield,
  CheckCircle
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = DatabaseService.getSupabaseClient()
      const { error } = await supabase.from('messages').insert({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        status: 'unread',
      })

      if (error) throw error

      toast({
        title: 'Message Sent! 🎮',
        description: 'Our team will get back to you within 24 hours.',
        variant: 'success',
      })

      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 bg-gradient-to-b from-black via-black to-emerald-950/10">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Gamepad2 className="h-8 w-8 text-emerald-400 neon-glow" />
              <Sparkles className="h-5 w-5 text-emerald-300 animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              <span className="text-emerald-400 neon-glow">Contact</span> Our Team
            </h1>
            <p className="text-gray-400 mt-3 max-w-2xl mx-auto">
              Have questions about our products? Need help with your order? 
              We&apos;re here to help you 24/7.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="glass rounded-2xl border border-emerald-400/20 p-6 space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Headphones className="h-6 w-6 text-emerald-400" />
                    <h3 className="text-lg font-bold text-white">Get in Touch</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-3 rounded-xl bg-emerald-400/5 border border-emerald-400/10 hover:border-emerald-400/30 transition-all group">
                      <div className="p-2 rounded-lg bg-emerald-400/10 group-hover:bg-emerald-400/20 transition-all">
                        <Mail className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium text-sm">Email</h4>
                        <p className="text-gray-400 text-sm">admin@icesoulmarket.com</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-3 rounded-xl bg-emerald-400/5 border border-emerald-400/10 hover:border-emerald-400/30 transition-all group">
                      <div className="p-2 rounded-lg bg-emerald-400/10 group-hover:bg-emerald-400/20 transition-all">
                        <Phone className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium text-sm">Phone</h4>
                        <p className="text-gray-400 text-sm">+49 (176) 7045-7435</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-3 rounded-xl bg-emerald-400/5 border border-emerald-400/10 hover:border-emerald-400/30 transition-all group">
                      <div className="p-2 rounded-lg bg-emerald-400/10 group-hover:bg-emerald-400/20 transition-all">
                        <Clock className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium text-sm">Support Hours</h4>
                        <p className="text-gray-400 text-sm">24/7 - Always Available</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-3 rounded-xl bg-emerald-400/5 border border-emerald-400/10 hover:border-emerald-400/30 transition-all group">
                      <div className="p-2 rounded-lg bg-emerald-400/10 group-hover:bg-emerald-400/20 transition-all">
                        <MapPin className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium text-sm">Location</h4>
                        <p className="text-gray-400 text-sm">Online Gaming Hub</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-emerald-400/10">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Shield className="h-3 w-3" />
                      <span>Your data is safe with us</span>
                      <CheckCircle className="h-3 w-3 text-emerald-400" />
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="glass rounded-2xl border border-emerald-400/20 p-6 text-center">
                  <div className="text-4xl mb-3">⚡</div>
                  <h4 className="text-white font-bold mb-1">Quick Response</h4>
                  <p className="text-gray-400 text-sm">
                    We typically respond within <span className="text-emerald-400">1-2 hours</span>
                  </p>
                </div>
              </motion.div>
            </div>

            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="glass rounded-2xl border border-emerald-400/20 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <MessageCircle className="h-6 w-6 text-emerald-400" />
                    <h2 className="text-2xl font-bold text-white">Send Us a Message</h2>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-300 text-sm font-medium">Your Name</Label>
                        <Input 
                          id="name" 
                          name="name"
                          placeholder="John Doe" 
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="bg-black/50 border-emerald-400/20 focus:border-emerald-400 focus:ring-emerald-400/20 text-white placeholder:text-gray-500 h-12 rounded-xl transition-all"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-300 text-sm font-medium">Email Address</Label>
                        <Input 
                          id="email" 
                          name="email"
                          type="email" 
                          placeholder="john@example.com" 
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="bg-black/50 border-emerald-400/20 focus:border-emerald-400 focus:ring-emerald-400/20 text-white placeholder:text-gray-500 h-12 rounded-xl transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-gray-300 text-sm font-medium">Subject</Label>
                      <Input 
                        id="subject" 
                        name="subject"
                        placeholder="Order inquiry..." 
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="bg-black/50 border-emerald-400/20 focus:border-emerald-400 focus:ring-emerald-400/20 text-white placeholder:text-gray-500 h-12 rounded-xl transition-all"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-gray-300 text-sm font-medium">Message</Label>
                      <Textarea 
                        id="message" 
                        name="message"
                        placeholder="Write your message here..." 
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="bg-black/50 border-emerald-400/20 focus:border-emerald-400 focus:ring-emerald-400/20 text-white placeholder:text-gray-500 min-h-[150px] rounded-xl transition-all"
                        required
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 rounded-xl gaming-btn text-lg font-bold mt-2"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                          Sending...
                        </div>
                      ) : (
                        <>
                          <Send className="mr-2 h-5 w-5" />
                          Send Message
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-gray-500 text-center mt-2">
                      We&apos;ll never share your information. Your privacy is important to us.
                    </p>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}