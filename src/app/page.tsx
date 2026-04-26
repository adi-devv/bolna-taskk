'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import type { Appointment } from '@/lib/db';
import { getCache, setCache } from '@/lib/cache';

type Stats = {
  total: number;
  confirmed: number;
  pending: number;
  totalCalls: number;
  confirmationRate: number;
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(() => getCache<Stats>('stats'));
  const [appointments, setAppointments] = useState<Appointment[]>(() => getCache<Appointment[]>('appointments')?.slice(0, 5) ?? []);

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(d => { setCache('stats', d); setStats(d); });
    fetch('/api/appointments').then(r => r.json()).then((d: Appointment[]) => { setCache('appointments', d); setAppointments(d.slice(0, 5)); });
  }, []);

  return (
    <div style={{ padding: '32px 36px', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '15px', fontWeight: 600, color: '#0f0f0f', margin: 0 }}>Overview</h1>
          <p style={{ fontSize: '12px', color: '#9a9a9a', marginTop: '2px', margin: 0 }}>Appointment confirmation dashboard</p>
        </div>
        <Link href="/appointments/new" style={{
          fontSize: '12px', fontWeight: 500, padding: '7px 14px',
          background: '#0f0f0f', color: '#fff', borderRadius: '6px', textDecoration: 'none',
        }}>
          New Appointment
        </Link>
      </div>

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '28px' }}>
          {[
            { label: 'Total', value: stats.total },
            { label: 'Confirmed', value: stats.confirmed },
            { label: 'Pending', value: stats.pending },
            { label: 'Confirm Rate', value: `${stats.confirmationRate}%` },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', border: '1px solid #e8e8e6', borderRadius: '8px', padding: '18px 20px' }}>
              <div style={{ fontSize: '24px', fontWeight: 600, color: '#0f0f0f' }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: '#9a9a9a', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: '#fff', border: '1px solid #e8e8e6', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #f0f0ee' }}>
          <span style={{ fontSize: '13px', fontWeight: 500, color: '#0f0f0f' }}>Recent Appointments</span>
          <Link href="/appointments" style={{ fontSize: '12px', color: '#9a9a9a', textDecoration: 'none' }}>View all</Link>
        </div>

        {appointments.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ color: '#9a9a9a', fontSize: '13px' }}>No appointments yet.</p>
            <Link href="/appointments/new" style={{ fontSize: '12px', color: '#0f0f0f', marginTop: '8px', display: 'inline-block' }}>
              Add your first appointment →
            </Link>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f0f0ee' }}>
                {['Patient', 'Doctor', 'Date & Time', 'Status'].map(h => (
                  <th key={h} style={{ padding: '9px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 500, color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {appointments.map((a, i) => (
                <tr key={a.id} style={{ borderTop: i > 0 ? '1px solid #f5f5f3' : undefined }}>
                  <td style={{ padding: '12px 20px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: '#0f0f0f' }}>{a.patient_name}</div>
                    <div style={{ fontSize: '11px', color: '#a3a3a3', marginTop: '2px' }}>{a.patient_phone}</div>
                  </td>
                  <td style={{ padding: '12px 20px', fontSize: '13px', color: '#4b4b4b' }}>{a.doctor_name}</td>
                  <td style={{ padding: '12px 20px', fontSize: '13px', color: '#4b4b4b' }}>
                    {a.appointment_date} <span style={{ color: '#a3a3a3' }}>{a.appointment_time}</span>
                  </td>
                  <td style={{ padding: '12px 20px' }}><StatusBadge status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
