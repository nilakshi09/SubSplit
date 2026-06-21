import { notFound, redirect } from 'next/navigation'
import { api } from '@/lib/api-client'
import { ScanReport } from '@/components/report/scan-report'
import type { Scan } from '@/types/scan'
import { XCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface Props {
  params: { id: string }
}

export default async function ScanResultPage({ params }: Props) {
  let scan: Scan

  try {
    scan = await api.get<Scan>(`/api/scans/${params.id}`)
  } catch {
    notFound()
  }

  // If scan is still processing, redirect to scan progress page
  if (scan.status === 'pending' || scan.status === 'processing') {
    redirect(`/scan?resumeId=${params.id}`)
  }

  // If scan failed
  if (scan.status === 'failed') {
    return <ScanFailedView scan={scan} />
  }

  return <ScanReport scan={scan} />
}

export async function generateMetadata({ params }: Props) {
  return {
    title: `@${params.id} Fraud Report — Spotbot`,
  }
}

function ScanFailedView({ scan }: { scan: Scan }) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#111] border border-white/10 rounded-2xl p-8 text-center shadow-2xl">
        <div className="w-16 h-16 mx-auto bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6">
          <XCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Scan Failed</h1>
        <p className="text-red-400 text-sm mb-4">
          {scan.errorMessage || "An unexpected error occurred during the scan."}
        </p>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          Common reasons: private account, account not found, or a temporary API issue with the platform.
        </p>
        
        <div className="flex flex-col gap-3">
          <Link 
            href={`/scan?handle=${scan.handle}`}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Try Again <ArrowRight className="w-4 h-4" />
          </Link>
          <Link 
            href="/dashboard"
            className="w-full py-2.5 text-gray-400 font-medium rounded-lg border border-white/10 hover:text-white hover:bg-white/5 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
