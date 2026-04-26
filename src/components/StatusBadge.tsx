type Status = string;

const config: Record<string, { label: string; dot: string }> = {
  pending:     { label: 'Pending',     dot: '#f59e0b' },
  confirmed:   { label: 'Confirmed',   dot: '#22c55e' },
  rescheduled: { label: 'Rescheduled', dot: '#3b82f6' },
  cancelled:   { label: 'Cancelled',   dot: '#d1d5db' },
  no_answer:   { label: 'No Answer',   dot: '#d1d5db' },
  call_failed: { label: 'Failed',      dot: '#ef4444' },
  initiated:   { label: 'Calling',     dot: '#8b5cf6' },
  completed:   { label: 'Completed',   dot: '#22c55e' },
  failed:      { label: 'Failed',      dot: '#ef4444' },
};

export default function StatusBadge({ status }: { status: Status }) {
  const c = config[status] || { label: status, dot: '#d1d5db' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
      <span style={{
        width: '6px', height: '6px',
        borderRadius: '50%',
        background: c.dot,
        flexShrink: 0,
        display: 'inline-block',
      }} />
      <span style={{ fontSize: '12px', color: '#4b4b4b', fontWeight: 400 }}>{c.label}</span>
    </span>
  );
}
