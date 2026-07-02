import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useChangeComplaintStatusAdminMutation, useDeleteComplaintAdminMutation } from '../../../../store/api/societyAdminApi';
import Card from '../../../../components/ui/Card';
import StatusBadge from '../../../../components/ui/StatusBadge';
import { Button } from '../../../../components/ui/Button';
import CloseModal from './CloseModal';
import Select from '../../../../components/ui/Select';

const STATUS_MAP = {
    DRAFT: 'NEUTRAL',
    OPEN: 'WARNING',
    ASSIGNED: 'INFO',
    IN_PROGRESS: 'INFO',
    PENDING_RESIDENT: 'WARNING',
    RESOLVED: 'SUCCESS',
    CLOSED: 'NEUTRAL',
    ESCALATED: 'ERROR',
    REJECTED: 'ERROR',
    REOPENED: 'WARNING'
};

const PRIORITY_MAP = {
    LOW: 'NEUTRAL',
    MEDIUM: 'WARNING',
    HIGH: 'WARNING',
    URGENT: 'ERROR',
};

export default function ComplaintRow({ complaint, staff }) {
    const [changeStatus, { isLoading: assigning }] = useChangeComplaintStatusAdminMutation();
    const [deleteComplaint, { isLoading: deleting }] = useDeleteComplaintAdminMutation();
    const [closeModal, setCloseModal] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState('');

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to completely delete this closed complaint? This cannot be undone.')) {
            await deleteComplaint(complaint._id).unwrap();
        }
    };

    const handleAssign = async () => {
        if (!selectedStaff) return;
        await changeStatus({ id: complaint._id, status: 'ASSIGNED', assignedTo: selectedStaff }).unwrap();
        setSelectedStaff('');
    };

    const canClose = !['RESOLVED', 'CLOSED', 'REJECTED'].includes(complaint.status);
    const statusType = STATUS_MAP[complaint.status] || 'NEUTRAL';
    const priorityType = PRIORITY_MAP[complaint.priority] || 'NEUTRAL';

    return (
        <Card>
            <Card.Body>
                <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                        <p className="text-base font-bold text-slate-800 truncate">{complaint.title}</p>
                        <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">{complaint.complaintNumber}</p>
                    </div>
                    <StatusBadge status={complaint.status} type={statusType} />
                </div>
                <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">{complaint.description}</p>
                <div className="flex items-center gap-2 flex-wrap mb-4">
                    <StatusBadge status={complaint.category === 'OTHER' ? complaint.customCategory || 'OTHER' : complaint.category} type="NEUTRAL" />
                    <StatusBadge status={complaint.priority} type={priorityType} />
                    <span className="text-xs font-medium text-slate-400 ml-auto bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">{new Date(complaint.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                {complaint.latestNote && (
                    <div className="mb-4 rounded-xl bg-indigo-50/80 border border-indigo-100/50 px-4 py-3 text-sm text-indigo-800 shadow-sm">
                        <span className="font-bold mr-1">Latest Update:</span><span className="font-medium text-indigo-700">{complaint.latestNote}</span>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 border-t border-slate-100/60 mt-2">
                    {canClose && staff.length > 0 && (
                        <div className="flex items-center gap-2 flex-1">
                            <select
                                value={selectedStaff}
                                onChange={e => setSelectedStaff(e.target.value)}
                                className="flex-1 min-w-0 h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 font-medium shadow-sm transition-all focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white hover:border-slate-300"
                            >
                                <option value="">Assign to staff…</option>
                                {staff.filter(m => ['FACILITY_MANAGER', 'HELP_DESK', 'COMMITTEE_MEMBER'].includes(m.role)).map(m => (
                                    <option key={m._id} value={m._id}>{m.firstName} {m.lastName} ({m.role.replace('_', ' ')})</option>
                                ))}
                            </select>
                            <Button
                                onClick={handleAssign}
                                disabled={!selectedStaff || assigning}
                                isLoading={assigning}
                                size="sm"
                                className="h-10 px-5 shrink-0"
                            >
                                Assign
                            </Button>
                        </div>
                    )}
                    {canClose && (
                        <Button
                            variant="secondary"
                            onClick={() => setCloseModal(true)}
                            size="sm"
                            className="h-10 px-5 shrink-0 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 focus-visible:ring-emerald-500 shadow-sm"
                        >
                            Resolve
                        </Button>
                    )}
                    {complaint.status === 'CLOSED' && (
                        <Button
                            onClick={handleDelete}
                            isLoading={deleting}
                            disabled={deleting}
                            variant="danger"
                            size="sm"
                            className="h-10 px-5 shrink-0"
                        >
                            Delete
                        </Button>
                    )}
                </div>
                {closeModal && <CloseModal complaint={complaint} onClose={() => setCloseModal(false)} />}
            </Card.Body>
        </Card>
    );
}
