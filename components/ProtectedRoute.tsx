'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [hasChecked, setHasChecked] = useState(false)

  useEffect(() => {
    // Only redirect after we've checked once
    if (!isLoading && !user && hasChecked) {
      router.push('/login?message=Please log in to access this page.')
    }
    
    if (!isLoading) {
      setHasChecked(true)
    }
  }, [user, isLoading, router, hasChecked])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-beige-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy-700 mb-4"></div>
          <p className="text-navy-700">Authenticating...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    // Show loading briefly while redirecting
    return (
      <div className="min-h-screen flex items-center justify-center bg-beige-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-navy-700 mb-4"></div>
          <p className="text-navy-700">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

