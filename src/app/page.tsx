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

const statCards = (s: Stats) => [
  { label: 'Total Appointments', value: s.total, icon: '📅', color: 'border-blue-500', bg: 'bg-blue-50', text: 'text-blue-700' },
  { label: 'Confirmed', value: s.confirmed, icon: '✅', color: 'border-green-500', bg: 'bg-green-50', text: 'text-green-700' },
  { label: 'Pending Confirmation', value: s.pending, icon: '⏳', color: 'border-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-700' },
  { label: 'Confirmation Rate', value: `${s.confirmationRate}%`, icon: '📈', color: 'border-purple-500', bg: 'bg-purple-50', text: 'text-purple-700' },
];

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats);
    fetch('/api/appointments').then(r => r.json()).then((data: Appointment[]) => setAppointments(data.slice(0, 5)));
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">AI-powered appointment confirmation via voice calls</p>
        </div>
        <Link
          href="/appointments/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + New Appointment
        </Link>
      </div>

      {stats && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {statCards(stats).map((card) => (
            <div key={card.label} className={`bg-white rounded-xl border-l-4 ${card.color} p-5 shadow-sm`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{card.icon}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{card.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{card.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="font-semibold text-gray-900 mb-4">How MediCall Works</h2>
        <div className="grid grid-cols-4 gap-4">
          {[
            { step: '1', title: 'Add Appointment', desc: 'Staff logs patient appointment details', icon: '📝' },
            { step: '2', title: 'Trigger AI Call', desc: 'Bolna voice agent calls the patient', icon: '🤖' },
            { step: '3', title: 'Patient Responds', desc: 'Patient confirms, reschedules, or cancels', icon: '💬' },
            { step: '4', title: 'Auto-Update', desc: 'Webhook updates appointment status', icon: '✅' },
          ].map((s) => (
            <div key={s.step} className="text-center">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-2">{s.step}</div>
              <div className="text-xl mb-1">{s.icon}</div>
              <div className="text-sm font-medium text-gray-900">{s.title}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Appointments</h2>
          <Link href="/appointments" className="text-sm text-blue-600 hover:underline">View all</Link>
        </div>
        {appointments.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">📅</div>
            <p className="text-gray-500 text-sm">No appointments yet.</p>
            <Link href="/appointments/new" className="mt-3 inline-block text-blue-600 text-sm hover:underline">
              Add your first appointment
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {appointments.map((a) => (
              <div key={a.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-sm">
                    {a.patient_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{a.patient_name}</p>
                    <p className="text-xs text-gray-500">{a.doctor_name} · {a.appointment_date} at {a.appointment_time}</p>
                  </div>
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
