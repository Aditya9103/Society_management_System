import React, { useState } from 'react';
import { QrCode, RefreshCw, Trash2, X } from 'lucide-react';

export function DomesticStaffCard({ staff, onDelete }) {
    const [deleting, setDeleting] = useState(false);
    const [showQr, setShowQr] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);
        await onDelete(staff._id);
        setDeleting(false);
    };

    return (
        <div className="flex flex-col rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    {staff.photoUrl ? (
                        <img src={staff.photoUrl} alt={staff.name} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm">
                            {staff.name?.[0]?.toUpperCase()}
                        </div>
                    )}
                    <div>
                        <p className="text-sm font-semibold text-slate-800">{staff.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                                {staff.role}
                            </span>
                            {staff.phone && <span className="text-xs text-slate-500">{staff.phone}</span>}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    {staff.qrCodeUri && (
                        <button onClick={() => setShowQr(true)} title="Show QR Code"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-indigo-500 hover:bg-indigo-50 transition">
                            <QrCode className="h-4 w-4" />
                        </button>
                    )}
                    <button onClick={handleDelete} disabled={deleting} title="Remove Staff"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition">
                        {deleting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                </div>
            </div>

            {/* QR Modal */}
            {showQr && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-center relative">
                        <button onClick={() => setShowQr(false)} className="absolute top-4 right-4 p-1 text-slate-400 hover:bg-slate-100 rounded-lg"><X className="h-5 w-5" /></button>
                        <h3 className="font-bold text-slate-800 mb-4">Staff QR Code</h3>
                        <img src={staff.qrCodeUri} alt="QR Code" className="mx-auto w-48 h-48 mb-4 border-4 border-slate-100 rounded-xl" />
                        <p className="text-sm font-semibold text-slate-800">{staff.name}</p>
                        <p className="text-xs text-slate-500 mb-2">{staff.role}</p>
                        <p className="text-xs text-indigo-600 font-medium">Scan this code at the gate for daily entry.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
