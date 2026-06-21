'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { api } from '@/lib/api-client'

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'member'
  organizationId: string
  avatarUrl?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (token: string, user: User) => void
  logout: () => void
  updateUser: (data: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Attempt to load user from local storage or validate token on mount
    const checkAuth = async () => {
      const token = localStorage.getItem('spotbot_token')
      if (token) {
        try {
          const userData = await api.get<User>('/api/users/me')
          setUser(userData)
        } catch (error) {
          localStorage.removeItem('spotbot_token')
        }
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const login = (token: string, userData: User) => {
    localStorage.setItem('spotbot_token', token)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('spotbot_token')
    setUser(null)
  }

  const updateUser = (data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
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
