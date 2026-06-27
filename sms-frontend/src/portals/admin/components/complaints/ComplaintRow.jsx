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
                        <p className="font-semibold text-slate-900 truncate">{complaint.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5 font-mono">{complaint.complaintNumber}</p>
                    </div>
                    <StatusBadge status={complaint.status} type={statusType} />
                </div>
                <p className="text-sm text-slate-500 line-clamp-1 mb-3">{complaint.description}</p>
                <div className="flex items-center gap-2 flex-wrap mb-3">
                    <StatusBadge status={complaint.category} type="NEUTRAL" />
                    <StatusBadge status={complaint.priority} type={priorityType} />
                    <span className="text-xs text-slate-400 ml-auto">{new Date(complaint.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
                {complaint.latestNote && (
                    <div className="mb-3 rounded-lg bg-indigo-50 px-3 py-2 text-xs text-indigo-700">
                        <span className="font-semibold">Latest Update: </span>{complaint.latestNote}
                    </div>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                    {canClose && staff.length > 0 && (
                        <div className="flex items-center gap-2 flex-1">
                            <select
                                value={selectedStaff}
                                onChange={e => setSelectedStaff(e.target.value)}
                                className="flex-1 min-w-0 rounded-lg border border-slate-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
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
                                className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-1.5"
                            >
                                Assign
                            </Button>
                        </div>
                    )}
                    {canClose && (
                        <button onClick={() => setCloseModal(true)} className="shrink-0 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100">
                            Resolve
                        </button>
                    )}
                    {complaint.status === 'CLOSED' && (
                        <Button
                            onClick={handleDelete}
                            isLoading={deleting}
                            disabled={deleting}
                            variant="danger"
                            className="shrink-0 text-xs py-1.5"
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
