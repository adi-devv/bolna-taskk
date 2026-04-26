'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import type { Appointment } from '@/lib/db';

type FilterStatus = 'all' | Appointment['status'];

const FILTERS: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'rescheduled', label: 'Rescheduled' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no_answer', label: 'No Answer' },
];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [loading, setLoading] = useState(true);
  const [callingId, setCallingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const load = () => fetch('/api/appointments').then(r => r.json()).then((d: Appointment[]) => { setAppointments(d); setLoading(false); });
  useEffect(() => { load(); }, []);

  const triggerCall = async (id: number) => {
    setCallingId(id); setMessage(null);
    try {
      const res = await fetch('/api/calls', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ appointment_id: id }) });
      const data = await res.json();
      setMessage(res.ok ? { type: 'success', text: 'Call triggered successfully.' } : { type: 'error', text: data.error || 'Failed to trigger call.' });
      if (res.ok) load();
    } catch { setMessage({ type: 'error', text: 'Network error. Please try again.' }); }
    finally { setCallingId(null); }
  };

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

  return (
    <div style={{ padding: '32px 36px', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '15px', fontWeight: 600, color: '#0f0f0f', margin: 0 }}>Appointments</h1>
        <Link href="/appointments/new" style={{
          fontSize: '12px', fontWeight: 500, padding: '7px 14px',
          background: '#0f0f0f', color: '#fff', borderRadius: '6px', textDecoration: 'none',
        }}>
          New Appointment
        </Link>
      </div>

      {message && (
        <div style={{
          marginBottom: '16px', padding: '10px 14px', borderRadius: '6px', fontSize: '12px',
          ...(message.type === 'success'
            ? { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }
            : { background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }),
        }}>
          {message.text}
        </div>
      )}

      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
        {FILTERS.map(f => {
          const count = f.value === 'all' ? appointments.length : appointments.filter(a => a.status === f.value).length;
          const active = filter === f.value;
          return (
            <button key={f.value} onClick={() => setFilter(f.value)} style={{
              padding: '5px 11px', borderRadius: '5px', fontSize: '12px', fontWeight: active ? 500 : 400,
              cursor: 'pointer', border: active ? 'none' : '1px solid #e8e8e6',
              background: active ? '#0f0f0f' : '#fff', color: active ? '#fff' : '#6b6b6b',
            }}>
              {f.label} <span style={{ opacity: 0.5 }}>{count}</span>
            </button>
          );
        })}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e8e8e6', borderRadius: '8px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#a3a3a3', fontSize: '13px' }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <p style={{ color: '#a3a3a3', fontSize: '13px', margin: 0 }}>No appointments found.</p>
            {filter === 'all' && (
              <Link href="/appointments/new" style={{ fontSize: '12px', color: '#0f0f0f', marginTop: '10px', display: 'inline-block' }}>
                Add your first appointment →
              </Link>
            )}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f0f0ee' }}>
                {['Patient', 'Doctor', 'Date & Time', 'Department', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 500, color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => (
                <tr key={a.id} style={{ borderTop: i > 0 ? '1px solid #f5f5f3' : undefined }}>
                  <td style={{ padding: '12px 20px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: '#0f0f0f' }}>{a.patient_name}</div>
                    <div style={{ fontSize: '11px', color: '#a3a3a3', marginTop: '2px' }}>{a.patient_phone}</div>
                  </td>
                  <td style={{ padding: '12px 20px', fontSize: '13px', color: '#4b4b4b', whiteSpace: 'nowrap' }}>{a.doctor_name}</td>
                  <td style={{ padding: '12px 20px', fontSize: '13px', color: '#4b4b4b', whiteSpace: 'nowrap' }}>
                    {a.appointment_date} <span style={{ color: '#a3a3a3' }}>{a.appointment_time}</span>
                  </td>
                  <td style={{ padding: '12px 20px', fontSize: '13px', color: '#a3a3a3' }}>{a.department || '—'}</td>
                  <td style={{ padding: '12px 20px' }}><StatusBadge status={a.status} /></td>
                  <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                    {(a.status === 'pending' || a.status === 'no_answer') && (
                      <button onClick={() => triggerCall(a.id)} disabled={callingId === a.id} style={{
                        fontSize: '12px', fontWeight: 500, padding: '5px 12px',
                        background: '#0f0f0f', color: '#fff', borderRadius: '5px',
                        border: 'none', cursor: 'pointer', opacity: callingId === a.id ? 0.4 : 1, whiteSpace: 'nowrap',
                      }}>
                        {callingId === a.id ? 'Calling…' : 'Call Now'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
