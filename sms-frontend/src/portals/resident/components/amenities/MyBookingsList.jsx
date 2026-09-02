import React from 'react';
import { Clock } from 'lucide-react';

export function MyBookingsList({ bookings, onViewAll }) {
    
    // Status color
    const getStatusStyle = (status) => {
        switch (status) {
            case 'CONFIRMED': return 'text-emerald-400 bg-emerald-500/10';
            case 'PENDING_APPROVAL': return 'text-amber-400 bg-amber-500/10';
            case 'COMPLETED': return 'text-blue-400 bg-blue-500/10';
            default: return 'text-white font-bold bg-slate-500/10';
        }
    };

    return (
        <div className="bg-[#151822] border border-slate-800 rounded-3xl p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-bold">My Bookings</h3>
                <button onClick={onViewAll} className="text-purple-400 text-xs font-bold hover:text-purple-300">View All</button>
            </div>
            
            <div className="space-y-4">
                {bookings.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-4">No bookings found</p>
                ) : (
                    bookings.slice(0, 4).map(booking => {
                        const amenity = booking.amenityId;
                        const dateStr = new Date(booking.bookingDate).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                        
                        return (
                            <div key={booking._id} onClick={() => onViewAll(booking)} className="flex gap-4 p-3 rounded-2xl hover:bg-slate-800/50 transition-colors cursor-pointer border border-transparent hover:border-slate-800">
                                {/* Thumbnail */}
                                <div className="w-16 h-16 rounded-xl bg-slate-800 overflow-hidden shrink-0">
                                    <img 
                                        src={amenity?.facilityType === 'SWIMMING_POOL' ? 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=400' : 'https://images.unsplash.com/photo-1542314831-c6a4d14eff43?auto=format&fit=crop&q=80&w=400'} 
                                        alt="Amenity" 
                                        className="w-full h-full object-cover" 
                                    />
                                </div>
                                
                                <div className="flex-1 flex flex-col justify-center">
                                    <h4 className="text-slate-200 font-bold text-sm mb-1">{amenity?.name || 'Amenity'}</h4>
                                    <p className="text-slate-500 text-[10px] mb-1.5 flex items-center gap-1"><Clock className="w-3 h-3"/> {dateStr} • {booking.startTime}</p>
                                    <span className={`w-fit px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase ${getStatusStyle(booking.status)}`}>
                                        {booking.status}
                                    </span>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    );
}
