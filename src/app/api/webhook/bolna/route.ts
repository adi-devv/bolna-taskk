import { NextRequest, NextResponse } from 'next/server';
import { CallDB, AppointmentDB } from '@/lib/db';

type BolnaWebhookPayload = {
  execution_id?: string;
  call_id?: string;
  status?: string;
  transcript?: string | Array<{ role: string; content: string }>;
  summary?: string;
  duration?: number;
  data?: {
    confirmation_status?: string;
    reschedule_preference?: string;
    notes?: string;
    [key: string]: unknown;
  };
  extracted_data?: {
    confirmation_status?: string;
    reschedule_preference?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

function mapBolnaStatusToAppointmentStatus(
  bolnaStatus: string,
  confirmationStatus: string
): 'pending' | 'confirmed' | 'rescheduled' | 'cancelled' | 'no_answer' | 'call_failed' {
  const cs = confirmationStatus?.toLowerCase();
  if (cs === 'confirmed') return 'confirmed';
  if (cs === 'cancelled' || cs === 'cancel') return 'cancelled';
  if (cs === 'rescheduled' || cs === 'reschedule' || cs === 'reschedule_requested') return 'rescheduled';
  if (cs === 'no_answer' || cs === 'voicemail') return 'no_answer';

  const bs = bolnaStatus?.toLowerCase();
  if (bs === 'completed') return 'confirmed';
  if (bs === 'no_answer' || bs === 'busy' || bs === 'failed') return 'no_answer';

  return 'pending';
}

function extractTranscript(transcript: BolnaWebhookPayload['transcript']): string {
  if (!transcript) return '';
  if (typeof transcript === 'string') return transcript;
  if (Array.isArray(transcript)) {
    return transcript.map(t => `${t.role}: ${t.content}`).join('\n');
  }
  return JSON.stringify(transcript);
}

export async function POST(req: NextRequest) {
  try {
    const payload: BolnaWebhookPayload = await req.json();
    console.log('[Bolna Webhook]', JSON.stringify(payload, null, 2));

    const executionId = payload.execution_id || '';
    const callId = payload.call_id || '';
    const transcript = extractTranscript(payload.transcript);
    const summary = payload.summary || '';
    const duration = payload.duration || 0;
    const bolnaStatus = payload.status || '';

    const extractedData = payload.data || payload.extracted_data || {};
    const confirmationStatus = extractedData.confirmation_status as string || '';
    const reschedulePreference = extractedData.reschedule_preference as string || '';

    const callUpdate = {
      status: bolnaStatus || 'completed',
      transcript,
      summary,
      duration,
      confirmation_status: confirmationStatus,
      reschedule_preference: reschedulePreference,
    };

    let callRecord;
    if (executionId) {
      CallDB.updateByExecutionId(executionId, callUpdate);
      const calls = CallDB.getAll();
      callRecord = calls.find(c => c.bolna_execution_id === executionId);
    } else if (callId) {
      CallDB.updateByCallId(callId, callUpdate);
      const calls = CallDB.getAll();
      callRecord = calls.find(c => c.bolna_call_id === callId);
    }

    if (callRecord?.appointment_id) {
      const appointmentStatus = mapBolnaStatusToAppointmentStatus(bolnaStatus, confirmationStatus);
      AppointmentDB.updateStatus(callRecord.appointment_id, appointmentStatus);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Bolna Webhook] Error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Bolna webhook endpoint active' });
}
