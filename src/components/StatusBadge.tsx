type Status = 'pending' | 'confirmed' | 'rescheduled' | 'cancelled' | 'no_answer' | 'call_failed' | 'initiated' | 'completed' | 'failed' | string;

const config: Record<string, { bg: string; text: string; label: string }> = {
  pending:     { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
  confirmed:   { bg: 'bg-green-100',  text: 'text-green-800',  label: 'Confirmed' },
  rescheduled: { bg: 'bg-blue-100',   text: 'text-blue-800',   label: 'Rescheduled' },
  cancelled:   { bg: 'bg-red-100',    text: 'text-red-800',    label: 'Cancelled' },
  no_answer:   { bg: 'bg-gray-100',   text: 'text-gray-700',   label: 'No Answer' },
  call_failed: { bg: 'bg-red-100',    text: 'text-red-700',    label: 'Call Failed' },
  initiated:   { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Calling...' },
  completed:   { bg: 'bg-green-100',  text: 'text-green-800',  label: 'Completed' },
  failed:      { bg: 'bg-red-100',    text: 'text-red-700',    label: 'Failed' },
};

export default function StatusBadge({ status }: { status: Status }) {
  const c = config[status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: status };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}
