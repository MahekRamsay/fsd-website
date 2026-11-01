// pages/Register.jsx – registration form with role selector
// Experiment 2: useEffect (title), useContext (AuthContext)
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const DASHBOARD = { donor: '/donor', hospital: '/hospital' };

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'donor',
    phone: '', city: '', bloodGroup: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // useEffect: page title
  useEffect(() => { document.title = 'Register – BloodBridge'; }, []);

  function set(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (!form.city.trim()) e.city = 'City is required';
    if (form.role === 'donor' && !form.bloodGroup) e.bloodGroup = 'Blood group is required for donors';
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setLoading(true);
    try {
      const payload = { ...form };
      if (form.role === 'hospital') delete payload.bloodGroup; // hospitals don't have a blood group
      const res = await api.post('/auth/register', payload);
      login(res.data.token, res.data.user);
      toast.success('Registration successful! Welcome 🎉');
      navigate(DASHBOARD[res.data.user.role] || '/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg">
        <div className="text-center mb-8">
          <p className="text-4xl mb-2">🩸</p>
          <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
          <p className="text-gray-500 text-sm mt-1">Join BloodBridge today</p>
        </div>

        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3">
            {['donor', 'hospital'].map(r => (
              <button
                key={r} type="button"
                onClick={() => setForm(f => ({ ...f, role: r }))}
                className={`py-2.5 rounded-lg border-2 font-semibold capitalize text-sm transition ${
                  form.role === r
                    ? 'border-red-600 bg-red-50 text-red-700'
                    : 'border-gray-200 text-gray-600 hover:border-red-300'
                }`}
              >
                {r === 'donor' ? '🩸 Donor' : '🏥 Hospital'}
              </button>
            ))}
          </div>

          {/* Name */}
          <Field label={form.role === 'hospital' ? 'Hospital Name' : 'Full Name'} error={errors.name}>
            <input type="text" value={form.name} onChange={set('name')}
              className={fieldClass(errors.name)} />
          </Field>

          {/* Email */}
          <Field label="Email" error={errors.email}>
            <input type="email" value={form.email} onChange={set('email')}
              className={fieldClass(errors.email)} autoComplete="email" />
          </Field>

          {/* Password */}
          <Field label="Password (min 8 chars)" error={errors.password}>
            <input type="password" value={form.password} onChange={set('password')}
              className={fieldClass(errors.password)} autoComplete="new-password" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            {/* Phone */}
            <Field label="Phone" error={errors.phone}>
              <input type="tel" value={form.phone} onChange={set('phone')}
                className={fieldClass(errors.phone)} />
            </Field>

            {/* City */}
            <Field label="City" error={errors.city}>
              <input type="text" value={form.city} onChange={set('city')}
                className={fieldClass(errors.city)} />
            </Field>
          </div>

          {/* Blood group – donors only */}
          {form.role === 'donor' && (
            <Field label="Blood Group" error={errors.bloodGroup}>
              <select value={form.bloodGroup} onChange={set('bloodGroup')}
                className={fieldClass(errors.bloodGroup)}>
                <option value="">Select…</option>
                {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </Field>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-red-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

// Small helper components to keep the form DRY
function fieldClass(hasError) {
  return `w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-400 ${hasError ? 'border-red-400' : 'border-gray-300'}`;
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
