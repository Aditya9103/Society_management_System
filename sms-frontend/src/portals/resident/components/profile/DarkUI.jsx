import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, RefreshCw } from 'lucide-react';

export function DarkModal({ isOpen, onClose, title, children }) {
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center p-4 z-[9999]">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 w-full max-w-md rounded-[24px] bg-[#0a0b12] border border-purple-500/30 shadow-[0_0_40px_rgba(168,85,247,0.15)] overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex shrink-0 items-center justify-between border-b border-slate-800/80 px-6 py-5">
                    <h2 className="text-lg font-bold text-white">{title}</h2>
                    <button type="button" onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="overflow-y-auto px-6 py-5 text-white">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
}

export function DarkInput({ label, error, ...props }) {
    return (
        <div className="w-full">
            {label && <label className="block text-xs font-semibold text-slate-400 mb-1.5">{label}</label>}
            <input 
                className={`w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors ${error ? 'border-red-500' : ''}`}
                {...props}
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}

export function DarkSelect({ label, error, children, ...props }) {
    return (
        <div className="w-full relative">
            {label && <label className="block text-xs font-semibold text-slate-400 mb-1.5">{label}</label>}
            <select 
                className={`w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors appearance-none ${error ? 'border-red-500' : ''}`}
                {...props}
            >
                {children}
            </select>
            <div className="absolute right-4 top-[34px] pointer-events-none text-slate-400 text-xs">▼</div>
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}

export function DarkButton({ children, isLoading, variant = 'primary', className = '', ...props }) {
    const base = "flex items-center justify-center h-11 rounded-xl px-6 text-sm font-bold transition-colors disabled:opacity-60";
    const variants = {
        primary: "bg-purple-600 text-white hover:bg-purple-700 shadow-[0_0_15px_rgba(168,85,247,0.3)]",
        secondary: "bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white"
    };
    
    return (
        <button className={`${base} ${variants[variant]} ${className}`} disabled={isLoading} {...props}>
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
            {children}
        </button>
    );
}
