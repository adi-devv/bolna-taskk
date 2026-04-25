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
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <Link href="/appointments" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
          ← Back to Appointments
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Appointment</h1>
        <p className="text-gray-500 text-sm mt-1">Add a patient appointment to trigger AI confirmation call</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name *</label>
              <input
                type="text"
                required
                value={form.patient_name}
                onChange={e => set('patient_name', e.target.value)}
                placeholder="e.g. Rahul Gupta"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                value={form.patient_phone}
                onChange={e => set('patient_phone', e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Doctor *</label>
            <select
              required
              value={form.doctor_name}
              onChange={e => set('doctor_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">Select a doctor</option>
              {doctors.map(d => <option key={d} value={d}>{d}</option>)}
              <option value="other">Other (type below)</option>
            </select>
          </div>

          {form.doctor_name === 'other' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Name (custom)</label>
              <input
                type="text"
                value={form.doctor_name === 'other' ? '' : form.doctor_name}
                onChange={e => set('doctor_name', e.target.value)}
                placeholder="Dr. Name - Specialization"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Date *</label>
              <input
                type="date"
                required
                value={form.appointment_date}
                onChange={e => set('appointment_date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Time *</label>
              <input
                type="time"
                required
                value={form.appointment_time}
                onChange={e => set('appointment_time', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <input
              type="text"
              value={form.department}
              onChange={e => set('department', e.target.value)}
              placeholder="e.g. Cardiology, OPD Block A"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Any special instructions or notes..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : 'Create Appointment'}
            </button>
            <Link
              href="/appointments"
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>

      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
        <strong>Next step:</strong> After creating the appointment, go to the Appointments list and click <strong>Call Now</strong> to trigger the Bolna voice agent to call the patient automatically.
      </div>
    </div>
  );
}
