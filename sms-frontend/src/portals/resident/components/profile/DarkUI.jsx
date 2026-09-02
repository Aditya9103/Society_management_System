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
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
            <div className="relative z-10 w-full max-w-md rounded-3xl bg-[#0B0D17] border border-indigo-500/20 shadow-[0_0_40px_rgba(99,102,241,0.15)] overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex shrink-0 items-center justify-between border-b border-white/5 px-6 py-5">
                    <h2 className="text-lg font-bold text-white">{title}</h2>
                    <button type="button" onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-xl text-white font-bold hover:bg-white/5 hover:text-white transition-colors">
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
            {label && <label className="block text-xs font-bold text-white font-bold mb-2 tracking-wide">{label}</label>}
            <input 
                className={`w-full rounded-xl border border-white/10 bg-[#131525] px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors shadow-inner ${error ? 'border-red-500' : ''}`}
                {...props}
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}

export function DarkSelect({ label, error, children, ...props }) {
    return (
        <div className="w-full relative">
            {label && <label className="block text-xs font-bold text-white font-bold mb-2 tracking-wide">{label}</label>}
            <select 
                className={`w-full rounded-xl border border-white/10 bg-[#131525] px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors appearance-none shadow-inner ${error ? 'border-red-500' : ''}`}
                {...props}
            >
                {children}
            </select>
            <div className="absolute right-4 top-[38px] pointer-events-none text-white font-bold text-xs">▼</div>
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}

export function DarkButton({ children, isLoading, variant = 'primary', className = '', ...props }) {
    const base = "flex items-center justify-center h-12 rounded-xl px-6 text-sm font-bold transition-all disabled:opacity-60";
    const variants = {
        primary: "bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)]",
        secondary: "bg-[#131525] text-white font-bold border border-white/10 hover:border-white/20 hover:text-white"
    };
    
    return (
        <button className={`${base} ${variants[variant]} ${className}`} disabled={isLoading} {...props}>
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
            {children}
        </button>
    );
}
