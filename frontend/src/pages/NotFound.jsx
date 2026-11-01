// pages/NotFound.jsx – 404 page
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 px-4">
      <div className="text-center">
        <p className="text-8xl font-extrabold text-red-600 mb-4">404</p>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Page Not Found</h1>
        <p className="text-gray-500 mb-8">The page you're looking for doesn't exist.</p>
        <Link to="/" className="bg-red-600 text-white font-semibold px-6 py-3 rounded-full hover:bg-red-700 transition">
          Go Home
        </Link>
      </div>
    </div>
  );
}
