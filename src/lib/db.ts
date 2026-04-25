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
