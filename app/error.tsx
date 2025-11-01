'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-beige-50 pt-16 sm:pt-20 md:pt-24 pb-12 flex items-center justify-center">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-3xl font-bold text-navy-900 mb-4">Something went wrong!</h2>
          <p className="text-navy-700 mb-6">{error.message || 'An unexpected error occurred'}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={reset}
              className="px-6 py-3 bg-navy-700 text-white rounded-lg hover:bg-navy-800 transition-colors"
            >
              Try again
            </button>
            <a
              href="/"
              className="px-6 py-3 bg-white border-2 border-navy-700 text-navy-900 rounded-lg hover:bg-navy-50 transition-colors"
            >
              Go home
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

