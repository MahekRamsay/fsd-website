// pages/HospitalDashboard.jsx – create requests, see responses, search donors
// Experiment 2: useEffect, useContext, useFetch, useSocket, useDebounce
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useFetch } from '../hooks/useFetch';
import { useSocket } from '../hooks/useSocket';
import { useDebounce } from '../hooks/useDebounce';
import api from '../api';
import RequestCard from '../components/RequestCard';
import Badge from '../components/Badge';
import Spinner from '../components/Spinner';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const TABS = ['My Requests', 'Create Request', 'Search Donors'];

export default function HospitalDashboard() {
  const { user } = useAuth();
  useSocket(); // Experiment 8 – real-time donor response toasts

  const [tab, setTab] = useState('My Requests');

  // useEffect: document title
  useEffect(() => { document.title = 'Hospital Dashboard – BloodBridge'; }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">🏥 {user?.name}</h1>
        <p className="text-gray-500 text-sm">{user?.city} · {user?.email}</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 border-b border-gray-200">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition -mb-px ${
              tab === t ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'My Requests' && <MyRequests />}
      {tab === 'Create Request' && <CreateRequest onCreated={() => setTab('My Requests')} />}
      {tab === 'Search Donors' && <SearchDonors />}
    </div>
  );
}

/* ── My Requests ─────────────────────────────────────────────────────────── */
function MyRequests() {
  const { data, loading, error, refetch } = useFetch('/requests?mine=true');
  const [expandedId, setExpandedId] = useState(null);
  const [responses, setResponses] = useState({});

  async function loadResponses(id) {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    if (responses[id]) return; // already loaded
    try {
      const res = await api.get(`/requests/${id}/responses`);
      setResponses(r => ({ ...r, [id]: res.data.responses }));
    } catch {
      toast.error('Could not load responses');
    }
  }

  async function updateStatus(id, status) {
    try {
      await api.patch(`/requests/${id}/status`, { status });
      toast.success(`Request marked as ${status}`);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  }

  async function deleteReq(id) {
    if (!confirm('Delete this request?')) return;
    try {
      await api.delete(`/requests/${id}`);
      toast.success('Request deleted');
      refetch();
    } catch {
      toast.error('Delete failed');
    }
  }

  if (loading) return <Spinner />;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!data?.requests?.length) return (
    <div className="text-center py-16 text-gray-400">
      <p className="text-5xl mb-3">📋</p>
      <p className="text-lg font-semibold">No requests yet</p>
      <p className="text-sm mt-1">Click "Create Request" to post one</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {data.requests.map(req => (
        <div key={req._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <RequestCard
            request={req}
            actions={
              <>
                <button onClick={() => loadResponses(req._id)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition">
                  {expandedId === req._id ? '▲ Hide Donors' : `👥 ${req.responseCount} Donor${req.responseCount !== 1 ? 's' : ''}`}
                </button>
                {req.status === 'open' && (
                  <>
                    <button onClick={() => updateStatus(req._id, 'fulfilled')}
                      className="text-sm bg-blue-600 text-white rounded-lg px-3 py-1.5 hover:bg-blue-700 transition">
                      ✅ Mark Fulfilled
                    </button>
                    <button onClick={() => updateStatus(req._id, 'closed')}
                      className="text-sm bg-gray-500 text-white rounded-lg px-3 py-1.5 hover:bg-gray-600 transition">
                      🔒 Close
                    </button>
                  </>
                )}
                <button onClick={() => deleteReq(req._id)}
                  className="text-sm text-red-600 border border-red-300 rounded-lg px-3 py-1.5 hover:bg-red-50 transition">
                  🗑 Delete
                </button>
              </>
            }
          />

          {/* Responses panel */}
          {expandedId === req._id && (
            <div className="mt-4 border-t pt-4">
              <h4 className="font-semibold text-gray-700 mb-3">Donors who responded:</h4>
              {!responses[req._id] ? (
                <Spinner size="sm" />
              ) : responses[req._id].length === 0 ? (
                <p className="text-gray-400 text-sm">No responses yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b">
                        <th className="pb-2 pr-4">Name</th>
                        <th className="pb-2 pr-4">Blood Group</th>
                        <th className="pb-2 pr-4">Phone</th>
                        <th className="pb-2">City</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {responses[req._id].map(r => (
                        <tr key={r._id} className="hover:bg-gray-50">
                          <td className="py-2 pr-4 font-medium">{r.donor?.name}</td>
                          <td className="py-2 pr-4">
                            <span className="font-bold text-red-600">{r.donor?.bloodGroup}</span>
                          </td>
                          <td className="py-2 pr-4">{r.donor?.phone || '—'}</td>
                          <td className="py-2">{r.donor?.city || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Create Request ───────────────────────────────────────────────────────── */
function CreateRequest({ onCreated }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    bloodGroup: '', units: 1, city: user?.city || '', urgency: 'normal', note: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function set(f) { return e => setForm(prev => ({ ...prev, [f]: e.target.value })); }

  function validate() {
    const e = {};
    if (!form.bloodGroup) e.bloodGroup = 'Required';
    if (!form.city.trim()) e.city = 'Required';
    if (form.units < 1 || form.units > 20) e.units = 'Units must be 1–20';
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      await api.post('/requests', { ...form, units: Number(form.units) });
      toast.success('Blood request posted! Donors are being notified.');
      onCreated();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  }

  const fc = err => `w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-400 ${err ? 'border-red-400' : 'border-gray-300'}`;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-lg">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Post a Blood Request</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group *</label>
          <select value={form.bloodGroup} onChange={set('bloodGroup')} className={fc(errors.bloodGroup)}>
            <option value="">Select…</option>
            {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          {errors.bloodGroup && <p className="text-red-500 text-xs mt-1">{errors.bloodGroup}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Units Needed *</label>
            <input type="number" min="1" max="20" value={form.units} onChange={set('units')} className={fc(errors.units)} />
            {errors.units && <p className="text-red-500 text-xs mt-1">{errors.units}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
            <input type="text" value={form.city} onChange={set('city')} className={fc(errors.city)} />
            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
          <div className="flex gap-2">
            {['normal', 'urgent', 'critical'].map(u => (
              <button key={u} type="button" onClick={() => setForm(f => ({ ...f, urgency: u }))}
                className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold capitalize transition ${
                  form.urgency === u ? 'border-red-600 bg-red-50 text-red-700' : 'border-gray-200 text-gray-500 hover:border-red-300'
                }`}>
                {u}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
          <textarea rows="3" value={form.note} onChange={set('note')}
            placeholder="E.g. required for surgery, patient details, etc."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-400 outline-none resize-none" />
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-red-600 text-white font-semibold py-2.5 rounded-lg hover:bg-red-700 disabled:opacity-60 transition">
          {loading ? 'Posting…' : '🩸 Post Request'}
        </button>
      </form>
    </div>
  );
}

/* ── Search Donors ────────────────────────────────────────────────────────── */
function SearchDonors() {
  const [searchGroup, setSearchGroup] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const debouncedCity = useDebounce(searchCity, 400); // Experiment 2 custom hook

  const qs = new URLSearchParams({
    ...(searchGroup && { bloodGroup: searchGroup }),
    ...(debouncedCity && { city: debouncedCity }),
  }).toString();

  const { data, loading, error } = useFetch(qs ? `/donors?${qs}` : null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <select value={searchGroup} onChange={e => setSearchGroup(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-400 outline-none">
          <option value="">All blood groups</option>
          {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <input type="text" placeholder="Search by city… (debounced)" value={searchCity}
          onChange={e => setSearchCity(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-400 outline-none flex-1 min-w-48" />
      </div>

      {!qs && <p className="text-gray-400 text-sm">Select a blood group or enter a city to search.</p>}
      {loading && <Spinner />}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {data && data.donors?.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-2">🔍</p>
          <p>No available donors found for this filter.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.donors?.map(d => (
          <div key={d._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-lg">
                {d.bloodGroup}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{d.name}</p>
                <p className="text-xs text-gray-500">{d.city}</p>
              </div>
            </div>
            {d.phone && (
              <a href={`tel:${d.phone}`} className="mt-3 flex items-center gap-1 text-sm text-red-600 hover:underline">
                📞 {d.phone}
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
