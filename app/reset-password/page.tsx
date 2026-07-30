// app/reset-password/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { Lock, Eye, EyeOff, CheckCircle, Gamepad2, Sparkles, Shield, Home } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isReset, setIsReset] = useState(false)
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })

  useEffect(() => {
    // Check if we have a valid session for password reset
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast({
          title: 'Invalid Link',
          description: 'The password reset link is invalid or expired.',
          variant: 'destructive',
        })
        router.push('/forgot-password')
      }
    }
    checkSession()
  }, [supabase, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure both passwords match.',
        variant: 'destructive',
      })
      return
    }

    if (formData.password.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password,
      })

      if (error) throw error

      setIsReset(true)
      toast({
        title: 'Password Reset! 🎉',
        description: 'Your password has been successfully updated.',
        variant: 'success',
      })

      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (error) {
      console.error('Reset password error:', error)
      toast({
        title: 'Error',
        description: 'Failed to reset password. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isReset) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-black via-black to-emerald-950/10 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="glass rounded-2xl border border-emerald-400/20 shadow-2xl shadow-emerald-400/5 p-8">
            <div className="text-center py-4">
              <div className="mb-6">
                <div className="h-20 w-20 rounded-full bg-emerald-400/10 mx-auto flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-emerald-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Password Reset Complete! ✅</h3>
              <p className="text-gray-400 text-sm mb-6">
                Your password has been successfully reset. You can now login with your new password.
              </p>
              <Button
                className="gaming-btn w-full"
                onClick={() => router.push('/login')}
              >
                Go to Login
              </Button>
              <Link href="/" className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-emerald-400 transition-colors mt-4">
                <Home className="h-4 w-4" />
                Back to Home
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-black to-emerald-950/10 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-emerald-950/30" />
      <div className="absolute inset-0 grid-overlay opacity-20" />
      <div className="absolute inset-0 scanline" />
      
      {/* Floating Orbs */}
      <motion.div
        className="absolute top-20 right-20 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl"
        animate={{ 
          x: [0, -100, 0],
          y: [0, 50, 0],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute bottom-20 left-20 w-80 h-80 rounded-full bg-emerald-400/5 blur-3xl"
        animate={{ 
          x: [0, 100, 0],
          y: [0, -50, 0],
        }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      />

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-1 w-1 rounded-full bg-emerald-400/20"
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
        <div className="glass rounded-2xl border border-emerald-400/20 shadow-2xl shadow-emerald-400/5 p-8">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative">
                <Gamepad2 className="h-10 w-10 text-emerald-400 neon-glow" />
                <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-emerald-300 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">COD<span className="text-emerald-400 neon-glow">Shop</span></h1>
                <p className="text-xs text-gray-500">Premium Gaming Store</p>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-white mt-4">
              Reset <span className="text-emerald-400 neon-glow">Password</span>
            </h2>
            <p className="text-gray-400 text-sm mt-1">Enter your new password below</p>
          </div>

          {/* Home Button */}
          <div className="flex justify-start mb-4">
            <Link href="/" className="flex items-center gap-2 text-sm text-gray-400 hover:text-emerald-400 transition-colors">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300 text-sm font-medium">New Password</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400 group-focus-within:text-emerald-300 transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 6 characters"
                  className="pl-10 pr-12 bg-black/50 border-emerald-400/20 focus:border-emerald-400 focus:ring-emerald-400/20 text-white placeholder:text-gray-500 h-12 rounded-xl transition-all"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-300 text-sm font-medium">Confirm Password</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400 group-focus-within:text-emerald-300 transition-colors" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  className="pl-10 pr-12 bg-black/50 border-emerald-400/20 focus:border-emerald-400 focus:ring-emerald-400/20 text-white placeholder:text-gray-500 h-12 rounded-xl transition-all"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400 bg-emerald-400/5 p-3 rounded-xl border border-emerald-400/10">
              <Shield className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <span>Password must be at least 6 characters long.</span>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl gaming-btn text-lg font-bold"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  Resetting...
                </div>
              ) : (
                'Reset Password'
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </main>
  )
}