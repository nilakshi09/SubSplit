'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ScanForm } from '@/components/scan/scan-form';
import { ScanProgress } from '@/components/scan/scan-progress';

function ScanPageContent() {
  const searchParams = useSearchParams();
  const resumeId = searchParams.get('resumeId');

  // activeScanId: null = show form, string = show progress
  const [activeScanId, setActiveScanId] = useState<string | null>(
    resumeId ?? null
  );

  if (activeScanId) {
    return (
      <ScanProgress
        scanId={activeScanId}
        onCancel={() => setActiveScanId(null)}
      />
    );
  }

  return (
    <ScanForm
      onScanCreated={(scanId) => setActiveScanId(scanId)}
    />
  );
}

export default function ScanPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading...</div>}>
      <ScanPageContent />
    </Suspense>
  );
}
