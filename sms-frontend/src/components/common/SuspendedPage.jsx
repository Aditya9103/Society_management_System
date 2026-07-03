import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

export default function SuspendedPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent px-4">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 p-8 shadow-2xl text-center relative overflow-hidden">
        {/* Glow behind icon */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-red-500/20 rounded-full blur-3xl"></div>

        <div className="relative mx-auto w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm ring-1 ring-red-500/20">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Account Suspended</h1>
        <p className="text-slate-600 mb-8 leading-relaxed">
          Your society or tenant account has been deactivated by the Super Admin. You temporarily do not have access to any functionality. Please contact support or your Super Admin for further assistance.
        </p>

        <Button onClick={handleLogout} className="w-full" size="lg">
          Back to Login
        </Button>
      </div>
    </div>
  );
}
