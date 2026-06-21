'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service in production
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-[128px] pointer-events-none" />
      
      {/* Spotbot Logo */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg">
          S
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          Spotbot
        </span>
      </div>

      <div className="max-w-md w-full text-center space-y-6 relative z-10 bg-[#1C1C22]/50 p-8 rounded-2xl border border-white/10 backdrop-blur-xl">
        <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/20">
          <AlertCircle className="w-10 h-10 text-red-400" />
        </div>
        
        <h1 className="text-3xl font-bold text-white">Something went wrong</h1>
        
        <div className="bg-black/50 rounded-lg p-4 text-left border border-white/5 overflow-auto max-h-40">
          <p className="text-sm text-red-400 font-mono">
            {process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred processing your request.'}
          </p>
        </div>
        
        <div className="pt-4 flex flex-col gap-3">
          <button 
            onClick={() => reset()}
            className="w-full inline-flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
          >
            Try Again
          </button>
          <Link 
            href="/dashboard"
            className="w-full inline-flex items-center justify-center px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-colors border border-white/10"
          >
            Go to Dashboard →
          </Link>
        </div>
      </div>
    </div>
  )
}
