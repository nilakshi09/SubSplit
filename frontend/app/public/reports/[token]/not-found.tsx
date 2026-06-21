import Link from 'next/link'
import { Link as LinkIcon } from 'lucide-react'

export default function PublicReportNotFound() {
  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col items-center justify-center p-4">
      {/* Spotbot Logo */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg">
          S
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          Spotbot
        </span>
      </div>

      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-white/10">
          <LinkIcon className="w-10 h-10 text-gray-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-white">Report Not Found</h1>
        
        <p className="text-gray-400 text-lg">
          This report has expired or doesn't exist.
        </p>
        
        <p className="text-sm text-gray-500">
          The link may have expired or been revoked by its owner.
        </p>
        
        <div className="pt-8">
          <Link 
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(79,70,229,0.3)]"
          >
            Go to Spotbot →
          </Link>
        </div>
      </div>
    </div>
  )
}
