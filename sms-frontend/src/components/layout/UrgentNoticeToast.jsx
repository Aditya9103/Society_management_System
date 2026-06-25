import React from 'react';
import { toast } from 'react-hot-toast';
import { AlertOctagon, X, BellRing } from 'lucide-react';

export default function UrgentNoticeToast({ t, data }) {
    return (
        <div
            className={`${t.visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                } transition-all duration-300 ease-out transform pointer-events-auto w-full max-w-lg bg-white shadow-[0_20px_60px_-15px_rgba(220,38,38,0.3)] rounded-2xl ring-1 ring-slate-200 p-5`}
            style={{ marginTop: '40vh', transform: 'translateY(-50%)' }}
        >
            <div className="flex w-full gap-4 items-start">
                <div className="flex-shrink-0 mt-0.5">
                    <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center ring-4 ring-red-50/50">
                        <AlertOctagon className="h-6 w-6 text-red-600" />
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-base font-bold text-slate-900 leading-tight">
                            {data.title || 'Urgent Notice'}
                        </p>
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700 tracking-wide uppercase">
                            <BellRing className="h-3 w-3" />
                            {data.priority || 'URGENT'}
                        </span>
                    </div>

                    <div className="mt-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-sm text-slate-700 leading-relaxed line-clamp-4">
                            {data.message}
                        </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-xs font-medium text-slate-500 flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            Live Update
                        </p>

                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="text-xs font-extrabold px-3 py-1.5 rounded-lg cursor-pointer text-white bg-blue-600 hover:bg-blue-700 transition-transform duration-100 ease-in-out transform hover:scale-105"
                        >
                            Acknowledge
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
