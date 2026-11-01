// components/Spinner.jsx – reusable loading spinner
export default function Spinner({ size = 'md' }) {
  const s = size === 'sm' ? 'h-5 w-5' : size === 'lg' ? 'h-12 w-12' : 'h-8 w-8';
  return (
    <div className="flex justify-center items-center py-8">
      <div className={`${s} border-4 border-red-200 border-t-red-600 rounded-full spinner`} />
    </div>
  );
}
