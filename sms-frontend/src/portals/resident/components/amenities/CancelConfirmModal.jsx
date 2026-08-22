import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { XCircle } from 'lucide-react';
import { useCancelBookingMutation } from '../../../../store/api/facilityApi';
import { DarkModal, DarkButton, DarkInput } from '../profile/DarkUI';

export function CancelConfirmModal({ booking, onClose }) {
    const [reason, setReason] = useState('');
    const [cancelBooking, { isLoading }] = useCancelBookingMutation();

    const handleCancel = async (e) => {
        e.preventDefault();
        try {
            await cancelBooking({ id: booking._id, reason }).unwrap();
            toast.success('Booking cancelled successfully.');
            onClose(true);
        } catch (e) {
            toast.error(e?.data?.message ?? 'Failed to cancel booking.');
        }
    };

    return (
        <DarkModal isOpen={true} onClose={() => onClose(false)} title="Cancel Booking?">
            <form onSubmit={handleCancel} className="space-y-4">
                <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-start gap-3 text-red-400">
                    <XCircle className="w-5 h-5 mt-0.5 shrink-0" />
                    <p className="text-sm">
                        Are you sure you want to cancel your booking for <strong>{booking.amenityId?.name}</strong> on {new Date(booking.bookingDate).toLocaleDateString()}?
                    </p>
                </div>
                
                <DarkInput 
                    label="Reason (Optional)" 
                    value={reason} 
                    onChange={e => setReason(e.target.value)} 
                    placeholder="Tell us why..." 
                />

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/80 mt-6">
                    <DarkButton type="button" variant="secondary" onClick={() => onClose(false)}>Keep Booking</DarkButton>
                    <DarkButton type="submit" className="bg-red-600 hover:bg-red-700 text-white shadow-red-900/20" isLoading={isLoading}>
                        Confirm Cancel
                    </DarkButton>
                </div>
            </form>
        </DarkModal>
    );
}
