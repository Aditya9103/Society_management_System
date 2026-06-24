import React, { useState } from 'react';
import { useChangeComplaintStatusAdminMutation } from '../../../../store/api/societyAdminApi';
import Modal from '../../../../components/ui/Modal';
import { Textarea } from '../../../../components/ui/Textarea';
import { Button } from '../../../../components/ui/Button';

export default function CloseModal({ complaint, onClose }) {
    const [changeStatus, { isLoading }] = useChangeComplaintStatusAdminMutation();
    const [notes, setNotes] = useState('');
    
    const handleClose = async () => {
        await changeStatus({ id: complaint._id, status: 'RESOLVED', notes }).unwrap();
        onClose();
    };
    
    return (
        <Modal isOpen={true} onClose={onClose} title="Resolve Complaint">
            <p className="text-sm text-slate-600 mb-4">"{complaint.title}"</p>
            <Textarea 
                value={notes} 
                onChange={e => setNotes(e.target.value)} 
                rows={3}
                placeholder="Resolution notes (optional)..." 
                className="mb-4"
            />
            <div className="flex gap-3">
                <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
                <Button onClick={handleClose} isLoading={isLoading} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                    Mark Resolved
                </Button>
            </div>
        </Modal>
    );
}
