// app/admin/users/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { DatabaseService } from '@/lib/services/database.service'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, Users, Shield, ShieldOff, Trash2 } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

interface UserProfile {
  id: string
  username: string
  full_name: string | null
  email: string
  avatar_url: string | null
  is_admin: boolean
  created_at: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const supabase = DatabaseService.getSupabaseClient()

      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error loading users:', error)
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleAdmin = async (user: UserProfile) => {
    try {
      const supabase = DatabaseService.getSupabaseClient()
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !user.is_admin })
        .eq('id', user.id)

      if (error) throw error

      toast({
        title: 'Success!',
        description: `${user.username} is ${!user.is_admin ? 'now' : 'no longer'} an admin`,
        variant: 'success',
      })
      loadUsers()
    } catch (error) {
      console.error('Error updating user:', error)
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (user: UserProfile) => {
    if (user.id === currentUserId) {
      toast({
        title: 'Not allowed',
        description: 'You cannot delete your own admin account',
        variant: 'destructive',
      })
      return
    }
    if (!confirm(`Delete user ${user.username}? This cannot be undone.`)) return

    try {
      const supabase = DatabaseService.getSupabaseClient()
      const { error } = await supabase.from('profiles').delete().eq('id', user.id)

      if (error) throw error

      toast({ title: 'User deleted', variant: 'success' })
      loadUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive',
      })
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading users...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          <span className="text-emerald-400 neon-glow">Users</span>
        </h1>
        <p className="text-gray-400 mt-1">Manage customer and admin accounts</p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by username or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-black/50 border-emerald-400/20 focus:border-emerald-400 text-white"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="glass border-emerald-400/10 rounded-2xl">
            <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-emerald-400/30">
                  <AvatarImage src={user.avatar_url || ''} />
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-green-600 text-black font-bold">
                    {user.username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium">{user.username}</p>
                    {user.is_admin && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-400/20 text-emerald-400">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-emerald-400/20 text-emerald-400 hover:bg-emerald-400/10"
                  onClick={() => toggleAdmin(user)}
                >
                  {user.is_admin ? (
                    <>
                      <ShieldOff className="h-3 w-3 mr-1" />
                      Remove Admin
                    </>
                  ) : (
                    <>
                      <Shield className="h-3 w-3 mr-1" />
                      Make Admin
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-400/20 text-red-400 hover:bg-red-400/10"
                  onClick={() => handleDelete(user)}
                  disabled={user.id === currentUserId}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No users found</p>
        </div>
      )}
    </div>
  )
}