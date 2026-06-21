import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard — Spotbot',
  description: 'View your recent fraud scans and audience analysis results',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
