/**
 * StaffComplaintsPage.jsx — Role-aware complaint view for staff.
 *
 * COMMITTEE_MEMBER, FACILITY_MANAGER, HELP_DESK: can read all complaints.
 * FACILITY_MANAGER: can also assign.
 * Any staff role: can raise a complaint.
 */
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
    useGetStaffComplaintsQuery, useStaffRaiseComplaintMutation,
    useStaffAssignComplaintMutation,
} from '../../../store/api/staffApi';
import { MessageSquareWarning, Plus, X, RefreshCw, AlertCircle } from 'lucide-react';

const STATUS_STYLES = {
    OPEN:        { cls: 'bg-amber-100 text-amber-700',   label: 'Open' },
    ASSIGNED:    { cls: 'bg-blue-100 text-blue-700',     label: 'Assigned' },
    IN_PROGRESS: { cls: 'bg-indigo-100 text-indigo-700', label: 'In Progress' },
    RESOLVED:    { cls: 'bg-emerald-100 text-emerald-700', label: 'Resolved' },
    CLOSED:      { cls: 'bg-slate-100 text-slate-600',   label: 'Closed' },
    ESCALATED:   { cls: 'bg-red-100 text-red-700',       label: 'Escalated' },
};

const PRIORITY_STYLES = {
    LOW: 'bg-slate-100 text-slate-500', MEDIUM: 'bg-yellow-100 text-yellow-700',
    HIGH: 'bg-orange-100 text-orange-700', URGENT: 'bg-red-100 text-red-700',
};

const CATEGORIES = ['PLUMBING','ELECTRICAL','CIVIL','SECURITY','CLEANING','LIFT','PARKING','NOISE','PEST_CONTROL','LANDSCAPING','INTERNET','GAS','ADMIN','OTHER'];

// ── Raise Complaint Modal ─────────────────────────────────────────────────────
function RaiseModal({ onClose }) {
    const [raiseComplaint, { isLoading }] = useStaffRaiseComplaintMutation();
    const [form, setForm] = useState({ title: '', description: '', category: 'GENERAL', priority: 'MEDIUM', isCommonArea: true, commonAreaLocation: '' });
    const [error, setError] = useState('');
    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.description) return setError('Title and description required.');
        try { await raiseComplaint(form).unwrap(); onClose(); }
        catch (err) { setError(err?.data?.message ?? 'Failed to raise complaint.'); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-slate-800 text-lg">Raise Complaint</h3>
                    <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100"><X className="h-5 w-5" /></button>
                </div>
                {error && <p className="mb-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Title *</label>
                        <input value={form.title} onChange={set('title')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Description *</label>
                        <textarea value={form.description} onChange={set('description')} rows={3} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Category</label>
                            <select value={form.category} onChange={set('category')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                                {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Priority</label>
                            <select value={form.priority} onChange={set('priority')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                                {['LOW','MEDIUM','HIGH','URGENT'].map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600">Cancel</button>
                        <button type="submit" disabled={isLoading} className="flex-1 rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-2">
                            {isLoading && <RefreshCw className="h-4 w-4 animate-spin" />} Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function StaffComplaintsPage() {
    const { user } = useSelector(s => s.auth);
    const role = user?.role;
    const { data, isLoading, isError, refetch } = useGetStaffComplaintsQuery();
    const [assignComplaint] = useStaffAssignComplaintMutation();
    const [showModal, setShowModal] = useState(false);
    const complaints = data?.data ?? [];
    const canRaise = ['COMMITTEE_MEMBER','ACCOUNTANT','FACILITY_MANAGER','HELP_DESK'].includes(role);
    const canAssign = role === 'FACILITY_MANAGER';

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Complaints</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Society-wide maintenance and issue tracking</p>
                </div>
                {canRaise && (
                    <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition">
                        <Plus className="h-4 w-4" /> Raise Complaint
                    </button>
                )}
            </div>

            {isError && (
                <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-600 ring-1 ring-red-200">
                    <AlertCircle className="h-5 w-5 shrink-0" /> Failed to load. <button onClick={refetch} className="underline ml-1">Retry</button>
                </div>
            )}

            {isLoading ? (
                <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-200" />)}</div>
            ) : complaints.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50"><MessageSquareWarning className="h-8 w-8 text-indigo-400" /></div>
                    <p className="font-semibold text-slate-700">No complaints found</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {complaints.map(c => {
                        const s = STATUS_STYLES[c.status] ?? STATUS_STYLES.OPEN;
                        return (
                            <div key={c._id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-900 truncate">{c.title}</p>
                                        <p className="text-xs text-slate-400 font-mono mt-0.5">{c.complaintNumber}</p>
                                    </div>
                                    <span className={`text-xs font-semibold rounded-full px-2.5 py-0.5 shrink-0 ${s.cls}`}>{s.label}</span>
                                </div>
                                <p className="text-sm text-slate-500 line-clamp-1 mb-3">{c.description}</p>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-medium text-slate-500 bg-slate-100 rounded-full px-2.5 py-0.5">{c.category}</span>
                                    <span className={`text-xs font-semibold rounded-full px-2.5 py-0.5 ${PRIORITY_STYLES[c.priority] ?? ''}`}>{c.priority}</span>
                                    <span className="text-xs text-slate-400 ml-auto">{new Date(c.createdAt).toLocaleDateString('en-IN')}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            {showModal && <RaiseModal onClose={() => { setShowModal(false); refetch(); }} />}
        </div>
    );
}
