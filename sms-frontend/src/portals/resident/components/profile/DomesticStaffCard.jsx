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
        <div className="flex flex-col rounded-[16px] bg-[#12131c] p-4 border border-slate-800/80 shadow-sm transition-colors hover:border-slate-700">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    {staff.photoUrl ? (
                        <img src={staff.photoUrl} alt={staff.name} className="h-10 w-10 rounded-xl object-cover border border-slate-700" />
                    ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 font-bold text-sm border border-emerald-500/20">
                            {staff.name?.[0]?.toUpperCase()}
                        </div>
                    )}
                    <div>
                        <p className="text-[13px] font-bold text-white">{staff.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                                {staff.role === 'OTHER' ? staff.customRole || 'OTHER' : staff.role}
                            </span>
                            {staff.phone && <span className="text-[11px] text-slate-400">{staff.phone}</span>}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    {staff.qrCodeUri && (
                        <button onClick={() => setShowQr(true)} title="Show QR Code"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 transition-colors">
                            <QrCode className="h-4 w-4" />
                        </button>
                    )}
                    <button onClick={handleDelete} disabled={deleting} title="Remove Staff"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors">
                        {deleting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                </div>
            </div>

            {/* QR Modal */}
            {showQr && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-[24px] bg-[#0a0b12] border border-purple-500/20 p-6 shadow-[0_0_40px_rgba(168,85,247,0.15)] text-center relative">
                        <button onClick={() => setShowQr(false)} className="absolute top-4 right-4 p-1 text-slate-400 hover:bg-slate-800 rounded-lg transition-colors"><X className="h-5 w-5" /></button>
                        <h3 className="font-bold text-white mb-4">Staff QR Code</h3>
                        <div className="bg-white p-2 rounded-xl inline-block mb-4 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                            <img src={staff.qrCodeUri} alt="QR Code" className="w-44 h-44 rounded-lg" />
                        </div>
                        <p className="text-sm font-bold text-white">{staff.name}</p>
                        <p className="text-[11px] text-slate-400 mb-2">{staff.role === 'OTHER' ? staff.customRole || 'OTHER' : staff.role}</p>
                        <p className="text-[11px] text-purple-400 font-medium">Scan this code at the gate for daily entry.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
