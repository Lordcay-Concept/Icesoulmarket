// app/account/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/shared/Navbar'
import { Footer } from '@/components/shared/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from '@/components/ui/use-toast'
import { 
  User, 
  Mail, 
  Calendar, 
  Package, 
  LogOut, 
  Settings, 
  Gamepad2, 
  Sparkles, 
  Shield,
  Save,
  Edit,
  X,
  Check,
  Camera
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AccountPage() {
  const { user, profile, loading, signOut, isAdmin } = useAuth()
  const supabase = createClient()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    avatar_url: '',
  })

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        full_name: profile.full_name || '',
        avatar_url: profile.avatar_url || '',
      })
    }
  }, [profile])

  useEffect(() => {
    if (!loading && !user && isHydrated) {
      router.push('/login?redirect=/account')
    }
  }, [user, loading, router, isHydrated])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          full_name: formData.full_name,
          avatar_url: formData.avatar_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id)

      if (error) throw error

      toast({
        title: 'Profile Updated! ✅',
        description: 'Your profile has been successfully updated.',
        variant: 'success',
      })
      
      setIsEditing(false)
      
      // Refresh the page to show updated data
      router.refresh()
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: 'Update Failed',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
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

  if (!isHydrated || loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-20 bg-gradient-to-b from-black via-black to-emerald-950/10 flex items-center justify-center">
          <div className="text-gray-400">Loading profile...</div>
        </main>
      </>
    )
  }

  if (!user) {
    return null
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 bg-gradient-to-b from-black via-black to-emerald-950/10">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <Gamepad2 className="h-8 w-8 text-emerald-400 neon-glow" />
              <h1 className="text-4xl font-bold text-white">
                My <span className="text-emerald-400 neon-glow">Profile</span>
              </h1>
              <Sparkles className="h-5 w-5 text-emerald-300 animate-pulse" />
              {isAdmin && (
                <span className="ml-2 px-3 py-1 rounded-full text-xs bg-emerald-400/20 text-emerald-400 border border-emerald-400/30">
                  Admin
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Profile Card */}
              <Card className="glass border-emerald-400/20 rounded-2xl md:col-span-1">
                <CardContent className="p-6 text-center">
                  <div className="relative inline-block">
                    <Avatar className="h-24 w-24 mx-auto mb-4 border-2 border-emerald-400/30">
                      <AvatarImage src={formData.avatar_url || ''} />
                      <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-green-600 text-black text-2xl font-bold">
                        {profile?.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <div className="absolute -bottom-1 -right-1 bg-emerald-400 rounded-full p-1.5">
                        <Camera className="h-3 w-3 text-black" />
                      </div>
                    )}
                  </div>
                  
                  {!isEditing ? (
                    <>
                      <h2 className="text-xl font-bold text-white">
                        {profile?.full_name || profile?.username || 'User'}
                      </h2>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                      <div className="mt-4 p-3 rounded-xl bg-emerald-400/5 border border-emerald-400/10">
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                          <Calendar className="h-4 w-4 text-emerald-400" />
                          <span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        className="mt-4 border-emerald-400/20 text-emerald-400 hover:bg-emerald-400/10 w-full"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Profile
                      </Button>
                    </>
                  ) : (
                    <div className="mt-2 space-y-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-400">Username</Label>
                        <Input
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          className="bg-black/50 border-emerald-400/20 focus:border-emerald-400 text-white h-9 text-sm"
                          placeholder="Username"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-400">Full Name</Label>
                        <Input
                          value={formData.full_name}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                          className="bg-black/50 border-emerald-400/20 focus:border-emerald-400 text-white h-9 text-sm"
                          placeholder="Full Name"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-400">Avatar URL</Label>
                        <Input
                          value={formData.avatar_url}
                          onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                          className="bg-black/50 border-emerald-400/20 focus:border-emerald-400 text-white h-9 text-sm"
                          placeholder="https://example.com/avatar.jpg"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-emerald-400 text-black hover:bg-emerald-400/80"
                          onClick={handleUpdateProfile}
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <div className="flex items-center gap-1">
                              <div className="h-3 w-3 animate-spin rounded-full border-2 border-black border-t-transparent" />
                              Saving...
                            </div>
                          ) : (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Save
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-red-400/20 text-red-400 hover:bg-red-400/10"
                          onClick={() => {
                            setIsEditing(false)
                            if (profile) {
                              setFormData({
                                username: profile.username || '',
                                full_name: profile.full_name || '',
                                avatar_url: profile.avatar_url || '',
                              })
                            }
                          }}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="mt-4 border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </CardContent>
              </Card>

              {/* Account Options */}
              <div className="md:col-span-2 space-y-4">
                <Card className="glass border-emerald-400/20 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Package className="h-5 w-5 text-emerald-400" />
                      Recent Orders
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400">No orders yet</p>
                      <Link href="/products">
                        <Button variant="link" className="text-emerald-400 hover:text-emerald-300">
                          Start Shopping
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass border-emerald-400/20 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Settings className="h-5 w-5 text-emerald-400" />
                      Account Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Link href="/account/orders">
                      <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-emerald-400/10 rounded-xl">
                        <Package className="mr-2 h-4 w-4 text-emerald-400" />
                        View All Orders
                      </Button>
                    </Link>
                    <Link href="/forgot-password">
                      <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-emerald-400/10 rounded-xl">
                        <Mail className="mr-2 h-4 w-4 text-emerald-400" />
                        Change Password
                      </Button>
                    </Link>
                    {isAdmin && (
                      <Link href="/admin/dashboard">
                        <Button variant="ghost" className="w-full justify-start text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 rounded-xl">
                          <Sparkles className="mr-2 h-4 w-4" />
                          Go to Admin Dashboard
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}