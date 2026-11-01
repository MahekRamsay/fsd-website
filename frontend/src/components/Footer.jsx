// components/Footer.jsx
export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-2xl mb-2">🩸 BloodBridge</p>
        <p className="text-sm">Connecting donors with hospitals — saving lives, one drop at a time.</p>
        <p className="text-xs mt-4 text-gray-600">© {new Date().getFullYear()} Blood Donation Portal · College Mini Project</p>
      </div>
    </footer>
  );
}
