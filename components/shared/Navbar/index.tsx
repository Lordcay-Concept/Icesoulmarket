'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  ShoppingCart, 
  User, 
  Menu, 
  LogOut, 
  Package, 
  Gamepad2,
  Sparkles,
  X,
  Settings,
  UserCircle,
  ChevronDown
} from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useCartStore } from '@/lib/stores/cartStore'
import { toast } from '@/components/ui/use-toast'

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile, signOut, isAdmin } = useAuth()
  const { items } = useCartStore()
  const [isHydrated, setIsHydrated] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  
  useEffect(() => {
    setIsHydrated(true)
  }, [])
  
  const cartCount = isHydrated ? items.reduce((acc: number, item) => acc + item.quantity, 0) : 0

  const getDisplayName = (profile: any) => {
    if (profile?.username) return profile.username
    return 'User'
  }

  const getAvatarFallback = (profile: any) => {
    const name = getDisplayName(profile)
    return name[0]?.toUpperCase() || 'U'
  }

  const handleSignOut = async () => {
    await signOut()
    toast({
      title: 'Signed Out',
      description: 'You have been successfully signed out.',
      variant: 'default',
    })
    router.push('/')
  }

  const navLinks = [
    { href: '/products', label: 'Products' },
    { href: '/categories', label: 'Categories' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <nav className="fixed top-0 z-50 w-full glass border-b border-theme-10">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <Gamepad2 className="h-6 w-6 text-theme neon-glow" />
            <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-theme-70 animate-pulse" />
          </div>
          <span className="text-xl font-bold">
            <span className="text-white">Icesoul</span>
            <span className="text-theme neon-glow">Market</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300',
                pathname === link.href
                  ? 'text-theme bg-theme-10 neon-glow'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Actions - Desktop */}
        <div className="flex items-center gap-3">
          {/* Cart */}
          <Link href="/cart" className="relative group">
            <Button variant="ghost" size="icon" className="relative hover:bg-theme-10">
              <ShoppingCart className="h-5 w-5 text-gray-400 group-hover:text-theme transition-colors" />
              {isHydrated && cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full gradient-theme gradient-theme-text text-xs font-bold">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>

          {/* User Dropdown Menu - Desktop only */}
          {user ? (
            <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <div className="hidden md:flex items-center gap-2 rounded-full hover:bg-theme-10 px-3 py-1.5 cursor-pointer transition-all hover:scale-105">
                  <Avatar className="h-8 w-8 border border-theme-30">
                    <AvatarImage src={profile?.avatar_url || ''} />
                    <AvatarFallback className="gradient-theme gradient-theme-text font-bold">
                      {getAvatarFallback(profile)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-300 font-medium">
                    {getDisplayName(profile)}
                  </span>
                  <ChevronDown className={cn(
                    "h-4 w-4 text-gray-400 transition-transform duration-200",
                    isDropdownOpen && "rotate-180"
                  )} />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="glass border-theme-20 w-56" align="end" sideOffset={8}>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-white">
                      {getDisplayName(profile)}
                    </p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                    {isAdmin && (
                      <span className="text-xs text-theme font-medium">🔑 Admin</span>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-theme-10" />
                
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-theme-10 focus:bg-theme-10">
                  <Link href="/account" className="text-gray-300 hover:text-theme transition-colors">
                    <UserCircle className="mr-2 h-4 w-4" />
                    My Profile
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-theme-10 focus:bg-theme-10">
                  <Link href="/account/orders" className="text-gray-300 hover:text-theme transition-colors">
                    <Package className="mr-2 h-4 w-4" />
                    My Orders
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-theme-10 focus:bg-theme-10">
                  <Link href="/account/settings" className="text-gray-300 hover:text-theme transition-colors">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                
                {isAdmin && (
                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-theme-10 focus:bg-theme-10">
                    <Link href="/admin/dashboard" className="text-theme hover:opacity-80 transition-opacity">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator className="bg-theme-10" />
                
                <DropdownMenuItem 
                  onClick={handleSignOut} 
                  className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-400/10 focus:bg-red-400/10"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login" className="hidden md:block">
              <Button className="gaming-btn text-sm px-4 py-2">
                Login
              </Button>
            </Link>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-gray-400 hover:text-white pr-1 mr-1"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass border-t border-theme-10">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300',
                  pathname === link.href
                    ? 'text-theme bg-theme-10 neon-glow'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            
            {user ? (
              <>
                <Link
                  href="/account"
                  className="px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Account
                </Link>
                <Link
                  href="/account/orders"
                  className="px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Orders
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin/dashboard"
                    className="px-4 py-3 rounded-lg text-sm font-medium text-theme hover:opacity-80 hover:bg-theme-10"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleSignOut()
                    setIsMobileMenuOpen(false)
                  }}
                  className="px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-3 rounded-lg text-sm font-medium text-theme hover:opacity-80 hover:bg-theme-10"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}