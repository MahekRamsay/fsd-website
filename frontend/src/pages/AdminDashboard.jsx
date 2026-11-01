// pages/AdminDashboard.jsx – stats cards, user table, request table
// Experiment 2: useEffect (title), useContext (AuthContext), useFetch (custom hook)
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useFetch } from '../hooks/useFetch';
import { useSocket } from '../hooks/useSocket';
import api from '../api';
import Badge from '../components/Badge';
import Spinner from '../components/Spinner';

export default function AdminDashboard() {
  const { user } = useAuth();
  useSocket();

  // useEffect: document title
  useEffect(() => { document.title = 'Admin Dashboard – BloodBridge'; }, []);

  const { data: statsData, loading: statsLoading } = useFetch('/admin/stats');
  const { data: usersData, loading: usersLoading, refetch: refetchUsers } = useFetch('/admin/users');
  const { data: reqsData, loading: reqsLoading, refetch: refetchReqs } = useFetch('/requests');

  const [tab, setTab] = useState('Users');

  async function deleteUser(id) {
    if (!confirm('Delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      refetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  }

  async function deleteRequest(id) {
    if (!confirm('Delete this request?')) return;
    try {
      await api.delete(`/requests/${id}`);
      toast.success('Request deleted');
      refetchReqs();
    } catch {
      toast.error('Delete failed');
    }
  }

  const STAT_CARDS = statsData
    ? [
        { label: 'Total Donors', value: statsData.totalDonors, icon: '🩸', color: 'bg-red-50 border-red-200 text-red-700' },
        { label: 'Total Hospitals', value: statsData.totalHospitals, icon: '🏥', color: 'bg-blue-50 border-blue-200 text-blue-700' },
        { label: 'Open Requests', value: statsData.openRequests, icon: '📋', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
        { label: 'Fulfilled', value: statsData.fulfilledRequests, icon: '✅', color: 'bg-green-50 border-green-200 text-green-700' },
      ]
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">🔴 Admin Dashboard</h1>
        <p className="text-gray-500 text-sm">{user?.email}</p>
      </div>

      {/* Stats cards */}
      {statsLoading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CARDS.map(s => (
            <div key={s.label} className={`rounded-2xl border p-6 ${s.color}`}>
              <p className="text-3xl mb-2">{s.icon}</p>
              <p className="text-4xl font-extrabold">{s.value}</p>
              <p className="text-sm font-medium mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {['Users', 'Requests'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition -mb-px ${
              tab === t ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* Users table */}
      {tab === 'Users' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b font-semibold text-gray-700">All Users ({usersData?.users?.length ?? '…'})</div>
          {usersLoading ? <Spinner /> : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <tr>
                    {['Name', 'Email', 'Role', 'City', 'Blood Group', 'Joined', 'Action'].map(h => (
                      <th key={h} className="px-4 py-3 text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {usersData?.users?.map(u => (
                    <tr key={u._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
                      <td className="px-4 py-3 text-gray-600">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`capitalize px-2 py-0.5 rounded-full text-xs font-semibold ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-700'
                          : u.role === 'hospital' ? 'bg-blue-100 text-blue-700'
                          : 'bg-red-100 text-red-700'
                        }`}>{u.role}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{u.city || '—'}</td>
                      <td className="px-4 py-3">
                        {u.bloodGroup
                          ? <span className="font-bold text-red-600">{u.bloodGroup}</span>
                          : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        {u.role !== 'admin' && (
                          <button onClick={() => deleteUser(u._id)}
                            className="text-red-600 hover:underline text-xs font-semibold">
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Requests table */}
      {tab === 'Requests' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b font-semibold text-gray-700">All Requests ({reqsData?.requests?.length ?? '…'})</div>
          {reqsLoading ? <Spinner /> : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <tr>
                    {['Hospital', 'Blood', 'Units', 'City', 'Urgency', 'Status', 'Responses', 'Action'].map(h => (
                      <th key={h} className="px-4 py-3 text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {reqsData?.requests?.map(r => (
                    <tr key={r._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{r.hospital?.name || '—'}</td>
                      <td className="px-4 py-3 font-bold text-red-600">{r.bloodGroup}</td>
                      <td className="px-4 py-3">{r.units}</td>
                      <td className="px-4 py-3 text-gray-600">{r.city}</td>
                      <td className="px-4 py-3"><Badge type="urgency" value={r.urgency} /></td>
                      <td className="px-4 py-3"><Badge type="status" value={r.status} /></td>
                      <td className="px-4 py-3">{r.responseCount}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => deleteRequest(r._id)}
                          className="text-red-600 hover:underline text-xs font-semibold">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
