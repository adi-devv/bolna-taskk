'use client';

import { useEffect, useState } from 'react';
import StatusBadge from '@/components/StatusBadge';

type CallRecord = {
  id: number;
  appointment_id: number;
  bolna_call_id: string;
  bolna_execution_id: string;
  status: string;
  transcript: string;
  summary: string;
  duration: number;
  confirmation_status: string;
  reschedule_preference: string;
  created_at: string;
  patient_name: string;
  doctor_name: string;
  appointment_date: string;
  appointment_time: string;
};

export default function CallLogsPage() {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/calls')
      .then(r => r.json())
      .then((data: CallRecord[]) => { setCalls(data); setLoading(false); });
  }, []);

  const toggle = (id: number) => setExpanded(prev => prev === id ? null : id);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Call Logs</h1>
        <p className="text-gray-500 text-sm mt-1">All AI voice call records and transcripts</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading...</div>
        ) : calls.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">📞</div>
            <p className="text-gray-500 text-sm">No calls made yet.</p>
            <p className="text-xs text-gray-400 mt-1">Trigger a call from the Appointments page</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {calls.map((call) => (
              <div key={call.id} className="hover:bg-gray-50 transition-colors">
                <div
                  className="p-4 flex items-center justify-between cursor-pointer"
                  onClick={() => toggle(call.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 text-sm">
                      📞
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{call.patient_name}</p>
                      <p className="text-xs text-gray-500">
                        {call.doctor_name} · {call.appointment_date} at {call.appointment_time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {call.duration > 0 && (
                      <span className="text-xs text-gray-400">{call.duration}s</span>
                    )}
                    <StatusBadge status={call.confirmation_status || call.status} />
                    <span className="text-gray-400 text-xs">{expanded === call.id ? '▲' : '▼'}</span>
                  </div>
                </div>

                {expanded === call.id && (
                  <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                    <div className="pt-4 grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Call ID</p>
                        <p className="text-xs text-gray-700 mt-0.5 font-mono break-all">{call.bolna_call_id || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Confirmation</p>
                        <p className="text-xs text-gray-700 mt-0.5 capitalize">{call.confirmation_status || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Reschedule Request</p>
                        <p className="text-xs text-gray-700 mt-0.5">{call.reschedule_preference || '—'}</p>
                      </div>
                    </div>

                    {call.summary && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Summary</p>
                        <p className="text-sm text-gray-700 bg-white rounded-lg p-3 border border-gray-200">{call.summary}</p>
                      </div>
                    )}

                    {call.transcript && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Transcript</p>
                        <pre className="text-xs text-gray-700 bg-white rounded-lg p-3 border border-gray-200 whitespace-pre-wrap max-h-48 overflow-y-auto font-sans">
                          {call.transcript}
                        </pre>
                      </div>
                    )}

                    {!call.summary && !call.transcript && (
                      <p className="text-xs text-gray-400 italic">No transcript available yet. Webhook data will appear here once the call completes.</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
