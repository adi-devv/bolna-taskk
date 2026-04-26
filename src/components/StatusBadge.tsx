type Status = string;

const config: Record<string, { label: string; color: string; bg: string }> = {
  pending:     { label: 'Pending',     color: '#92400e', bg: '#fef3c7' },
  confirmed:   { label: 'Confirmed',   color: '#065f46', bg: '#d1fae5' },
  rescheduled: { label: 'Rescheduled', color: '#1e40af', bg: '#dbeafe' },
  cancelled:   { label: 'Cancelled',   color: '#6b7280', bg: '#f3f4f6' },
  no_answer:   { label: 'No Answer',   color: '#6b7280', bg: '#f3f4f6' },
  call_failed: { label: 'Failed',      color: '#991b1b', bg: '#fee2e2' },
  initiated:   { label: 'Calling…',   color: '#5b21b6', bg: '#ede9fe' },
  completed:   { label: 'Completed',   color: '#065f46', bg: '#d1fae5' },
  failed:      { label: 'Failed',      color: '#991b1b', bg: '#fee2e2' },
};

export default function StatusBadge({ status }: { status: Status }) {
  const c = config[status] || { label: status, color: '#6b7280', bg: '#f3f4f6' };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
      style={{ color: c.color, background: c.bg }}
    >
      {c.label}
    </span>
  );
}
