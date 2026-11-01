// pages/DonorDashboard.jsx – donor sees matching requests, profile editor, eligibility badge
// Experiment 2: useEffect, useContext; Custom hooks: useFetch, useSocket, useDebounce
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useFetch } from '../hooks/useFetch';
import { useSocket } from '../hooks/useSocket';
import { useDebounce } from '../hooks/useDebounce';
import api from '../api';
import RequestCard from '../components/RequestCard';
import Spinner from '../components/Spinner';
import Badge from '../components/Badge';

// A donor is eligible if they've never donated OR last donated >90 days ago
function isEligible(lastDonationDate) {
  if (!lastDonationDate) return true;
  const days = (Date.now() - new Date(lastDonationDate)) / (1000 * 60 * 60 * 24);
  return days >= 90;
}

export default function DonorDashboard() {
  const { user, updateUser } = useAuth();

  // useSocket: connect real-time (Experiment 8)
  useSocket();

  // Filters for request list
  const [filterCity, setFilterCity] = useState('');
  const [filterGroup, setFilterGroup] = useState(user?.bloodGroup || '');

  // useDebounce: don't fetch on every keystroke (Experiment 2 custom hook)
  const debouncedCity = useDebounce(filterCity, 400);

  const queryStr = new URLSearchParams({
    ...(filterGroup && { bloodGroup: filterGroup }),
    ...(debouncedCity && { city: debouncedCity }),
    status: 'open',
  }).toString();

  // useFetch: load open requests (Experiment 2 custom hook)
  const { data, loading, error, refetch } = useFetch(`/requests?${queryStr}`);

  // Profile edit state
  const [editing, setEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    phone: user?.phone || '',
    city: user?.city || '',
    bloodGroup: user?.bloodGroup || '',
    lastDonationDate: user?.lastDonationDate?.split('T')[0] || '',
    isAvailable: user?.isAvailable ?? true,
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // Responded request IDs (track locally to update UI instantly)
  const [responded, setResponded] = useState(new Set());

  // useEffect: set document title
  useEffect(() => { document.title = 'Donor Dashboard – BloodBridge'; }, []);

  const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const eligible = isEligible(user?.lastDonationDate);

  async function handleRespond(requestId) {
    try {
      await api.post(`/requests/${requestId}/respond`);
      setResponded(s => new Set([...s, requestId]));
      toast.success('Response sent! The hospital will contact you.');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not respond');
    }
  }

  async function handleProfileSave() {
    setProfileLoading(true);
    try {
      const res = await api.put('/donors/me', profileForm);
      updateUser(res.data.user);
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setProfileLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

      {/* ── Profile Card ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
                {user?.bloodGroup || 'No blood group set'}
              </span>
              {eligible ? (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                  ✅ Eligible to Donate
                </span>
              ) : (
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold">
                  ⏳ Not Yet Eligible
                </span>
              )}
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${user?.isAvailable ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                {user?.isAvailable ? '🟢 Available' : '🔴 Unavailable'}
              </span>
            </div>
          </div>
          <button
            onClick={() => setEditing(e => !e)}
            className="text-sm text-red-600 border border-red-300 rounded-lg px-4 py-2 hover:bg-red-50 transition"
          >
            {editing ? 'Cancel' : '✏️ Edit Profile'}
          </button>
        </div>

        {/* Inline profile editor */}
        {editing && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4">
            {[
              { label: 'Phone', key: 'phone', type: 'tel' },
              { label: 'City', key: 'city', type: 'text' },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input type={type} value={profileForm[key]}
                  onChange={e => setProfileForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-400 outline-none" />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
              <select value={profileForm.bloodGroup}
                onChange={e => setProfileForm(f => ({ ...f, bloodGroup: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-400 outline-none">
                <option value="">Select…</option>
                {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Donation Date</label>
              <input type="date" value={profileForm.lastDonationDate}
                onChange={e => setProfileForm(f => ({ ...f, lastDonationDate: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-400 outline-none" />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Available to Donate?</label>
              <button
                type="button"
                onClick={() => setProfileForm(f => ({ ...f, isAvailable: !f.isAvailable }))}
                className={`w-12 h-6 rounded-full transition-colors ${profileForm.isAvailable ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <span className={`block w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${profileForm.isAvailable ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
            <div className="sm:col-span-2">
              <button onClick={handleProfileSave} disabled={profileLoading}
                className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-60 transition">
                {profileLoading ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Open Requests ── */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Open Blood Requests</h2>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select value={filterGroup} onChange={e => setFilterGroup(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-400 outline-none">
            <option value="">All blood groups</option>
            {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <input type="text" placeholder="Filter by city…" value={filterCity}
            onChange={e => setFilterCity(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-400 outline-none" />
        </div>

        {loading && <Spinner />}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {!loading && data?.requests?.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">🩸</p>
            <p className="text-lg font-semibold">No open requests found</p>
            <p className="text-sm mt-1">Try changing the filters</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.requests?.map(req => (
            <RequestCard
              key={req._id}
              request={req}
              actions={
                req.status === 'open' && (
                  <button
                    onClick={() => handleRespond(req._id)}
                    disabled={responded.has(req._id)}
                    className="bg-red-600 text-white text-sm px-4 py-2 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {responded.has(req._id) ? '✅ Responded' : '🩸 I Can Donate'}
                  </button>
                )
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
