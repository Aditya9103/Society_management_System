/**
 * RejectResidentModal.jsx — Modal requiring a rejection reason before confirming.
 * Uses global Textarea, Modal, Alert from src/components/ui/.
 */
import React, { useState } from 'react';
import { useRejectResidentMutation } from '../../../store/api/societyAdminApi';
import { Button } from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Alert from '../../../components/ui/Alert';
import FormField from '../../../components/ui/FormField';
import { Textarea } from '../../../components/ui/Textarea';

export default function RejectResidentModal({ isOpen, onClose, residentUserId, residentName, onSuccess }) {
    const [rejectResident, { isLoading }] = useRejectResidentMutation();
    const [reason, setReason] = useState('');
    const [errorMsg, setErrorMsg] = useState(null);

    const handleConfirm = async () => {
        if (!reason.trim()) return;
        setErrorMsg(null);
        try {
            await rejectResident({ id: residentUserId, reason }).unwrap();
            setReason('');
            onClose();
            onSuccess?.(`${residentName}'s registration has been rejected and they have been notified.`);
        } catch (err) {
            setErrorMsg(err?.data?.message ?? 'Failed to reject. Please try again.');
        }
    };

    const handleClose = () => { setReason(''); setErrorMsg(null); onClose(); };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Reject Resident Registration"
            description={`Rejecting ${residentName ?? 'this resident'}. Please provide a reason — it will be emailed to them.`}
        >
            <div className="space-y-4">
                {errorMsg && <Alert type="error">{errorMsg}</Alert>}

                <FormField
                    label="Reason for Rejection"
                    required
                    hint={`${reason.length}/500 characters`}
                >
                    <Textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={4}
                        placeholder="e.g. Incomplete documentation. Could not verify ownership claim…"
                        className="focus:ring-red-400/30"
                    />
                </FormField>

                <Alert type="info">
                    The resident will receive an email with this reason and can re-register if the issue is resolved.
                </Alert>

                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                    <Button type="button" variant="secondary" onClick={handleClose}>Cancel</Button>
                    <Button
                        type="button"
                        variant="danger"
                        isLoading={isLoading}
                        disabled={!reason.trim() || reason.length > 500}
                        onClick={handleConfirm}
                    >
                        {isLoading ? 'Rejecting…' : 'Confirm Rejection'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
