'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import type { Appointment } from '@/lib/db';

type Stats = {
  total: number;
  confirmed: number;
  pending: number;
  totalCalls: number;
  confirmationRate: number;
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats);
    fetch('/api/appointments').then(r => r.json()).then((d: Appointment[]) => setAppointments(d.slice(0, 5)));
  }, []);

  return (
    <div style={{ padding: '32px 40px', maxWidth: '860px' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '16px', fontWeight: 600, color: '#0f0f0f', margin: 0 }}>Overview</h1>
          <p style={{ fontSize: '12px', color: '#9a9a9a', marginTop: '2px' }}>Appointment confirmation dashboard</p>
        </div>
        <Link href="/appointments/new" style={{
          fontSize: '12px', fontWeight: 500,
          padding: '7px 14px',
          background: '#0f0f0f', color: '#fff',
          borderRadius: '6px', textDecoration: 'none',
        }}>
          New Appointment
        </Link>
      </div>

      {stats && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px', marginBottom: '28px',
        }}>
          {[
            { label: 'Total', value: stats.total },
            { label: 'Confirmed', value: stats.confirmed },
            { label: 'Pending', value: stats.pending },
            { label: 'Confirm Rate', value: `${stats.confirmationRate}%` },
          ].map(s => (
            <div key={s.label} style={{
              background: '#fff',
              border: '1px solid #e8e8e6',
              borderRadius: '8px',
              padding: '16px',
            }}>
              <div style={{ fontSize: '22px', fontWeight: 600, color: '#0f0f0f' }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: '#9a9a9a', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: '#fff', border: '1px solid #e8e8e6', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: '1px solid #f0f0ee',
        }}>
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
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 160px 90px',
              padding: '8px 20px',
              borderBottom: '1px solid #f5f5f3',
            }}>
              {['Patient', 'Doctor', 'Date & Time', 'Status'].map(h => (
                <span key={h} style={{ fontSize: '11px', fontWeight: 500, color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
              ))}
            </div>
            {appointments.map((a, i) => (
              <div key={a.id} style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 160px 90px',
                padding: '11px 20px',
                borderTop: i > 0 ? '1px solid #f5f5f3' : undefined,
                alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#0f0f0f' }}>{a.patient_name}</div>
                  <div style={{ fontSize: '11px', color: '#a3a3a3', marginTop: '1px' }}>{a.patient_phone}</div>
                </div>
                <div style={{ fontSize: '12px', color: '#4b4b4b' }}>{a.doctor_name}</div>
                <div style={{ fontSize: '12px', color: '#4b4b4b' }}>{a.appointment_date} <span style={{ color: '#a3a3a3' }}>{a.appointment_time}</span></div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
