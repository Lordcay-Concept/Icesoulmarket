// app/admin/layout.tsx
'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Gamepad2,
  Sparkles,
  CreditCard,
  Lock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface NavItem {
  href: string
  icon: React.ElementType 
  label: string
}

const navItems: NavItem[] = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/products', icon: Package, label: 'Products' },
  { href: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { href: '/admin/payments', icon: CreditCard, label: 'Payments' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/messages', icon: MessageSquare, label: 'Messages' },
  { href: '/admin/reviews', icon: Sparkles, label: 'Reviews' },
  { href: '/admin/change-password', icon: Lock, label: 'Change Password' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile, loading, isAdmin, signOut } = useAuth()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!loading && !user && isHydrated) {
      router.push('/login?redirect=/admin')
    }
    if (!loading && user && !isAdmin && isHydrated) {
      router.push('/')
    }
  }, [user, loading, isAdmin, router, isHydrated])

  if (!isHydrated || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-black to-emerald-950/10">
      {/* Admin Navbar */}
      <nav className="fixed top-0 z-50 w-full glass border-b border-emerald-400/10">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <Gamepad2 className="h-6 w-6 text-emerald-400 neon-glow" />
              <span className="text-xl font-bold">
                <span className="text-white">COD</span>
                <span className="text-emerald-400 neon-glow">Admin</span>
              </span>
            </Link>
            <span className="hidden md:inline text-xs px-2 py-1 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
              Admin Panel
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span>{profile?.username || 'Admin'}</span>
            </div>
            <Avatar className="h-8 w-8 border border-emerald-400/30">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-green-600 text-black font-bold">
                {profile?.username?.[0]?.toUpperCase() || 'A'}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-gray-400 hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-red-400"
              onClick={signOut}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className={`fixed z-40 h-[calc(100vh-4rem)] w-64 glass border-r border-emerald-400/10 transition-transform ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}>
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const IconComponent = item.icon 
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-emerald-400/10 transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <IconComponent className="h-5 w-5" /> 
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-64 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}