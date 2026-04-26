'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import type { Appointment } from '@/lib/db';

type FilterStatus = 'all' | Appointment['status'];

const card = { background: '#fff', border: '1px solid #e8e8e5', borderRadius: '10px' };

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [loading, setLoading] = useState(true);
  const [callingId, setCallingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const load = () => {
    fetch('/api/appointments')
      .then(r => r.json())
      .then((data: Appointment[]) => { setAppointments(data); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const triggerCall = async (id: number) => {
    setCallingId(id);
    setMessage(null);
    try {
      const res = await fetch('/api/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointment_id: id }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Call triggered successfully.' });
        load();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to trigger call.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setCallingId(null);
    }
  };

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

  const filters: { value: FilterStatus; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'rescheduled', label: 'Rescheduled' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'no_answer', label: 'No Answer' },
  ];

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-base font-semibold" style={{ color: '#1a1a1a' }}>Appointments</h1>
        <Link
          href="/appointments/new"
          className="text-sm font-medium px-3 py-1.5 rounded-md transition-colors"
          style={{ background: '#1a1a1a', color: '#fff' }}
        >
          New Appointment
        </Link>
      </div>

      {message && (
        <div
          className="mb-4 px-4 py-2.5 rounded-md text-sm"
          style={message.type === 'success'
            ? { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }
            : { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}
        >
          {message.text}
        </div>
      )}

      <div className="flex gap-1.5 mb-4">
        {filters.map(f => {
          const count = f.value === 'all' ? appointments.length : appointments.filter(a => a.status === f.value).length;
          const isActive = filter === f.value;
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className="px-3 py-1 rounded-md text-xs font-medium transition-colors"
              style={isActive
                ? { background: '#1a1a1a', color: '#fff' }
                : { background: '#fff', color: '#7a7a72', border: '1px solid #e8e8e5' }}
            >
              {f.label} <span style={{ opacity: 0.6 }}>{count}</span>
            </button>
          );
        })}
      </div>

      <div style={card} className="overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-sm" style={{ color: '#9e9e96' }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm" style={{ color: '#9e9e96' }}>No appointments found.</p>
            {filter === 'all' && (
              <Link href="/appointments/new" className="mt-2 inline-block text-sm underline underline-offset-2" style={{ color: '#1a1a1a' }}>
                Add your first appointment
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #f0efec' }}>
                {['Patient', 'Doctor', 'Date & Time', 'Department', 'Status', ''].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-medium" style={{ color: '#9e9e96' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => (
                <tr key={a.id} style={{ borderTop: i > 0 ? '1px solid #f5f5f3' : undefined }}>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium" style={{ color: '#1a1a1a' }}>{a.patient_name}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9e9e96' }}>{a.patient_phone}</p>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#4a4a45' }}>{a.doctor_name}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#4a4a45' }}>
                    {a.appointment_date} <span style={{ color: '#9e9e96' }}>at {a.appointment_time}</span>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#9e9e96' }}>{a.department || '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                  <td className="px-4 py-3 text-right">
                    {(a.status === 'pending' || a.status === 'no_answer') && (
                      <button
                        onClick={() => triggerCall(a.id)}
                        disabled={callingId === a.id}
                        className="text-xs font-medium px-3 py-1 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: '#1a1a1a', color: '#fff' }}
                      >
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
