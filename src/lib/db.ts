import Database from 'better-sqlite3';
import path from 'path';
import { mkdirSync } from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'medicall.db');

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    mkdirSync(path.dirname(DB_PATH), { recursive: true });
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initSchema(db);
  }
  return db;
}

function initSchema(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_name TEXT NOT NULL,
      patient_phone TEXT NOT NULL,
      doctor_name TEXT NOT NULL,
      appointment_date TEXT NOT NULL,
      appointment_time TEXT NOT NULL,
      department TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS calls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      appointment_id INTEGER NOT NULL,
      bolna_call_id TEXT,
      bolna_execution_id TEXT,
      status TEXT DEFAULT 'initiated',
      transcript TEXT DEFAULT '',
      summary TEXT DEFAULT '',
      duration INTEGER DEFAULT 0,
      confirmation_status TEXT DEFAULT '',
      reschedule_preference TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (appointment_id) REFERENCES appointments(id)
    );
  `);
  seedDemoData(database);
}

function seedDemoData(database: Database.Database) {
  const count = (database.prepare('SELECT COUNT(*) as c FROM appointments').get() as { c: number }).c;
  if (count > 0) return;

  const appointments = [
    { patient_name: 'Sarah Johnson', patient_phone: '+1-555-0101', doctor_name: 'Dr. Emily Chen', appointment_date: '2026-05-02', appointment_time: '09:00 AM', department: 'Cardiology', notes: 'Annual checkup', status: 'confirmed' },
    { patient_name: 'Michael Brown', patient_phone: '+1-555-0102', doctor_name: 'Dr. James Wilson', appointment_date: '2026-05-03', appointment_time: '10:30 AM', department: 'Orthopedics', notes: 'Follow-up after surgery', status: 'pending' },
    { patient_name: 'Emma Davis', patient_phone: '+1-555-0103', doctor_name: 'Dr. Sarah Miller', appointment_date: '2026-05-05', appointment_time: '02:00 PM', department: 'Neurology', notes: 'Migraine consultation', status: 'rescheduled' },
    { patient_name: 'Robert Garcia', patient_phone: '+1-555-0104', doctor_name: 'Dr. Michael Thompson', appointment_date: '2026-05-06', appointment_time: '11:00 AM', department: 'General Practice', notes: '', status: 'cancelled' },
    { patient_name: 'Jennifer Martinez', patient_phone: '+1-555-0105', doctor_name: 'Dr. Rachel Kim', appointment_date: '2026-05-07', appointment_time: '03:30 PM', department: 'Dermatology', notes: 'Skin rash evaluation', status: 'no_answer' },
    { patient_name: 'William Taylor', patient_phone: '+1-555-0106', doctor_name: 'Dr. David Lee', appointment_date: '2026-05-08', appointment_time: '08:30 AM', department: 'Ophthalmology', notes: '', status: 'pending' },
    { patient_name: 'Olivia Anderson', patient_phone: '+1-555-0107', doctor_name: 'Dr. Lisa Park', appointment_date: '2026-05-09', appointment_time: '01:00 PM', department: 'Pediatrics', notes: 'Routine vaccination', status: 'confirmed' },
  ];

  const insertAppt = database.prepare(`
    INSERT INTO appointments (patient_name, patient_phone, doctor_name, appointment_date, appointment_time, department, notes, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const ids: number[] = [];
  for (const a of appointments) {
    const r = insertAppt.run(a.patient_name, a.patient_phone, a.doctor_name, a.appointment_date, a.appointment_time, a.department, a.notes, a.status);
    ids.push(r.lastInsertRowid as number);
  }

  const insertCall = database.prepare(`
    INSERT INTO calls (appointment_id, bolna_call_id, bolna_execution_id, status, transcript, summary, duration, confirmation_status, reschedule_preference)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const calls = [
    {
      appt_idx: 0,
      bolna_call_id: 'call_demo_001',
      bolna_execution_id: 'exec_demo_001',
      status: 'completed',
      transcript: 'Agent: Hello, may I please speak with Sarah Johnson?\nPatient: Speaking.\nAgent: Hi Sarah! This is an automated reminder from MediCall Clinic. You have an appointment with Dr. Emily Chen on May 2nd at 9:00 AM for Cardiology. Will you be able to attend?\nPatient: Yes, I will be there.\nAgent: Wonderful! We look forward to seeing you. Please arrive 10 minutes early and bring any previous medical reports.',
      summary: 'Patient Sarah Johnson confirmed her appointment with Dr. Emily Chen on May 2nd at 9:00 AM.',
      duration: 42,
      confirmation_status: 'confirmed',
      reschedule_preference: '',
    },
    {
      appt_idx: 2,
      bolna_call_id: 'call_demo_002',
      bolna_execution_id: 'exec_demo_002',
      status: 'completed',
      transcript: 'Agent: Hello, may I please speak with Emma Davis?\nPatient: This is Emma.\nAgent: Hi Emma! This is an automated reminder from MediCall Clinic. You have an appointment with Dr. Sarah Miller on May 5th at 2:00 PM. Will you be able to attend?\nPatient: Actually, I need to reschedule. Could we do May 12th in the afternoon?\nAgent: Of course! I will note your preference for May 12th in the afternoon. We will contact you to confirm the new time.',
      summary: 'Patient Emma Davis requested to reschedule her appointment to May 12th in the afternoon.',
      duration: 67,
      confirmation_status: 'rescheduled',
      reschedule_preference: 'May 12th, afternoon',
    },
    {
      appt_idx: 3,
      bolna_call_id: 'call_demo_003',
      bolna_execution_id: 'exec_demo_003',
      status: 'completed',
      transcript: 'Agent: Hello, may I please speak with Robert Garcia?\nPatient: Yes, this is Robert.\nAgent: Hi Robert! This is an automated reminder from MediCall Clinic. You have an appointment with Dr. Michael Thompson on May 6th at 11:00 AM. Will you be able to attend?\nPatient: I am sorry, I need to cancel. Something came up at work.\nAgent: I understand. I will make a note of your cancellation. Would you like us to call you to reschedule?\nPatient: No, I will call back when I am ready.',
      summary: 'Patient Robert Garcia cancelled his appointment and will call back to reschedule.',
      duration: 55,
      confirmation_status: 'cancelled',
      reschedule_preference: '',
    },
    {
      appt_idx: 4,
      bolna_call_id: 'call_demo_004',
      bolna_execution_id: 'exec_demo_004',
      status: 'completed',
      transcript: '',
      summary: 'Call went to voicemail. Left reminder message for Jennifer Martinez regarding her appointment with Dr. Rachel Kim on May 7th at 3:30 PM.',
      duration: 18,
      confirmation_status: 'no_answer',
      reschedule_preference: '',
    },
  ];

  for (const c of calls) {
    insertCall.run(ids[c.appt_idx], c.bolna_call_id, c.bolna_execution_id, c.status, c.transcript, c.summary, c.duration, c.confirmation_status, c.reschedule_preference);
  }
}

export type Appointment = {
  id: number;
  patient_name: string;
  patient_phone: string;
  doctor_name: string;
  appointment_date: string;
  appointment_time: string;
  department: string;
  notes: string;
  status: 'pending' | 'confirmed' | 'rescheduled' | 'cancelled' | 'no_answer' | 'call_failed';
  created_at: string;
};

export type Call = {
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
  updated_at: string;
};

export const AppointmentDB = {
  getAll(): Appointment[] {
    return getDb().prepare('SELECT * FROM appointments ORDER BY created_at DESC').all() as Appointment[];
  },

  getById(id: number): Appointment | undefined {
    return getDb().prepare('SELECT * FROM appointments WHERE id = ?').get(id) as Appointment | undefined;
  },

  create(data: Omit<Appointment, 'id' | 'status' | 'created_at'>): Appointment {
    const stmt = getDb().prepare(`
      INSERT INTO appointments (patient_name, patient_phone, doctor_name, appointment_date, appointment_time, department, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(data.patient_name, data.patient_phone, data.doctor_name, data.appointment_date, data.appointment_time, data.department, data.notes);
    return getDb().prepare('SELECT * FROM appointments WHERE id = ?').get(result.lastInsertRowid) as Appointment;
  },

  updateStatus(id: number, status: Appointment['status']): void {
    getDb().prepare('UPDATE appointments SET status = ? WHERE id = ?').run(status, id);
  },

  getStats() {
    const db = getDb();
    const total = (db.prepare('SELECT COUNT(*) as count FROM appointments').get() as { count: number }).count;
    const confirmed = (db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status = 'confirmed'").get() as { count: number }).count;
    const pending = (db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status = 'pending'").get() as { count: number }).count;
    const cancelled = (db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status = 'cancelled'").get() as { count: number }).count;
    const rescheduled = (db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status = 'rescheduled'").get() as { count: number }).count;
    const totalCalls = (db.prepare('SELECT COUNT(*) as count FROM calls').get() as { count: number }).count;
    return { total, confirmed, pending, cancelled, rescheduled, totalCalls };
  },
};

export const CallDB = {
  getAll(): (Call & { patient_name: string; doctor_name: string; appointment_date: string; appointment_time: string })[] {
    return getDb().prepare(`
      SELECT c.*, a.patient_name, a.doctor_name, a.appointment_date, a.appointment_time
      FROM calls c
      JOIN appointments a ON c.appointment_id = a.id
      ORDER BY c.created_at DESC
    `).all() as (Call & { patient_name: string; doctor_name: string; appointment_date: string; appointment_time: string })[];
  },

  getByAppointmentId(appointmentId: number): Call[] {
    return getDb().prepare('SELECT * FROM calls WHERE appointment_id = ? ORDER BY created_at DESC').all(appointmentId) as Call[];
  },

  create(data: { appointment_id: number; bolna_call_id?: string; bolna_execution_id?: string }): Call {
    const stmt = getDb().prepare(`
      INSERT INTO calls (appointment_id, bolna_call_id, bolna_execution_id)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(data.appointment_id, data.bolna_call_id || '', data.bolna_execution_id || '');
    return getDb().prepare('SELECT * FROM calls WHERE id = ?').get(result.lastInsertRowid) as Call;
  },

  updateByExecutionId(executionId: string, data: Partial<Call>): void {
    const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
    const values = [...Object.values(data), new Date().toISOString(), executionId];
    getDb().prepare(`UPDATE calls SET ${fields}, updated_at = ? WHERE bolna_execution_id = ?`).run(...values);
  },

  updateByCallId(callId: string, data: Partial<Call>): void {
    const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
    const values = [...Object.values(data), new Date().toISOString(), callId];
    getDb().prepare(`UPDATE calls SET ${fields}, updated_at = ? WHERE bolna_call_id = ?`).run(...values);
  },
};
