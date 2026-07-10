import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { FileQuestion } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 text-center border border-white/50">
        <div className="mx-auto w-24 h-24 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-8 shadow-inner">
          <FileQuestion size={48} strokeWidth={1.5} />
        </div>
        <h1 className="text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-slate-800 mb-3 tracking-tight">Page Not Found</h2>
        <p className="text-slate-500 mb-8 leading-relaxed">
          The page you are looking for doesn't exist or might have been removed.
        </p>
        <Button onClick={() => navigate('/')} className="w-full py-3 text-base">
          Return Home
        </Button>
      </div>
    </div>
  );
}
