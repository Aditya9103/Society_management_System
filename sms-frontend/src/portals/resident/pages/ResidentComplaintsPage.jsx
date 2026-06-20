/**
 * ResidentComplaintsPage.jsx — Raise and track complaints.
 */
import React, { useState } from 'react';
import { useGetMyComplaintsQuery, useRaiseComplaintMutation } from '../../../store/api/residentApi';
import { MessageSquareWarning, Plus, X, RefreshCw, AlertCircle, Clock, CheckCircle2, Wrench } from 'lucide-react';

// ── Status badge ──────────────────────────────────────────────────────────────
const STATUS_STYLES = {
    OPEN:        { cls: 'bg-amber-100 text-amber-700',   label: 'Open' },
    ASSIGNED:    { cls: 'bg-blue-100 text-blue-700',     label: 'Assigned' },
    IN_PROGRESS: { cls: 'bg-indigo-100 text-indigo-700', label: 'In Progress' },
    RESOLVED:    { cls: 'bg-emerald-100 text-emerald-700', label: 'Resolved' },
    CLOSED:      { cls: 'bg-slate-100 text-slate-600',   label: 'Closed' },
    ESCALATED:   { cls: 'bg-red-100 text-red-700',       label: 'Escalated' },
    REJECTED:    { cls: 'bg-red-100 text-red-700',       label: 'Rejected' },
    REOPENED:    { cls: 'bg-purple-100 text-purple-700', label: 'Reopened' },
};

const PRIORITY_STYLES = {
    LOW:    'bg-slate-100 text-slate-500',
    MEDIUM: 'bg-yellow-100 text-yellow-700',
    HIGH:   'bg-orange-100 text-orange-700',
    URGENT: 'bg-red-100 text-red-700',
};

const CATEGORIES = [
    'PLUMBING', 'ELECTRICAL', 'CIVIL', 'SECURITY', 'CLEANING', 'LIFT',
    'PARKING', 'NOISE', 'PEST_CONTROL', 'LANDSCAPING', 'INTERNET', 'GAS', 'ADMIN', 'OTHER',
];

function StatusBadge({ status }) {
    const s = STATUS_STYLES[status] ?? STATUS_STYLES.OPEN;
    return <span className={`text-xs font-semibold rounded-full px-2.5 py-0.5 ${s.cls}`}>{s.label}</span>;
}

// ── Raise Complaint Modal ──────────────────────────────────────────────────────
function RaiseComplaintModal({ onClose }) {
    const [raiseComplaint, { isLoading }] = useRaiseComplaintMutation();
    const [form, setForm] = useState({
        title: '', description: '', category: 'PLUMBING', priority: 'MEDIUM', isCommonArea: false, commonAreaLocation: '',
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.description.trim()) return setError('Title and description are required.');
        setError('');
        try {
            await raiseComplaint(form).unwrap();
            onClose();
        } catch (err) {
            setError(err?.data?.message ?? 'Failed to raise complaint.');
        }
    };

    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-slate-800 text-lg">Raise a Complaint</h3>
                    <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100"><X className="h-5 w-5" /></button>
                </div>
                {error && <p className="mb-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Title *</label>
                        <input value={form.title} onChange={set('title')} maxLength={150}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            placeholder="Brief description of the issue" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Description *</label>
                        <textarea value={form.description} onChange={set('description')} rows={3}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                            placeholder="Detailed description..." />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Category *</label>
                            <select value={form.category} onChange={set('category')}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                                {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Priority</label>
                            <select value={form.priority} onChange={set('priority')}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                                {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <input type="checkbox" id="commonArea" checked={form.isCommonArea}
                            onChange={e => setForm(f => ({ ...f, isCommonArea: e.target.checked }))}
                            className="h-4 w-4 rounded accent-indigo-600" />
                        <label htmlFor="commonArea" className="text-sm text-slate-600">This is a common area issue</label>
                    </div>
                    {form.isCommonArea && (
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Location</label>
                            <input value={form.commonAreaLocation} onChange={set('commonAreaLocation')}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                placeholder="e.g. Building entrance, Lift lobby..." />
                        </div>
                    )}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                        <button type="submit" disabled={isLoading}
                            className="flex-1 rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-2">
                            {isLoading && <RefreshCw className="h-4 w-4 animate-spin" />} Submit Complaint
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ResidentComplaintsPage() {
    const { data, isLoading, isError, refetch } = useGetMyComplaintsQuery();
    const [showModal, setShowModal] = useState(false);

    const complaints = data?.data ?? [];

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">My Complaints</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Track and manage your maintenance requests</p>
                </div>
                <button onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition">
                    <Plus className="h-4 w-4" /> Raise Complaint
                </button>
            </div>

            {isError && (
                <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-600 ring-1 ring-red-200">
                    <AlertCircle className="h-5 w-5 shrink-0" /> Failed to load complaints. <button onClick={refetch} className="underline ml-1">Retry</button>
                </div>
            )}

            {isLoading ? (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-200" />)}
                </div>
            ) : complaints.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
                        <MessageSquareWarning className="h-8 w-8 text-indigo-400" />
                    </div>
                    <p className="font-semibold text-slate-700">No complaints yet</p>
                    <p className="text-sm text-slate-400 mt-1">Raise a complaint if you have a maintenance issue.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {complaints.map(c => (
                        <div key={c._id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:shadow-md">
                            <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-slate-900 truncate">{c.title}</p>
                                    <p className="text-xs text-slate-400 mt-0.5 font-mono">{c.complaintNumber}</p>
                                </div>
                                <StatusBadge status={c.status} />
                            </div>
                            <p className="text-sm text-slate-500 line-clamp-2 mb-3">{c.description}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-medium text-slate-500 bg-slate-100 rounded-full px-2.5 py-0.5">{c.category}</span>
                                <span className={`text-xs font-semibold rounded-full px-2.5 py-0.5 ${PRIORITY_STYLES[c.priority] ?? ''}`}>{c.priority}</span>
                                <span className="text-xs text-slate-400 ml-auto">{new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </div>
                            {c.resolutionNotes && (
                                <div className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                                    <span className="font-semibold">Resolution: </span>{c.resolutionNotes}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {showModal && <RaiseComplaintModal onClose={() => { setShowModal(false); refetch(); }} />}
        </div>
    );
}
