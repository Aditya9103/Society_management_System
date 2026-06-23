/**
 * ResidentVisitorPage.jsx — Create and manage visitor passes.
 */
import React, { useState } from 'react';
import {
    useGetMyVisitorsQuery,
    useCreateVisitorPassMutation,
    useCancelVisitorPassMutation,
    useApproveWalkInMutation,
    useDenyWalkInMutation,
} from '../../../store/api/residentApi';
import { UserCheck, Plus, X, RefreshCw, AlertCircle, Car, Phone, Clock, Check } from 'lucide-react';

const STATUS_STYLES = {
    PENDING:   { cls: 'bg-amber-100 text-amber-700',   label: 'Pending' },
    APPROVED:  { cls: 'bg-emerald-100 text-emerald-700', label: 'Approved' },
    INSIDE:    { cls: 'bg-blue-100 text-blue-700',     label: 'Inside' },
    EXITED:    { cls: 'bg-slate-100 text-slate-500',   label: 'Exited' },
    DENIED:    { cls: 'bg-red-100 text-red-600',       label: 'Denied' },
    CANCELLED: { cls: 'bg-slate-100 text-slate-400',   label: 'Cancelled' },
    EXPIRED:   { cls: 'bg-slate-100 text-slate-400',   label: 'Expired' },
};

const VISITOR_TYPES = ['GUEST', 'DELIVERY', 'SERVICE', 'DOMESTIC_STAFF', 'VENDOR', 'OFFICIAL', 'CONTRACTOR'];

// ── Add Visitor Modal ─────────────────────────────────────────────────────────
function AddVisitorModal({ onClose }) {
    const [createVisitorPass, { isLoading }] = useCreateVisitorPassMutation();
    const [form, setForm] = useState({
        visitorName: '', visitorPhone: '', visitorEmail: '', visitorType: 'GUEST',
        purpose: '', expectedArrival: '', vehicleNumber: '',
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.visitorName.trim()) return setError('Visitor name is required.');
        setError('');
        try {
            await createVisitorPass(form).unwrap();
            onClose();
        } catch (err) {
            setError(err?.data?.message ?? 'Failed to create visitor pass.');
        }
    };

    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-slate-800 text-lg">Invite a Visitor</h3>
                    <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100"><X className="h-5 w-5" /></button>
                </div>
                {error && <p className="mb-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Visitor Name *</label>
                            <input value={form.visitorName} onChange={set('visitorName')}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                placeholder="Full name" />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Visitor Email <span className="font-normal text-slate-400">(receives QR)</span></label>
                            <input type="email" value={form.visitorEmail} onChange={set('visitorEmail')}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                placeholder="visitor@example.com" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Visitor Type *</label>
                            <select value={form.visitorType} onChange={set('visitorType')}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                                {VISITOR_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Expected Arrival</label>
                            <input type="datetime-local" value={form.expectedArrival} onChange={set('expectedArrival')}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Purpose</label>
                        <input value={form.purpose} onChange={set('purpose')}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            placeholder="e.g. Family visit, Package delivery..." />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Vehicle Number <span className="font-normal text-slate-400">(optional)</span></label>
                        <input value={form.vehicleNumber} onChange={set('vehicleNumber')}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            placeholder="MH01AB1234" />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                        <button type="submit" disabled={isLoading}
                            className="flex-1 rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-2">
                            {isLoading && <RefreshCw className="h-4 w-4 animate-spin" />} Create Pass
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Visitor card ──────────────────────────────────────────────────────────────
function VisitorCard({ visitor }) {
    const [cancelVisitorPass, { isLoading: isCancelling }] = useCancelVisitorPassMutation();
    const [approveWalkIn, { isLoading: isApproving }] = useApproveWalkInMutation();
    const [denyWalkIn, { isLoading: isDenying }] = useDenyWalkInMutation();
    
    const s = STATUS_STYLES[visitor.status] ?? STATUS_STYLES.PENDING;
    const canCancel = ['PENDING', 'APPROVED'].includes(visitor.status) && visitor.approvalMethod !== 'REAL_TIME_APPROVAL';
    const needsApproval = visitor.status === 'PENDING' && visitor.approvalMethod === 'REAL_TIME_APPROVAL';

    return (
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                    <p className="font-semibold text-slate-900">{visitor.visitorName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{visitor.visitorType.replace('_', ' ')} {visitor.purpose ? `· ${visitor.purpose}` : ''}</p>
                </div>
                <span className={`text-xs font-semibold rounded-full px-2.5 py-0.5 shrink-0 ${s.cls}`}>{s.label}</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mb-3">
                {visitor.visitorPhone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{visitor.visitorPhone}</span>}
                {visitor.vehicleNumber && <span className="flex items-center gap-1"><Car className="h-3.5 w-3.5" />{visitor.vehicleNumber}</span>}
                {visitor.expectedArrival && (
                    <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(visitor.expectedArrival).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                )}
            </div>
            
            <div className="flex items-center gap-3">
                {needsApproval && (
                    <>
                        <button onClick={() => approveWalkIn(visitor._id)} disabled={isApproving || isDenying}
                            className="flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 disabled:opacity-50">
                            {isApproving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Approve
                        </button>
                        <button onClick={() => denyWalkIn(visitor._id)} disabled={isApproving || isDenying}
                            className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-50">
                            {isDenying ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />} Deny
                        </button>
                    </>
                )}
                {canCancel && (
                    <button onClick={() => cancelVisitorPass(visitor._id)} disabled={isCancelling}
                        className="text-xs font-semibold text-red-500 hover:text-red-600 disabled:opacity-60">
                        {isCancelling ? 'Cancelling…' : 'Cancel Pass'}
                    </button>
                )}
            </div>
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ResidentVisitorPage() {
    const { data, isLoading, isError, refetch } = useGetMyVisitorsQuery();
    const [showModal, setShowModal] = useState(false);
    const visitors = data?.data ?? [];

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Visitor Passes</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Manage your guest and visitor access</p>
                </div>
                <button onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition">
                    <Plus className="h-4 w-4" /> Invite Visitor
                </button>
            </div>

            {isError && (
                <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-600 ring-1 ring-red-200">
                    <AlertCircle className="h-5 w-5 shrink-0" /> Failed to load visitors. <button onClick={refetch} className="underline ml-1">Retry</button>
                </div>
            )}

            {isLoading ? (
                <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-200" />)}</div>
            ) : visitors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
                        <UserCheck className="h-8 w-8 text-indigo-400" />
                    </div>
                    <p className="font-semibold text-slate-700">No visitor passes yet</p>
                    <p className="text-sm text-slate-400 mt-1">Create a pass to pre-approve a visitor.</p>
                </div>
            ) : (
                <div className="space-y-3">{visitors.map(v => <VisitorCard key={v._id} visitor={v} />)}</div>
            )}

            {showModal && <AddVisitorModal onClose={() => { setShowModal(false); refetch(); }} />}
        </div>
    );
}
