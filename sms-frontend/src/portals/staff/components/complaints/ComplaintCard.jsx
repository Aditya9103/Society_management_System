import React, { useState } from 'react';
import Card from '../../../../components/ui/Card';
import StatusBadge from '../../../../components/ui/StatusBadge';
import { Button } from '../../../../components/ui/Button';
import { useStaffChangeComplaintStatusMutation } from '../../../../store/api/staffApi';
import Modal from '../../../../components/ui/Modal';
import { Textarea } from '../../../../components/ui/Textarea';
import { useSelector } from 'react-redux';

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
    REOPENED: 'WARNING',
};

const PRIORITY_MAP = {
    LOW: 'NEUTRAL',
    MEDIUM: 'WARNING',
    HIGH: 'WARNING',
    URGENT: 'ERROR',
};

export default function ComplaintCard({ complaint }) {
    const { user } = useSelector(s => s.auth);
    const role = user?.role;
    const c = complaint;
    const statusType = STATUS_MAP[c.status] || 'NEUTRAL';
    const priorityType = PRIORITY_MAP[c.priority] || 'NEUTRAL';

    const [changeStatus, { isLoading }] = useStaffChangeComplaintStatusMutation();
    const [actionModal, setActionModal] = useState({ open: false, type: null }); // 'resolve', 'reject', 'request_info'
    const [notes, setNotes] = useState('');

    const canAssign = ['SOCIETY_ADMIN', 'FACILITY_MANAGER'].includes(role);

    const handleQuickAction = async (status) => {
        try {
            const data = { id: c._id, status };
            if (status === 'ASSIGNED') {
                data.assignedTo = user._id || user.id; // Corrected to use _id
            }
            await changeStatus(data).unwrap();
        } catch (e) {
            alert('Failed to update status');
        }
    };

    const handleModalSubmit = async (e) => {
        e.preventDefault();
        try {
            let status;
            if (actionModal.type === 'resolve') status = 'RESOLVED';
            if (actionModal.type === 'reject') status = 'REJECTED';
            if (actionModal.type === 'request_info') status = 'PENDING_RESIDENT';

            await changeStatus({ id: c._id, status, notes }).unwrap();
            setActionModal({ open: false, type: null });
            setNotes('');
        } catch (e) {
            alert('Failed to update complaint');
        }
    };

    return (
        <>
            <Card>
                <Card.Body>
                    <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 truncate">{c.title}</p>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">{c.complaintNumber}</p>
                        </div>
                        <StatusBadge status={c.status} type={statusType} />
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-3">{c.description}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge status={c.category} type="NEUTRAL" />
                        {c.subcategory && <span className="text-xs text-slate-500">› {c.subcategory}</span>}
                        <StatusBadge status={c.priority} type={priorityType} />
                        <span className="text-xs text-slate-400 ml-auto">
                            {new Date(c.createdAt).toLocaleDateString('en-IN')}
                        </span>
                    </div>
                    {c.latestNote && (
                        <div className="mt-3 rounded-lg bg-indigo-50 px-3 py-2 text-xs text-indigo-700">
                            <span className="font-semibold">Latest Update: </span>{c.latestNote}
                        </div>
                    )}

                    {/* Staff Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2 justify-end">
                        {(c.status === 'OPEN' || c.status === 'REOPENED') && canAssign && (
                            <Button size="sm" onClick={() => handleQuickAction('ASSIGNED')} isLoading={isLoading}>
                                Mark Assigned (Self)
                            </Button>
                        )}
                        {c.status === 'ASSIGNED' && (
                            <Button size="sm" onClick={() => handleQuickAction('IN_PROGRESS')} isLoading={isLoading}>
                                Start Work
                            </Button>
                        )}
                        {c.status === 'IN_PROGRESS' && (
                            <>
                                <Button size="sm" variant="secondary" onClick={() => setActionModal({ open: true, type: 'request_info' })}>
                                    Request Info
                                </Button>
                                <Button size="sm" onClick={() => setActionModal({ open: true, type: 'resolve' })}>
                                    Mark Resolved
                                </Button>
                            </>
                        )}
                        {(c.status === 'OPEN' || c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS') && canAssign && (
                            <Button size="sm" variant="secondary" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setActionModal({ open: true, type: 'reject' })}>
                                Reject
                            </Button>
                        )}
                    </div>
                </Card.Body>
            </Card>

            <Modal 
                isOpen={actionModal.open} 
                onClose={() => setActionModal({ open: false, type: null })} 
                title={actionModal.type === 'resolve' ? 'Resolve Complaint' : actionModal.type === 'reject' ? 'Reject Complaint' : 'Request Info from Resident'}
            >
                <form onSubmit={handleModalSubmit} className="space-y-4">
                    <Textarea 
                        label="Notes *" 
                        value={notes} 
                        onChange={e => setNotes(e.target.value)} 
                        rows={4}
                        placeholder="Provide details..." 
                        required
                    />
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="secondary" onClick={() => setActionModal({ open: false, type: null })}>Cancel</Button>
                        <Button type="submit" isLoading={isLoading}>Submit</Button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
