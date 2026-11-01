// pages/Home.jsx – landing page with hero, how-it-works, CTA
// Experiment 2: useEffect for document title
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const STEPS = [
  { icon: '📝', title: 'Register', desc: 'Sign up as a donor or hospital in under a minute.' },
  { icon: '🩸', title: 'Match', desc: 'Hospitals post requests; donors get notified instantly.' },
  { icon: '🤝', title: 'Connect', desc: 'Donors respond and hospitals see contact details.' },
  { icon: '❤️', title: 'Save Lives', desc: 'Every pint counts. Be a hero today.' },
];

const STATS = [
  { value: '10,000+', label: 'Donors Registered' },
  { value: '500+', label: 'Hospitals Connected' },
  { value: '25,000+', label: 'Lives Saved' },
];

export default function Home() {
  const { user } = useAuth();

  // useEffect: set page title
  useEffect(() => {
    document.title = 'BloodBridge – Donate Blood, Save Lives';
  }, []);

  return (
    <div className="flex flex-col">
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-red-700 to-red-900 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-6xl mb-4">🩸</p>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">
            Give Blood. <br className="hidden md:block" /> Save Lives.
          </h1>
          <p className="text-lg md:text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            BloodBridge connects willing donors with hospitals in real time.
            One click could save someone's life today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link
                to={`/${user.role}`}
                className="bg-white text-red-700 font-bold px-8 py-3 rounded-full text-lg hover:bg-red-50 transition shadow-lg"
              >
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="bg-white text-red-700 font-bold px-8 py-3 rounded-full text-lg hover:bg-red-50 transition shadow-lg"
                >
                  Become a Donor
                </Link>
                <Link
                  to="/login"
                  className="border-2 border-white text-white font-bold px-8 py-3 rounded-full text-lg hover:bg-red-600 transition"
                >
                  Hospital Login
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-red-50 py-10 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {STATS.map(s => (
            <div key={s.label} className="p-6 bg-white rounded-2xl shadow-sm border border-red-100">
              <p className="text-4xl font-extrabold text-red-600">{s.value}</p>
              <p className="text-gray-600 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it Works ── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <div key={step.title} className="text-center p-6 bg-red-50 rounded-2xl border border-red-100">
                <p className="text-4xl mb-3">{step.icon}</p>
                <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">Step {i + 1}</p>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      {!user && (
        <section className="bg-red-700 text-white py-16 px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to make a difference?</h2>
          <p className="text-red-100 mb-8">Join thousands of donors and hospitals already saving lives.</p>
          <Link
            to="/register"
            className="bg-white text-red-700 font-bold px-10 py-3 rounded-full text-lg hover:bg-red-50 transition shadow-lg inline-block"
          >
            Register Now – It's Free
          </Link>
        </section>
      )}
    </div>
  );
}
