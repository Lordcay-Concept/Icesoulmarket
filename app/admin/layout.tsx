// app/admin/layout.tsx
'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter, usePathname } from 'next/navigation'
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
  Lock,
  Tag,
  PanelLeftClose,
  PanelLeftOpen
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
  { href: '/admin/promo-codes', icon: Tag, label: 'Promo Codes' },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile, loading, isAdmin, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
    // Restore collapsed preference from a previous session
    const saved = localStorage.getItem('admin-sidebar-collapsed')
    if (saved === 'true') setIsCollapsed(true)
  }, [])

  useEffect(() => {
    if (!loading && !user && isHydrated) {
      router.push('/login?redirect=/admin')
    }
    if (!loading && user && !isAdmin && isHydrated) {
      router.push('/')
    }
  }, [user, loading, isAdmin, router, isHydrated])

  // Close the mobile drawer automatically whenever the route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const toggleCollapsed = () => {
    const next = !isCollapsed
    setIsCollapsed(next)
    localStorage.setItem('admin-sidebar-collapsed', String(next))
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

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
    <div className="min-h-screen bg-gradient-to-b from-black via-black to-theme-950/10">
      {/* Admin Navbar */}
      <nav className="fixed top-0 z-50 w-full glass border-b border-theme/10">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            {/* Desktop collapse toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex text-gray-400 hover:text-theme"
              onClick={toggleCollapsed}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
            </Button>

            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <Gamepad2 className="h-6 w-6 text-theme neon-glow" />
              <span className="text-xl font-bold">
                <span className="text-white">IcesoulMarket</span>
                <span className="text-theme neon-glow">Admin</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
              <Sparkles className="h-4 w-4 text-theme" />
              <span>{profile?.username || 'Admin'}</span>
            </div>
            <Avatar className="h-8 w-8 border border-theme/30">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-theme-500 to-green-600 text-black font-bold">
                {profile?.username?.[0]?.toUpperCase() || 'A'}
              </AvatarFallback>
            </Avatar>
            {/* Mobile hamburger */}
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
              className="hidden md:flex text-gray-400 hover:text-red-400"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className={`fixed z-40 h-[calc(100vh-4rem)] glass border-r border-theme/10 transition-all duration-300 flex flex-col ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}>
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-1">
            {navItems.map((item) => {
              const IconComponent = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'text-theme bg-theme/10'
                      : 'text-gray-400 hover:text-white hover:bg-theme/10'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <IconComponent className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
                </Link>
              )
            })}
          </div>

          <div className="border-t border-theme/10 p-4">
            <button
              onClick={handleSignOut}
              title={isCollapsed ? 'Logout' : undefined}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>Logout</span>}
            </button>
          </div>
        </aside>

        {/* Main Content — margin adjusts to match sidebar width */}
        <main className={`flex-1 p-6 transition-all duration-300 ${isCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
          {children}
        </main>
      </div>
    </div>
  )
}