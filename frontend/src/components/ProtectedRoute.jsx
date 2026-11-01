// components/ProtectedRoute.jsx – Experiment 2: useContext usage
// Redirects to /login if not authenticated; 403 page if wrong role
import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children, roles }) {
  const { token, user } = useAuth();
  const location = useLocation();

  if (!token || !user) {
    // Save where they were trying to go, so we can redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-6xl font-bold text-red-600">403</p>
          <p className="text-xl text-gray-600 mt-2">Access Forbidden</p>
          <p className="text-gray-500 mt-1">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return children;
}
