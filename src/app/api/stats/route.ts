import { NextResponse } from 'next/server';
import { AppointmentDB } from '@/lib/db';

export async function GET() {
  try {
    const stats = AppointmentDB.getStats();
    const confirmationRate = stats.total > 0
      ? Math.round((stats.confirmed / stats.total) * 100)
      : 0;
    return NextResponse.json({ ...stats, confirmationRate });
  } catch (error) {
    console.error('GET /api/stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
