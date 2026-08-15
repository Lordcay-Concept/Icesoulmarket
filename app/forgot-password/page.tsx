// app/forgot-password/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { Mail, ArrowLeft, CheckCircle, Gamepad2, Sparkles, Shield, Home } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      setIsSent(true)
      toast({
        title: 'Reset Email Sent! 📧',
        description: 'Check your email for the password reset link.',
        variant: 'success',
      })
    } catch (error) {
      console.error('Reset password error:', error)
      toast({
        title: 'Error',
        description: 'Failed to send reset email. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-black to-theme-950/10 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-theme-950/30" />
      <div className="absolute inset-0 grid-overlay opacity-20" />
      <div className="absolute inset-0 scanline" />
      
      {/* Floating Orbs */}
      <motion.div
        className="absolute top-20 left-20 w-64 h-64 rounded-full bg-theme-500/10 blur-3xl"
        animate={{ 
          x: [0, 100, 0],
          y: [0, -50, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-theme/5 blur-3xl"
        animate={{ 
          x: [0, -100, 0],
          y: [0, 50, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      />

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-1 w-1 rounded-full bg-theme/20"
          initial={{
            x: Math.random() * 100 + '%',
            y: Math.random() * 100 + '%',
          }}
          animate={{
            y: ['0%', '100%'],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: 10 + Math.random() * 20,
            repeat: Infinity,
            ease: 'linear',
            delay: Math.random() * 10,
          }}
          style={{
            left: Math.random() * 100 + '%',
          }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass rounded-2xl border border-theme/20 shadow-2xl shadow-theme/5 p-8">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative">
                <Gamepad2 className="h-10 w-10 text-theme neon-glow" />
                <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-theme-300 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">COD<span className="text-theme neon-glow">Shop</span></h1>
                <p className="text-xs text-gray-500">Premium Gaming Store</p>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-white mt-4">
              Forgot <span className="text-theme neon-glow">Password</span>
            </h2>
            <p className="text-gray-400 text-sm mt-1">Enter your email to reset your password</p>
          </div>

          {/* Home Button */}
          <div className="flex justify-start mb-4">
            <Link href="/" className="flex items-center gap-2 text-sm text-gray-400 hover:text-theme transition-colors">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
          
          {isSent ? (
            <CardContent className="text-center py-8 px-0">
              <div className="mb-6">
                <div className="h-20 w-20 rounded-full bg-theme/10 mx-auto flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-theme" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Check Your Email</h3>
              <p className="text-gray-400 text-sm mb-6">
                We&apos;ve sent a password reset link to <span className="text-theme">{email}</span>
              </p>
              <Button
                className="gaming-btn w-full"
                onClick={() => router.push('/login')}
              >
                Back to Login
              </Button>
            </CardContent>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300 text-sm font-medium">Email Address</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-theme group-focus-within:text-theme-300 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10 bg-black/50 border-theme/20 focus:border-theme focus:ring-theme/20 text-white placeholder:text-gray-500 h-12 rounded-xl transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400 bg-theme/5 p-3 rounded-xl border border-theme/10">
                <Shield className="h-4 w-4 text-theme flex-shrink-0" />
                <span>We&apos;ll send you a secure link to reset your password.</span>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 rounded-xl gaming-btn text-lg font-bold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                    Sending...
                  </div>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
              
              <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-theme transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </form>
          )}
        </div>
      </motion.div>
    </main>
  )
}