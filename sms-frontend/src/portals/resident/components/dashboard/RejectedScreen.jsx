import React from 'react';
import { XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../../../store/slices/authSlice';
import { disconnectSocket } from '../../../../socket/socketClient';

export function RejectedScreen({ reason }) {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(logout());
        disconnectSocket();
        navigate('/auth/login', { replace: true });
    };
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Access Revoked / Rejected</h2>
            <p className="mt-3 max-w-md text-sm text-slate-500 leading-relaxed">
                Unfortunately, your access to the portal has been revoked or your registration was rejected by the Society Admin.
            </p>
            {reason && (
                <div className="mt-4 rounded-xl bg-red-50 px-5 py-3 ring-1 ring-red-200 max-w-sm text-left">
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-500">Reason</p>
                    <p className="mt-1 text-sm text-red-700">{reason}</p>
                </div>
            )}
            <a
                href="mailto:admin@society.com"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
                Contact Admin
            </a>
            
            <button 
                onClick={handleLogout}
                className="mt-8 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
                Sign out
            </button>
        </div>
    );
}
