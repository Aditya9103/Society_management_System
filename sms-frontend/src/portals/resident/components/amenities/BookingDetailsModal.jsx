import React from 'react';
import { Clock, Calendar, Users, Star } from 'lucide-react';
import { DarkModal, DarkButton } from '../profile/DarkUI';

export function BookingDetailsModal({ booking, onClose, onCancel, onRate }) {
    if (!booking) return null;

    const amenity = booking.amenityId;
    const canCancel = ['CONFIRMED', 'PENDING_APPROVAL'].includes(booking.status);
    const canRate = booking.status === 'COMPLETED' && (!booking.feedback || !booking.feedback.rating);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'CONFIRMED': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
            case 'PENDING_APPROVAL': return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
            case 'COMPLETED': return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
            case 'CANCELLED': return 'text-red-400 border-red-500/30 bg-red-500/10';
            default: return 'text-slate-400 border-slate-500/30 bg-slate-500/10';
        }
    };

    return (
        <DarkModal isOpen={true} onClose={() => onClose()} title="Booking Details">
            <div className="space-y-6">
                
                {/* Header info */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                        <h3 className="text-lg font-bold text-white">{amenity?.name}</h3>
                        <p className="text-xs text-slate-500 font-mono mt-1">ID: #{booking._id}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusStyle(booking.status)}`}>
                        {booking.status.replace('_', ' ')}
                    </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#151822] p-4 rounded-xl border border-slate-800/50">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Date</p>
                        <p className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-purple-400" />
                            {new Date(booking.bookingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                    </div>
                    
                    <div className="bg-[#151822] p-4 rounded-xl border border-slate-800/50">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Time</p>
                        <p className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-400" />
                            {booking.startTime} - {booking.endTime}
                        </p>
                    </div>

                    {booking.expectedGuests > 0 && (
                        <div className="bg-[#151822] p-4 rounded-xl border border-slate-800/50">
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Guests</p>
                            <p className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                                <Users className="w-4 h-4 text-emerald-400" />
                                {booking.expectedGuests} People
                            </p>
                        </div>
                    )}

                    {booking.purpose && (
                        <div className="col-span-2 bg-[#151822] p-4 rounded-xl border border-slate-800/50">
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Purpose</p>
                            <p className="text-sm text-slate-300">{booking.purpose}</p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                    <DarkButton type="button" variant="secondary" onClick={() => onClose()}>Close</DarkButton>
                    
                    {canCancel && (
                        <DarkButton type="button" onClick={() => { onClose(); onCancel(booking); }} className="bg-red-600 hover:bg-red-700 text-white border-none">
                            Cancel Booking
                        </DarkButton>
                    )}

                    {canRate && (
                        <DarkButton type="button" onClick={() => { onClose(); onRate(booking); }} className="bg-amber-500 hover:bg-amber-600 text-white border-none">
                            <Star className="w-4 h-4 mr-2" /> Rate Experience
                        </DarkButton>
                    )}
                </div>
            </div>
        </DarkModal>
    );
}
