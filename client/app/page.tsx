import DashboardClient from '@/components/dashboard-client';
import { getMarketSnapshot } from '@/lib/market';

export const dynamic = 'force-dynamic';
export const preferredRegion = 'hnd1';

export default async function HomePage() {
  const snapshot = await getMarketSnapshot();

  return <DashboardClient snapshot={snapshot} />;
}
