import { NextRequest, NextResponse } from 'next/server';
import { AppointmentDB } from '@/lib/db';

export async function GET() {
  try {
    const appointments = AppointmentDB.getAll();
    return NextResponse.json(appointments);
  } catch (error) {
    console.error('GET /api/appointments error:', error);
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patient_name, patient_phone, doctor_name, appointment_date, appointment_time, department, notes } = body;

    if (!patient_name || !patient_phone || !doctor_name || !appointment_date || !appointment_time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const appointment = AppointmentDB.create({
      patient_name,
      patient_phone,
      doctor_name,
      appointment_date,
      appointment_time,
      department: department || '',
      notes: notes || '',
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error('POST /api/appointments error:', error);
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}
