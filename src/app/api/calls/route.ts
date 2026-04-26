import { NextRequest, NextResponse } from 'next/server';
import { AppointmentDB, CallDB } from '@/lib/db';
import { triggerCall, isBolnaConfigured } from '@/lib/bolna';

export async function GET() {
  try {
    const calls = CallDB.getAll();
    return NextResponse.json(calls);
  } catch (error) {
    console.error('GET /api/calls error:', error);
    return NextResponse.json({ error: 'Failed to fetch calls' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { appointment_id } = await req.json();

    if (!appointment_id) {
      return NextResponse.json({ error: 'appointment_id is required' }, { status: 400 });
    }

    const appointment = AppointmentDB.getById(Number(appointment_id));
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    if (!isBolnaConfigured()) {
      const mockCall = CallDB.create({
        appointment_id: appointment.id,
        bolna_call_id: `mock_call_${Date.now()}`,
        bolna_execution_id: `mock_exec_${Date.now()}`,
      });
      AppointmentDB.updateStatus(appointment.id, 'pending');
      return NextResponse.json({
        ...mockCall,
        message: 'Demo mode: Bolna API not configured. Set BOLNA_API_KEY and BOLNA_AGENT_ID in .env.local',
      });
    }

    const agentId = process.env.BOLNA_AGENT_ID!;

    const callResponse = await triggerCall({
      agentId,
      phoneNumber: appointment.patient_phone,
      userData: {
        patient_name: appointment.patient_name,
        doctor_name: appointment.doctor_name,
        appointment_date: appointment.appointment_date,
        appointment_time: appointment.appointment_time,
        department: appointment.department,
      },
    });

    const callRecord = CallDB.create({
      appointment_id: appointment.id,
      bolna_call_id: (callResponse.call_id as string) || '',
      bolna_execution_id: (callResponse.execution_id as string) || '',
    });

    return NextResponse.json(callRecord, { status: 201 });
  } catch (error) {
    console.error('POST /api/calls error:', error);
    const axiosErr = error as { response?: { data?: { message?: string; detail?: string } } };
    const bolnaMsg = axiosErr?.response?.data?.message || axiosErr?.response?.data?.detail;
    const message = bolnaMsg || (error instanceof Error ? error.message : 'Failed to trigger call');
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
