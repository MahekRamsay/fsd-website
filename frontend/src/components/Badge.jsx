// components/Badge.jsx – coloured pill for status and urgency
const STATUS_COLORS = {
  open: 'bg-green-100 text-green-800',
  fulfilled: 'bg-blue-100 text-blue-800',
  closed: 'bg-gray-100 text-gray-700',
};

const URGENCY_COLORS = {
  normal: 'bg-yellow-100 text-yellow-800',
  urgent: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800 font-semibold animate-pulse',
};

export default function Badge({ type, value }) {
  const colors =
    type === 'status'
      ? STATUS_COLORS[value] || 'bg-gray-100 text-gray-700'
      : URGENCY_COLORS[value] || 'bg-gray-100 text-gray-700';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs capitalize ${colors}`}>
      {value}
    </span>
  );
}
