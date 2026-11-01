// components/RequestCard.jsx – card shown in donor & hospital request lists
import Badge from './Badge';

export default function RequestCard({ request, actions }) {
  const { bloodGroup, units, city, urgency, status, hospital, responseCount, note, createdAt } = request;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3 hover:shadow-md transition">
      {/* Header row */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold text-red-600">{bloodGroup}</span>
          <div>
            <p className="font-semibold text-gray-800">{hospital?.name || 'Hospital'}</p>
            <p className="text-sm text-gray-500">{city}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge type="urgency" value={urgency} />
          <Badge type="status" value={status} />
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
        <span>🩸 <strong>{units}</strong> unit{units > 1 ? 's' : ''} needed</span>
        {responseCount !== undefined && (
          <span>👤 <strong>{responseCount}</strong> donor{responseCount !== 1 ? 's' : ''} responded</span>
        )}
        {createdAt && (
          <span>📅 {new Date(createdAt).toLocaleDateString()}</span>
        )}
      </div>

      {note && <p className="text-sm text-gray-500 italic border-l-2 border-red-200 pl-3">{note}</p>}

      {/* Action buttons passed in from parent */}
      {actions && <div className="flex gap-2 flex-wrap mt-1">{actions}</div>}
    </div>
  );
}
