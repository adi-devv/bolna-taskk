'use client';

import { useEffect, useState } from 'react';
import StatusBadge from '@/components/StatusBadge';
import { getCache, setCache } from '@/lib/cache';

type CallRecord = {
  id: number;
  bolna_call_id: string;
  status: string;
  transcript: string;
  summary: string;
  duration: number;
  confirmation_status: string;
  reschedule_preference: string;
  patient_name: string;
  doctor_name: string;
  appointment_date: string;
  appointment_time: string;
};

export default function CallLogsPage() {
  const [calls, setCalls] = useState<CallRecord[]>(() => getCache<CallRecord[]>('calls') ?? []);
  const [loading, setLoading] = useState(() => !getCache('calls'));
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/calls').then(r => r.json()).then((d: CallRecord[]) => { setCache('calls', d); setCalls(d); setLoading(false); });
  }, []);

  return (
    <div style={{ padding: '32px 36px', height: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '15px', fontWeight: 600, color: '#0f0f0f', margin: 0 }}>Call Logs</h1>
        <p style={{ fontSize: '12px', color: '#9a9a9a', marginTop: '3px', marginBottom: 0 }}>AI voice call records and transcripts</p>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e8e8e6', borderRadius: '8px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#a3a3a3', fontSize: '13px' }}>Loading…</div>
        ) : calls.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <p style={{ color: '#a3a3a3', fontSize: '13px', margin: 0 }}>No calls yet.</p>
            <p style={{ color: '#c4c4c4', fontSize: '12px', marginTop: '4px' }}>Trigger a call from the Appointments page.</p>
          </div>
        ) : (
          calls.map((call, i) => (
            <div key={call.id} style={{ borderTop: i > 0 ? '1px solid #f5f5f3' : undefined }}>
              <div
                onClick={() => setExpanded(e => e === call.id ? null : call.id)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', cursor: 'pointer' }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#0f0f0f' }}>{call.patient_name}</div>
                  <div style={{ fontSize: '11px', color: '#a3a3a3', marginTop: '2px' }}>
                    {call.doctor_name} · {call.appointment_date} at {call.appointment_time}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {call.duration > 0 && <span style={{ fontSize: '11px', color: '#a3a3a3' }}>{call.duration}s</span>}
                  <StatusBadge status={call.confirmation_status || call.status} />
                  <span style={{ fontSize: '10px', color: '#c4c4c4', width: '10px', textAlign: 'center' }}>{expanded === call.id ? '▲' : '▼'}</span>
                </div>
              </div>

              {expanded === call.id && (
                <div style={{ borderTop: '1px solid #f5f5f3', background: '#fafaf9', padding: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '16px' }}>
                    {[
                      { label: 'Call ID', value: call.bolna_call_id || '—', mono: true },
                      { label: 'Confirmation', value: call.confirmation_status || '—' },
                      { label: 'Reschedule Request', value: call.reschedule_preference || '—' },
                    ].map(item => (
                      <div key={item.label}>
                        <div style={{ fontSize: '10px', fontWeight: 500, color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{item.label}</div>
                        <div style={{ fontSize: '12px', color: '#4b4b4b', fontFamily: item.mono ? 'monospace' : undefined, wordBreak: 'break-all' }}>{item.value}</div>
                      </div>
                    ))}
                  </div>

                  {call.summary && (
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '10px', fontWeight: 500, color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Summary</div>
                      <div style={{ fontSize: '13px', color: '#0f0f0f', background: '#fff', border: '1px solid #e8e8e6', borderRadius: '6px', padding: '12px 14px', lineHeight: 1.6 }}>{call.summary}</div>
                    </div>
                  )}

                  {call.transcript && (
                    <div>
                      <div style={{ fontSize: '10px', fontWeight: 500, color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Transcript</div>
                      <pre style={{ fontSize: '12px', color: '#4b4b4b', background: '#fff', border: '1px solid #e8e8e6', borderRadius: '6px', padding: '12px 14px', whiteSpace: 'pre-wrap', maxHeight: '220px', overflowY: 'auto', fontFamily: 'inherit', lineHeight: 1.6, margin: 0 }}>
                        {call.transcript}
                      </pre>
                    </div>
                  )}

                  {!call.summary && !call.transcript && (
                    <p style={{ fontSize: '12px', color: '#c4c4c4', fontStyle: 'italic', margin: 0 }}>Transcript will appear here once the call completes.</p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
