'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { User, Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

interface Profile {
  id: string
  name: string
  email: string
  phone?: string
  created_at: string
}

interface Order {
  id: string
  user_id: string
  order_id: string
  product_name: string
  quantity: number
  price: number
  total: number
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled'
  created_at: string
  payment_method: string
  address?: string
}

interface Transaction {
  id: string
  user_id: string
  transaction_id: string
  order_id: string
  amount: number
  status: 'success' | 'pending' | 'failed'
  created_at: string
  payment_method: string
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  orders: Order[]
  transactions: Transaction[]
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ success: boolean; error?: string }>
  changePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>
  changeEmail: (newEmail: string) => Promise<{ success: boolean; error?: string }>
  addOrder: (order: Omit<Order, 'id' | 'user_id' | 'created_at'>) => Promise<void>
  addTransaction: (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const router = useRouter()

  // Load user session and data on mount
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
        loadOrders(session.user.id)
        loadTransactions(session.user.id)
      }
      setIsLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await loadProfile(session.user.id)
        await loadOrders(session.user.id)
        await loadTransactions(session.user.id)
      } else {
        setProfile(null)
        setOrders([])
        setTransactions([])
      }
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" - we'll create profile if it doesn't exist
        console.error('Error loading profile:', error)
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  const loadOrders = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading orders:', error)
      } else {
        setOrders(data || [])
      }
    } catch (error) {
      console.error('Error loading orders:', error)
    }
  }

  const loadTransactions = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading transactions:', error)
      } else {
        setTransactions(data || [])
      }
    } catch (error) {
      console.error('Error loading transactions:', error)
    }
  }

  const signup = async (
    name: string,
    email: string,
    password: string,
    phone?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) {
        return { success: false, error: authError.message }
      }

      if (authData.user) {
        // Create profile
        const { error: profileError } = await supabase.from('profiles').insert({
          id: authData.user.id,
          name,
          email,
          phone: phone || null,
        })

        if (profileError) {
          console.error('Error creating profile:', profileError)
          return { success: false, error: 'Failed to create profile' }
        }

        setUser(authData.user)
        await loadProfile(authData.user.id)
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'Something went wrong' }
    }
  }

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        setUser(data.user)
        await loadProfile(data.user.id)
        await loadOrders(data.user.id)
        await loadTransactions(data.user.id)
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'Something went wrong' }
    }
  }

  const logout = async () => {
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Logout error:', error)
        // Still proceed with local cleanup even if Supabase signout fails
      }

      // Clear all local state
      setUser(null)
      setProfile(null)
      setOrders([])
      setTransactions([])

      // Redirect to home page
      router.push('/')
      router.refresh() // Refresh to update any cached data
    } catch (error) {
      console.error('Error during logout:', error)
      // Still clear local state even if there's an error
      setUser(null)
      setProfile(null)
      setOrders([])
      setTransactions([])
      router.push('/')
    }
  }

  const updateProfile = async (
    updates: Partial<Profile>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) {
        return { success: false, error: error.message }
      }

      // Update email in auth if it changed
      if (updates.email && updates.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: updates.email,
        })
        if (emailError) {
          return { success: false, error: emailError.message }
        }
      }

      await loadProfile(user.id)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'Something went wrong' }
    }
  }

  const changePassword = async (
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'Something went wrong' }
    }
  }

  const changeEmail = async (
    newEmail: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      // Update profile email
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ email: newEmail })
        .eq('id', user.id)

      if (profileError) {
        return { success: false, error: profileError.message }
      }

      await loadProfile(user.id)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'Something went wrong' }
    }
  }

  const addOrder = async (order: Omit<Order, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          ...order,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) {
        console.error('Error adding order:', error)
      } else {
        setOrders([data, ...orders])
      }
    } catch (error) {
      console.error('Error adding order:', error)
    }
  }

  const addTransaction = async (
    transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>
  ) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          ...transaction,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) {
        console.error('Error adding transaction:', error)
      } else {
        setTransactions([data, ...transactions])
      }
    } catch (error) {
      console.error('Error adding transaction:', error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        orders,
        transactions,
        login,
        signup,
        logout,
        updateProfile,
        changePassword,
        changeEmail,
        addOrder,
        addTransaction,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
