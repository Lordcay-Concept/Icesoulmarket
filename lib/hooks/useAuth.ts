// lib/hooks/useAuth.ts
'use client'

import { useEffect, useState, useRef  } from 'react'
import { type User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/lib/stores/cartStore'
import { ensureCartHydrated } from '@/lib/stores/cartStore'
import { useRouter } from 'next/navigation'

interface UserProfile {
  id: string
  email: string
  username: string
  full_name: string | null
  avatar_url: string | null
  is_admin: boolean
  created_at: string
  updated_at: string
}

interface UseAuthReturn {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, username: string) => Promise<void>
  signOut: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const lastSyncedUserId = useRef<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const fetchProfile = async (userId: string) => {
    try {
      console.log('🔍 Fetching profile for user:', userId)
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('❌ Error fetching profile:', error.message)
        return null
      }

      if (!data) {
        console.log('⚠️ No profile found, creating one...')
        // Try to create profile
        const { data: userData } = await supabase.auth.getUser()
        const email = userData?.user?.email || ''
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: email,
            username: email.split('@')[0],
            full_name: email.split('@')[0],
            is_admin: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        
        if (insertError) {
          console.error('❌ Error creating profile:', insertError.message)
          return null
        }
        
        // Fetch again
        const { data: newData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle()
          
        return newData as UserProfile | null
      }

      return data as UserProfile
    } catch (error) {
      console.error('❌ Error in fetchProfile:', error)
      return null
    }
  }

  useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true)
        
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        
        if (user) {
        const profileData = await fetchProfile(user.id)
        setProfile(profileData)
        setIsAdmin(profileData?.is_admin || false)

        if (lastSyncedUserId.current !== user.id) {
          lastSyncedUserId.current = user.id
          await ensureCartHydrated() 
          await useCartStore.getState().loadUserCart(user.id)
        }
      }
      } catch (error) {
        console.error('Error getting user:', error)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
  async (_event, session) => {
    setUser(session?.user ?? null)

    if (session?.user) {
      const profileData = await fetchProfile(session.user.id)
      setProfile(profileData)
      setIsAdmin(profileData?.is_admin || false)

      if (lastSyncedUserId.current !== session.user.id) {
        lastSyncedUserId.current = session.user.id
        useCartStore.getState().loadUserCart(session.user.id)
      }
    } else {
      lastSyncedUserId.current = null
      setProfile(null)
      setIsAdmin(false)
    }

    setLoading(false)
  }
)

    return () => subscription.unsubscribe()
  }, [supabase])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  const signUp = async (email: string, password: string, username: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: username,
        },
      },
    })
    if (error) throw error
  }

  const signOut = async () => {
  await supabase.auth.signOut()
  lastSyncedUserId.current = null
  useCartStore.getState().handleLogout()
  router.push('/')
}

  return { user, profile, loading, isAdmin, signIn, signUp, signOut }
}