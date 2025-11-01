'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-beige-50 flex items-center justify-center p-4">
          <div className="max-w-md text-center">
            <h2 className="text-3xl font-bold text-navy-900 mb-4">Something went wrong!</h2>
            <p className="text-navy-700 mb-6">{error.message || 'An unexpected error occurred'}</p>
            <button
              onClick={reset}
              className="px-6 py-3 bg-navy-700 text-white rounded-lg hover:bg-navy-800 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}

