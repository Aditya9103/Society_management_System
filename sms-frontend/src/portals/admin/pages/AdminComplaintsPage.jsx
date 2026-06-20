/**
 * AdminComplaintsPage.jsx — Society-wide complaint management for admin.
 */
import React, { useState } from 'react';
import { useGetAllComplaintsQuery, useAssignComplaintMutation, useCloseComplaintMutation } from '../../../store/api/societyAdminApi';
import { useListStaffQuery } from '../../../store/api/societyAdminApi';
import { MessageSquareWarning, AlertCircle, RefreshCw, ChevronDown, X, CheckCheck } from 'lucide-react';

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
    LOW: 'bg-slate-100 text-slate-500',
    MEDIUM: 'bg-yellow-100 text-yellow-700',
    HIGH: 'bg-orange-100 text-orange-700',
    URGENT: 'bg-red-100 text-red-700',
};

// ── Close/Resolve Modal ───────────────────────────────────────────────────────
function CloseModal({ complaint, onClose }) {
    const [closeComplaint, { isLoading }] = useCloseComplaintMutation();
    const [notes, setNotes] = useState('');
    const handleClose = async () => {
        await closeComplaint({ id: complaint._id, resolutionNotes: notes }).unwrap();
        onClose();
    };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800">Resolve Complaint</h3>
                    <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100"><X className="h-5 w-5" /></button>
                </div>
                <p className="text-sm text-slate-600 mb-4">"{complaint.title}"</p>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none mb-4"
                    placeholder="Resolution notes (optional)..." />
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600">Cancel</button>
                    <button onClick={handleClose} disabled={isLoading}
                        className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
                        {isLoading && <RefreshCw className="h-4 w-4 animate-spin" />}<CheckCheck className="h-4 w-4" /> Mark Resolved
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Complaint row ─────────────────────────────────────────────────────────────
function ComplaintRow({ complaint, staff }) {
    const [assignComplaint, { isLoading: assigning }] = useAssignComplaintMutation();
    const [closeModal, setCloseModal] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState('');
    const s = STATUS_STYLES[complaint.status] ?? STATUS_STYLES.OPEN;

    const handleAssign = async () => {
        if (!selectedStaff) return;
        await assignComplaint({ id: complaint._id, assignedTo: selectedStaff }).unwrap();
        setSelectedStaff('');
    };

    const canClose = !['RESOLVED', 'CLOSED', 'REJECTED'].includes(complaint.status);

    return (
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{complaint.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">{complaint.complaintNumber}</p>
                </div>
                <span className={`text-xs font-semibold rounded-full px-2.5 py-0.5 shrink-0 ${s.cls}`}>{s.label}</span>
            </div>
            <p className="text-sm text-slate-500 line-clamp-1 mb-3">{complaint.description}</p>
            <div className="flex items-center gap-2 flex-wrap mb-3">
                <span className="text-xs font-medium text-slate-500 bg-slate-100 rounded-full px-2.5 py-0.5">{complaint.category}</span>
                <span className={`text-xs font-semibold rounded-full px-2.5 py-0.5 ${PRIORITY_STYLES[complaint.priority] ?? ''}`}>{complaint.priority}</span>
                <span className="text-xs text-slate-400 ml-auto">{new Date(complaint.createdAt).toLocaleDateString('en-IN')}</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
                {canClose && staff.length > 0 && (
                    <div className="flex items-center gap-2 flex-1">
                        <select value={selectedStaff} onChange={e => setSelectedStaff(e.target.value)}
                            className="flex-1 min-w-0 rounded-lg border border-slate-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400">
                            <option value="">Assign to staff…</option>
                            {staff.filter(m => ['FACILITY_MANAGER', 'HELP_DESK', 'COMMITTEE_MEMBER'].includes(m.role)).map(m => (
                                <option key={m._id} value={m._id}>{m.firstName} {m.lastName} ({m.role.replace('_', ' ')})</option>
                            ))}
                        </select>
                        <button onClick={handleAssign} disabled={!selectedStaff || assigning}
                            className="shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 flex items-center gap-1">
                            {assigning ? <RefreshCw className="h-3 w-3 animate-spin" /> : null} Assign
                        </button>
                    </div>
                )}
                {canClose && (
                    <button onClick={() => setCloseModal(true)} className="shrink-0 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100">
                        Resolve
                    </button>
                )}
            </div>
            {closeModal && <CloseModal complaint={complaint} onClose={() => setCloseModal(false)} />}
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminComplaintsPage() {
    const [statusFilter, setStatusFilter] = useState('');
    const { data, isLoading, isError, refetch } = useGetAllComplaintsQuery({ status: statusFilter || undefined });
    const { data: staffData } = useListStaffQuery();
    const complaints = data?.data ?? [];
    const staff = staffData?.data ?? [];

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Complaint Management</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Review, assign, and resolve all society complaints</p>
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                    <option value="">All Statuses</option>
                    {Object.keys(STATUS_STYLES).map(s => <option key={s} value={s}>{STATUS_STYLES[s].label}</option>)}
                </select>
            </div>

            {isError && (
                <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-600 ring-1 ring-red-200">
                    <AlertCircle className="h-5 w-5 shrink-0" /> Failed to load complaints. <button onClick={refetch} className="underline ml-1">Retry</button>
                </div>
            )}

            {isLoading ? (
                <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200" />)}</div>
            ) : complaints.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
                        <MessageSquareWarning className="h-8 w-8 text-indigo-400" />
                    </div>
                    <p className="font-semibold text-slate-700">No complaints found</p>
                </div>
            ) : (
                <div className="space-y-3">{complaints.map(c => <ComplaintRow key={c._id} complaint={c} staff={staff} />)}</div>
            )}
        </div>
    );
}
