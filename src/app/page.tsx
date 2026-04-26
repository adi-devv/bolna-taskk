'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import type { Appointment } from '@/lib/db';

type Stats = {
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
  rescheduled: number;
  totalCalls: number;
  confirmationRate: number;
};

const card = { background: '#fff', border: '1px solid #e8e8e5', borderRadius: '10px' };

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats);
    fetch('/api/appointments').then(r => r.json()).then((data: Appointment[]) => setAppointments(data.slice(0, 5)));
  }, []);

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-base font-semibold" style={{ color: '#1a1a1a' }}>Dashboard</h1>
        <Link
          href="/appointments/new"
          className="text-sm font-medium px-3 py-1.5 rounded-md transition-colors"
          style={{ background: '#1a1a1a', color: '#fff' }}
        >
          New Appointment
        </Link>
      </div>

      {stats && (
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Total', value: stats.total },
            { label: 'Confirmed', value: stats.confirmed },
            { label: 'Pending', value: stats.pending },
            { label: 'Confirm Rate', value: `${stats.confirmationRate}%` },
          ].map((c) => (
            <div key={c.label} className="p-4" style={card}>
              <div className="text-2xl font-semibold" style={{ color: '#1a1a1a' }}>{c.value}</div>
              <div className="text-xs mt-1" style={{ color: '#9e9e96' }}>{c.label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={card} className="overflow-hidden">
        <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: '1px solid #f0efec' }}>
          <span className="text-sm font-medium" style={{ color: '#1a1a1a' }}>Recent Appointments</span>
          <Link href="/appointments" className="text-xs" style={{ color: '#9e9e96' }}>View all</Link>
        </div>
        {appointments.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm" style={{ color: '#9e9e96' }}>No appointments yet.</p>
            <Link href="/appointments/new" className="mt-2 inline-block text-sm underline underline-offset-2" style={{ color: '#1a1a1a' }}>
              Add your first
            </Link>
          </div>
        ) : (
          <div>
            {appointments.map((a, i) => (
              <div
                key={a.id}
                className="px-5 py-3 flex items-center justify-between"
                style={{ borderTop: i > 0 ? '1px solid #f5f5f3' : undefined }}
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: '#1a1a1a' }}>{a.patient_name}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#9e9e96' }}>{a.doctor_name} · {a.appointment_date} at {a.appointment_time}</p>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
