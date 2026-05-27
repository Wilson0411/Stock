import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import DashboardClient from '@/components/dashboard-client';
import { isAuthenticated } from '@/lib/auth';
import { getMarketSnapshot } from '@/lib/market';

export const dynamic = 'force-dynamic';
export const preferredRegion = 'hnd1';

export default async function HomePage() {
  if (!isAuthenticated(cookies())) {
    redirect('/login');
  }

  const snapshot = await getMarketSnapshot();

  return <DashboardClient snapshot={snapshot} />;
}
