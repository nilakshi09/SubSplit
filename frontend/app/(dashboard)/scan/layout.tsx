import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'New Scan — Spotbot',
  description: 'Analyze an influencer\'s audience for fraud signals',
};

export default function ScanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
