import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 text-center border border-white/50">
        <div className="mx-auto w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <ShieldAlert size={40} strokeWidth={1.5} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Access Denied</h1>
        <p className="text-slate-500 mb-8 leading-relaxed">
          You don't have permission to access this area. If you believe this is an error, please contact the administrator.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => navigate(-1)} variant="outline" className="w-full">
            Go Back
          </Button>
          <Button onClick={() => navigate('/')} className="w-full">
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
