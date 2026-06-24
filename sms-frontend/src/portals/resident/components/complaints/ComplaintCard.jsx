import React, { useState } from 'react';
import StatusBadge from '../../../../components/ui/StatusBadge';
import { PRIORITY_STYLES } from './constants';
import Card from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { useChangeComplaintStatusMutation } from '../../../../store/api/residentApi';
import Modal from '../../../../components/ui/Modal';
import { Textarea } from '../../../../components/ui/Textarea';

export function ComplaintCard({ complaint }) {
    const c = complaint;
    const [changeStatus, { isLoading }] = useChangeComplaintStatusMutation();
    const [actionModal, setActionModal] = useState({ open: false, type: null }); // type: 'respond', 'reopen'
    const [notes, setNotes] = useState('');

    const handleQuickAction = async (status) => {
        try {
            await changeStatus({ id: c._id, status }).unwrap();
        } catch (e) {
            alert('Failed to update complaint status');
        }
    };

    const handleModalSubmit = async (e) => {
        e.preventDefault();
        try {
            const status = actionModal.type === 'respond' ? 'IN_PROGRESS' : 'REOPENED';
            await changeStatus({ id: c._id, status, notes }).unwrap();
            setActionModal({ open: false, type: null });
            setNotes('');
        } catch (e) {
            alert('Failed to update complaint');
        }
    };

    return (
        <>
            <Card className="hover:shadow-md transition">
                <Card.Body className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 truncate">{c.title}</p>
                            <p className="text-xs text-slate-400 mt-0.5 font-mono">{c.complaintNumber}</p>
                        </div>
                        <StatusBadge status={c.status} />
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-3">{c.description}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 rounded-full px-2.5 py-0.5">
                            {c.category} {c.subcategory && `› ${c.subcategory}`}
                        </span>
                        <span className={`text-xs font-semibold rounded-full px-2.5 py-0.5 ${PRIORITY_STYLES[c.priority] ?? ''}`}>{c.priority}</span>
                        <span className="text-xs text-slate-400 ml-auto">{new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    {c.latestNote && c.status !== 'RESOLVED' && c.status !== 'CLOSED' && (
                        <div className="mt-3 rounded-lg bg-indigo-50 px-3 py-2 text-xs text-indigo-700">
                            <span className="font-semibold">Latest Update: </span>{c.latestNote}
                        </div>
                    )}
                    {c.resolutionNotes && (
                        <div className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                            <span className="font-semibold">Resolution: </span>{c.resolutionNotes}
                        </div>
                    )}

                    {/* Actions */}
                    {(c.status === 'DRAFT' || c.status === 'RESOLVED' || c.status === 'PENDING_RESIDENT') && (
                        <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2 justify-end">
                            {c.status === 'DRAFT' && (
                                <Button size="sm" onClick={() => handleQuickAction('OPEN')} isLoading={isLoading}>
                                    Submit Complaint
                                </Button>
                            )}
                            {c.status === 'PENDING_RESIDENT' && (
                                <Button size="sm" onClick={() => setActionModal({ open: true, type: 'respond' })}>
                                    Respond to Handler
                                </Button>
                            )}
                            {c.status === 'RESOLVED' && (
                                <>
                                    <Button size="sm" variant="secondary" onClick={() => setActionModal({ open: true, type: 'reopen' })}>
                                        Reject & Reopen
                                    </Button>
                                    <Button size="sm" onClick={() => handleQuickAction('CLOSED')} isLoading={isLoading}>
                                        Confirm & Close
                                    </Button>
                                </>
                            )}
                        </div>
                    )}
                </Card.Body>
            </Card>

            <Modal 
                isOpen={actionModal.open} 
                onClose={() => setActionModal({ open: false, type: null })} 
                title={actionModal.type === 'respond' ? 'Respond to Handler' : 'Reject Resolution & Reopen'}
            >
                <form onSubmit={handleModalSubmit} className="space-y-4">
                    <Textarea 
                        label="Notes *" 
                        value={notes} 
                        onChange={e => setNotes(e.target.value)} 
                        rows={4}
                        placeholder={actionModal.type === 'respond' ? "Provide requested information..." : "Why is the resolution not satisfactory?"} 
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
