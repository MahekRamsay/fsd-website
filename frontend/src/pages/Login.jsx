// pages/Login.jsx – login form with validation feedback
// Experiment 2: useEffect (title), useContext (AuthContext)
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const DASHBOARD = { donor: '/donor', hospital: '/hospital', admin: '/admin' };

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // useEffect: set document title
  useEffect(() => { document.title = 'Login – BloodBridge'; }, []);

  // If already logged in, redirect
  useEffect(() => {
    if (user) navigate(DASHBOARD[user.role] || '/', { replace: true });
  }, [user]);

  function validate() {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    if (!form.password) e.password = 'Password is required';
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      const from = location.state?.from?.pathname || DASHBOARD[res.data.user.role] || '/';
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      toast.error(msg);
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-4xl mb-2">🩸</p>
          <h1 className="text-2xl font-bold text-gray-800">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to BloodBridge</p>
        </div>

        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Email</label>
            <input
              id="email" type="email" autoComplete="email"
              className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-400 ${errors.email ? 'border-red-400' : 'border-gray-300'}`}
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">Password</label>
            <input
              id="password" type="password" autoComplete="current-password"
              className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-400 ${errors.password ? 'border-red-400' : 'border-gray-300'}`}
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-red-600 font-semibold hover:underline">Register</Link>
        </p>

        {/* Demo credentials hint */}
        <div className="mt-6 bg-gray-50 rounded-lg p-3 text-xs text-gray-500 space-y-1">
          <p className="font-semibold text-gray-600">Demo logins:</p>
          <p>🔴 Admin: admin@blood.com / Admin@123</p>
          <p>🏥 Hospital: hospital@blood.com / Hospital@123</p>
          <p>🩸 Donor: donor@blood.com / Donor@123</p>
        </div>
      </div>
    </div>
  );
}
