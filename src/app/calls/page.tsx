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

const card = { background: '#fff', border: '1px solid #e8e8e5', borderRadius: '10px' };

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
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-base font-semibold" style={{ color: '#1a1a1a' }}>Call Logs</h1>
      </div>

      <div style={card} className="overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-sm" style={{ color: '#9e9e96' }}>Loading…</div>
        ) : calls.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm" style={{ color: '#9e9e96' }}>No calls yet.</p>
            <p className="text-xs mt-1" style={{ color: '#c0c0b8' }}>Trigger a call from the Appointments page.</p>
          </div>
        ) : (
          <div>
            {calls.map((call, i) => (
              <div key={call.id} style={{ borderTop: i > 0 ? '1px solid #f5f5f3' : undefined }}>
                <div
                  className="px-5 py-3.5 flex items-center justify-between cursor-pointer"
                  onClick={() => toggle(call.id)}
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#1a1a1a' }}>{call.patient_name}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9e9e96' }}>
                      {call.doctor_name} · {call.appointment_date} at {call.appointment_time}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {call.duration > 0 && (
                      <span className="text-xs" style={{ color: '#9e9e96' }}>{call.duration}s</span>
                    )}
                    <StatusBadge status={call.confirmation_status || call.status} />
                    <span className="text-xs" style={{ color: '#c0c0b8' }}>{expanded === call.id ? '▲' : '▼'}</span>
                  </div>
                </div>

                {expanded === call.id && (
                  <div className="px-5 pb-5" style={{ borderTop: '1px solid #f5f5f3', background: '#fafaf9' }}>
                    <div className="pt-4 grid grid-cols-3 gap-4 mb-4">
                      {[
                        { label: 'Call ID', value: call.bolna_call_id || '—', mono: true },
                        { label: 'Confirmation', value: call.confirmation_status || '—' },
                        { label: 'Reschedule', value: call.reschedule_preference || '—' },
                      ].map(item => (
                        <div key={item.label}>
                          <p className="text-xs font-medium mb-0.5" style={{ color: '#9e9e96' }}>{item.label}</p>
                          <p className={`text-xs ${item.mono ? 'font-mono break-all' : ''}`} style={{ color: '#4a4a45' }}>{item.value}</p>
                        </div>
                      ))}
                    </div>

                    {call.summary && (
                      <div className="mb-4">
                        <p className="text-xs font-medium mb-1" style={{ color: '#9e9e96' }}>Summary</p>
                        <p className="text-sm p-3 rounded-md" style={{ color: '#1a1a1a', background: '#fff', border: '1px solid #e8e8e5' }}>{call.summary}</p>
                      </div>
                    )}

                    {call.transcript && (
                      <div>
                        <p className="text-xs font-medium mb-1" style={{ color: '#9e9e96' }}>Transcript</p>
                        <pre className="text-xs p-3 rounded-md whitespace-pre-wrap max-h-48 overflow-y-auto font-sans" style={{ color: '#4a4a45', background: '#fff', border: '1px solid #e8e8e5' }}>
                          {call.transcript}
                        </pre>
                      </div>
                    )}

                    {!call.summary && !call.transcript && (
                      <p className="text-xs italic" style={{ color: '#c0c0b8' }}>Transcript will appear here once the call completes.</p>
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
