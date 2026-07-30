// app/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { Eye, EyeOff, Mail, Lock, Gamepad2, Sparkles, Shield, Crown, Home, ArrowRight } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams?.get('redirect') || '/'
  const { user, signIn } = useAuth()
  const supabase = createClient() 
  
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsLoading(true)

  try {
    await signIn(formData.email, formData.password)

    const { data: { user: freshUser } } = await supabase.auth.getUser()

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', freshUser?.id)
      .single()

    if (profileError) {
      console.error('Profile lookup failed:', profileError.message)
    }

    toast({
      title: 'Welcome back, Gamer! 🎮',
      description: 'You have been successfully logged in.',
      variant: 'success',
    })


    const destination = profile?.is_admin ? '/admin/dashboard' : redirect
    window.location.href = destination
  } catch (error) {
    toast({
      title: 'Login failed',
      description: 'Invalid email or password. Please try again.',
      variant: 'destructive',
    })
    setIsLoading(false)
  }
}

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-emerald-950/30" />
      <div className="absolute inset-0 grid-overlay opacity-20" />
      <div className="absolute inset-0 scanline" />
      
      {/* Floating Orbs */}
      <motion.div
        className="absolute top-20 left-20 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl"
        animate={{ 
          x: [0, 100, 0],
          y: [0, -50, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-emerald-400/5 blur-3xl"
        animate={{ 
          x: [0, -100, 0],
          y: [0, 50, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      />

      {/* Floating Particles */}
      {[...Array(30)].map((_, i) => (
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
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
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
                <h1 className="text-2xl font-bold text-white">Icesoul<span className="text-emerald-400 neon-glow">Market</span></h1>
                <p className="text-xs text-gray-500">Premium Gaming Store</p>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-white mt-4">
              Welcome Back, <span className="text-emerald-400 neon-glow">Gamer</span>
            </h2>
            <p className="text-gray-400 text-sm mt-1">Login to continue your gaming journey</p>
          </div>

          <div className="flex justify-start mb-4">
          <Link href="/" className="flex items-center gap-2 text-sm text-gray-400 hover:text-emerald-400 transition-colors">
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300 text-sm font-medium">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400 group-focus-within:text-emerald-300 transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10 bg-black/50 border-emerald-400/20 focus:border-emerald-400 focus:ring-emerald-400/20 text-white placeholder:text-gray-500 h-12 rounded-xl transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-300 text-sm font-medium">Password</Label>
                <Link href="/forgot-password" className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400 group-focus-within:text-emerald-300 transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
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

            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl gaming-btn text-lg font-bold mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  Logging in...
                </div>
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-emerald-400 hover:text-emerald-300 font-medium hover:underline transition-colors">
                Create one
              </Link>
            </p>
            
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                <span>Secure</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Crown className="h-3 w-3" />
                <span>Premium</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                <span>Trusted</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}