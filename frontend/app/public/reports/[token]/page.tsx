import { notFound } from 'next/navigation'
import type { Scan } from '@/types/scan'
import { PublicReportView } from '@/components/report/public-report-view'

interface Props {
  params: { token: string }
}

export default async function PublicReportPage({ params }: Props) {
  let scan: Scan

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/public/reports/${params.token}`,
      { cache: 'no-store' }
    )

    if (!res.ok) notFound()
    scan = await res.json()
  } catch {
    notFound()
  }

  return <PublicReportView scan={scan} token={params.token} />
}

export async function generateMetadata({ params }: Props) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/public/reports/${params.token}`,
      { cache: 'no-store' }
    )
    if (!res.ok) return { title: 'Report Not Found — Spotbot' }
    const scan = await res.json()
    return {
      title: `@${scan.handle} Fraud Report — Spotbot`,
      description: `Fraud score: ${scan.fraudScore}/100 · ${scan.riskLevel} risk`,
      openGraph: {
        title: `@${scan.handle} — Spotbot Fraud Analysis`,
        description: `Audience fraud score: ${scan.fraudScore}/100`,
      },
    }
  } catch {
    return { title: 'Spotbot Fraud Report' }
  }
}
