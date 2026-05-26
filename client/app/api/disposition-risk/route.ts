import { NextResponse } from 'next/server';
import { getMarketSnapshot } from '@/lib/market';

export const dynamic = 'force-dynamic';
export const preferredRegion = 'hnd1';

export async function GET() {
  try {
    const snapshot = await getMarketSnapshot();
    return NextResponse.json(snapshot);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: '無法取得市場資料',
        message
      },
      { status: 500 }
    );
  }
}