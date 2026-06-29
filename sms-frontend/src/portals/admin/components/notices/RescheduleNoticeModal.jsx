import React, { useState } from 'react';
import { useUpdateNoticeScheduleMutation } from '../../../../store/api/societyAdminApi';
import Modal from '../../../../components/ui/Modal';
import { Input } from '../../../../components/ui/Input';
import DatePicker from '../../../../components/ui/DatePicker';
import { Button } from '../../../../components/ui/Button';
import Alert from '../../../../components/ui/Alert';

export default function RescheduleNoticeModal({ notice, onClose }) {
    const [updateSchedule, { isLoading }] = useUpdateNoticeScheduleMutation();
    const [scheduledAt, setScheduledAt] = useState(
        notice?.scheduledAt ? new Date(notice.scheduledAt) : null
    );
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e, clear = false) => {
        if (e) e.preventDefault();
        setError('');
        
        try {
            await updateSchedule({ 
                id: notice._id, 
                scheduledAt: clear ? null : (scheduledAt ? scheduledAt.toISOString() : null)
            }).unwrap();
            
            setSuccess(clear ? 'Schedule removed. Notice is now a draft.' : 'Notice schedule updated successfully!');
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err) {
            setError(err?.data?.message ?? 'Failed to update schedule.');
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Reschedule Notice">
            {error && <Alert type="error" className="mb-4">{error}</Alert>}
            {success && <Alert type="success" className="mb-4 bg-emerald-50 text-emerald-800 border-emerald-200">{success}</Alert>}
            
            <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
                <div className="mb-4">
                    <p className="text-sm text-slate-500 mb-2">
                        Updating schedule for: <span className="font-medium text-slate-800">{notice.title}</span>
                    </p>
                </div>

                <DatePicker 
                    label="New Scheduled Time *" 
                    selected={scheduledAt} 
                    onChange={(date) => setScheduledAt(date)}
                    minDate={new Date()}
                    required
                />
                
                <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <Button type="button" variant="secondary" onClick={onClose} className="w-1/4">
                        Cancel
                    </Button>
                    <Button type="button" variant="secondary" onClick={(e) => handleSubmit(e, true)} isLoading={isLoading} className="w-1/3 text-amber-600 hover:text-amber-700">
                        Clear Schedule
                    </Button>
                    <Button type="submit" isLoading={isLoading} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white">
                        Update Schedule
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
