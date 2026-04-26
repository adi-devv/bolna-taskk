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

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #e8e8e5',
  borderRadius: '7px',
  fontSize: '13px',
  color: '#1a1a1a',
  background: '#fff',
  outline: 'none',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: '#7a7a72' }}>{label}</label>
      {children}
    </div>
  );
}

export default function NewAppointmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    patient_name: '',
    patient_phone: '',
    doctor_name: '',
    appointment_date: '',
    appointment_time: '',
    department: '',
    notes: '',
  });

  const set = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        router.push('/appointments');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create appointment');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-lg">
      <div className="mb-6">
        <Link href="/appointments" className="text-xs" style={{ color: '#9e9e96' }}>
          ← Appointments
        </Link>
        <h1 className="text-base font-semibold mt-2" style={{ color: '#1a1a1a' }}>New Appointment</h1>
      </div>

      <div className="p-6" style={{ background: '#fff', border: '1px solid #e8e8e5', borderRadius: '10px' }}>
        {error && (
          <div className="mb-5 px-3 py-2.5 rounded-md text-sm" style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Patient Name *">
              <input type="text" required value={form.patient_name} onChange={e => set('patient_name', e.target.value)} placeholder="Rahul Gupta" style={inputStyle} />
            </Field>
            <Field label="Phone * (with country code)">
              <input type="tel" required value={form.patient_phone} onChange={e => set('patient_phone', e.target.value)} placeholder="+91 98765 43210" style={inputStyle} />
            </Field>
          </div>

          <Field label="Doctor *">
            <select required value={form.doctor_name} onChange={e => set('doctor_name', e.target.value)} style={inputStyle}>
              <option value="">Select a doctor</option>
              {doctors.map(d => <option key={d} value={d}>{d}</option>)}
              <option value="other">Other</option>
            </select>
          </Field>

          {form.doctor_name === 'other' && (
            <Field label="Doctor Name">
              <input type="text" onChange={e => set('doctor_name', e.target.value)} placeholder="Dr. Name - Specialization" style={inputStyle} />
            </Field>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Field label="Date *">
              <input type="date" required value={form.appointment_date} onChange={e => set('appointment_date', e.target.value)} min={new Date().toISOString().split('T')[0]} style={inputStyle} />
            </Field>
            <Field label="Time *">
              <input type="time" required value={form.appointment_time} onChange={e => set('appointment_time', e.target.value)} style={inputStyle} />
            </Field>
          </div>

          <Field label="Department">
            <input type="text" value={form.department} onChange={e => set('department', e.target.value)} placeholder="e.g. Cardiology" style={inputStyle} />
          </Field>

          <Field label="Notes">
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any special instructions..." rows={3} style={{ ...inputStyle, resize: 'none' }} />
          </Field>

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: '#1a1a1a', color: '#fff' }}
            >
              {loading ? 'Creating…' : 'Create Appointment'}
            </button>
            <Link
              href="/appointments"
              className="px-5 py-2 rounded-md text-sm font-medium"
              style={{ border: '1px solid #e8e8e5', color: '#4a4a45', background: '#fff' }}
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
