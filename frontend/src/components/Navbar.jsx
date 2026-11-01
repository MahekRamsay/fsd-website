// components/Navbar.jsx – responsive navbar with hamburger + notification bell
// Experiment 2: useContext (AuthContext, NotificationContext), useEffect (document title)
import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const DASHBOARD_ROUTES = {
  donor: '/donor',
  hospital: '/hospital',
  admin: '/admin',
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const { notifications, clearNotifications } = useNotifications();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);

  // useEffect: update document title with unread count
  useEffect(() => {
    const count = notifications.length;
    document.title = count > 0 ? `(${count}) Blood Donation Portal` : 'Blood Donation Portal';
  }, [notifications.length]);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const dashRoute = user ? DASHBOARD_ROUTES[user.role] : null;

  return (
    <nav className="bg-red-700 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <span className="text-2xl">🩸</span> BloodBridge
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/" className={({ isActive }) => isActive ? 'underline' : 'hover:underline'}>
              Home
            </NavLink>
            {user && dashRoute && (
              <NavLink to={dashRoute} className={({ isActive }) => isActive ? 'underline' : 'hover:underline'}>
                Dashboard
              </NavLink>
            )}
            {!user && (
              <>
                <NavLink to="/login" className="hover:underline">Login</NavLink>
                <NavLink to="/register" className="bg-white text-red-700 px-4 py-1.5 rounded-full font-semibold hover:bg-red-50 transition">
                  Register
                </NavLink>
              </>
            )}
            {user && (
              <>
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => { setBellOpen(o => !o); setMenuOpen(false); }}
                    className="relative p-1 rounded-full hover:bg-red-600 transition"
                    aria-label="Notifications"
                  >
                    🔔
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-yellow-400 text-red-900 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {notifications.length > 9 ? '9+' : notifications.length}
                      </span>
                    )}
                  </button>
                  {bellOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-100 z-50">
                      <div className="flex items-center justify-between px-4 py-2 border-b">
                        <span className="font-semibold text-sm">Notifications</span>
                        <button onClick={clearNotifications} className="text-xs text-red-600 hover:underline">
                          Clear all
                        </button>
                      </div>
                      {notifications.length === 0 ? (
                        <p className="text-center text-gray-400 py-6 text-sm">No notifications yet</p>
                      ) : (
                        <ul className="max-h-64 overflow-y-auto divide-y divide-gray-50">
                          {notifications.map(n => (
                            <li key={n.id} className="px-4 py-3 text-sm hover:bg-gray-50">
                              {n.message}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>

                <span className="text-red-200 text-sm hidden lg:block">
                  {user.name} ({user.role})
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-white text-red-700 px-4 py-1.5 rounded-full font-semibold hover:bg-red-50 transition"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Hamburger (mobile) */}
          <button
            className="md:hidden p-2 rounded hover:bg-red-600 transition"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-red-800 px-4 py-3 space-y-2 border-t border-red-600">
          <NavLink to="/" className="block hover:underline" onClick={() => setMenuOpen(false)}>Home</NavLink>
          {user && dashRoute && (
            <NavLink to={dashRoute} className="block hover:underline" onClick={() => setMenuOpen(false)}>Dashboard</NavLink>
          )}
          {!user && (
            <>
              <NavLink to="/login" className="block hover:underline" onClick={() => setMenuOpen(false)}>Login</NavLink>
              <NavLink to="/register" className="block hover:underline" onClick={() => setMenuOpen(false)}>Register</NavLink>
            </>
          )}
          {user && (
            <button onClick={handleLogout} className="block w-full text-left hover:underline">Logout</button>
          )}
        </div>
      )}
    </nav>
  );
}
