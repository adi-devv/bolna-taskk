'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const doctors = [
  'Dr. Priya Sharma - Cardiology',
  'Dr. Rajesh Kumar - Orthopedics',
  'Dr. Anita Verma - Gynecology',
  'Dr. Suresh Patel - General Medicine',
  'Dr. Meera Nair - Pediatrics',
  'Dr. Vikram Singh - Neurology',
];

const inp: React.CSSProperties = {
  width: '100%', padding: '8px 10px',
  border: '1px solid #e8e8e6', borderRadius: '6px',
  fontSize: '13px', color: '#0f0f0f', background: '#fff', outline: 'none',
};

function Label({ text }: { text: string }) {
  return <div style={{ fontSize: '11px', fontWeight: 500, color: '#6b6b6b', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{text}</div>;
}

export default function NewAppointmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ patient_name: '', patient_phone: '', doctor_name: '', appointment_date: '', appointment_time: '', department: '', notes: '' });

  const set = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/appointments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (res.ok) router.push('/appointments');
      else { const d = await res.json(); setError(d.error || 'Failed to create appointment'); }
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ padding: '32px 36px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link href="/appointments" style={{ fontSize: '12px', color: '#9a9a9a', textDecoration: 'none' }}>← Appointments</Link>
        <h1 style={{ fontSize: '15px', fontWeight: 600, color: '#0f0f0f', margin: '8px 0 0' }}>New Appointment</h1>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e8e8e6', borderRadius: '8px', padding: '28px', maxWidth: '600px' }}>
        {error && (
          <div style={{ marginBottom: '18px', padding: '10px 12px', borderRadius: '6px', fontSize: '12px', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <Label text="Patient Name *" />
              <input style={inp} type="text" required value={form.patient_name} onChange={e => set('patient_name', e.target.value)} placeholder="Rahul Gupta" />
            </div>
            <div>
              <Label text="Phone * (with country code)" />
              <input style={inp} type="tel" required value={form.patient_phone} onChange={e => set('patient_phone', e.target.value)} placeholder="+91 98765 43210" />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <Label text="Doctor *" />
            <select style={inp} required value={form.doctor_name} onChange={e => set('doctor_name', e.target.value)}>
              <option value="">Select a doctor</option>
              {doctors.map(d => <option key={d} value={d}>{d}</option>)}
              <option value="other">Other</option>
            </select>
          </div>

          {form.doctor_name === 'other' && (
            <div style={{ marginBottom: '16px' }}>
              <Label text="Doctor Name" />
              <input style={inp} type="text" onChange={e => set('doctor_name', e.target.value)} placeholder="Dr. Name - Specialization" />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <Label text="Date *" />
              <input style={inp} type="date" required value={form.appointment_date} onChange={e => set('appointment_date', e.target.value)} min={new Date().toISOString().split('T')[0]} />
            </div>
            <div>
              <Label text="Time *" />
              <input style={inp} type="time" required value={form.appointment_time} onChange={e => set('appointment_time', e.target.value)} />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <Label text="Department" />
            <input style={inp} type="text" value={form.department} onChange={e => set('department', e.target.value)} placeholder="e.g. Cardiology" />
          </div>

          <div style={{ marginBottom: '22px' }}>
            <Label text="Notes" />
            <textarea style={{ ...inp, resize: 'none' }} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any special instructions..." rows={3} />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={loading} style={{
              flex: 1, padding: '9px', borderRadius: '6px', fontSize: '13px', fontWeight: 500,
              background: '#0f0f0f', color: '#fff', border: 'none', cursor: 'pointer', opacity: loading ? 0.5 : 1,
            }}>
              {loading ? 'Creating…' : 'Create Appointment'}
            </button>
            <Link href="/appointments" style={{
              padding: '9px 20px', borderRadius: '6px', fontSize: '13px',
              border: '1px solid #e8e8e6', color: '#4b4b4b', textDecoration: 'none',
              background: '#fff', display: 'flex', alignItems: 'center',
            }}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
