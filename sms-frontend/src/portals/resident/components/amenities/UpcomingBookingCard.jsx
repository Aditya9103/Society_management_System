import React from 'react';
import { Clock } from 'lucide-react';
import { DEFAULT_AMENITY_IMAGES } from '../../../../components/ui/AmenityCard';

export function UpcomingBookingCard({ booking, onViewDetails }) {
    if (!booking) return null;

    const amenity = booking.amenityId;
    
    // Formatting Date
    const bookingDate = new Date(booking.bookingDate);
    const day = bookingDate.getDate();
    const month = bookingDate.toLocaleString('en-IN', { month: 'short' }).toUpperCase();
    
    // Status color
    const getStatusStyle = (status) => {
        switch (status) {
            case 'CONFIRMED': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
            case 'PENDING_APPROVAL': return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
            default: return 'text-slate-300 font-bold border-slate-500/30 bg-slate-500/10';
        }
    };

    const getBgImage = (amenity) => {
        if (amenity?.image) return amenity.image;
        if (amenity?.facilityType) return DEFAULT_AMENITY_IMAGES[amenity.facilityType] || DEFAULT_AMENITY_IMAGES.OTHER;
        return DEFAULT_AMENITY_IMAGES.OTHER;
    };

    return (
        <div className="bg-[#151822] border border-slate-800 rounded-3xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                
                {/* Date Badge */}
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex flex-col items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
                    <span className="text-white text-xl font-black leading-none">{day}</span>
                    <span className="text-indigo-200 text-[10px] font-bold tracking-widest mt-1">{month}</span>
                </div>
                
                {/* Amenity Image */}
                <div className="w-24 h-16 rounded-xl bg-slate-800 overflow-hidden hidden md:block shrink-0 border border-slate-700">
                    <img 
                        src={getBgImage(amenity)} 
                        alt={amenity?.name || "Amenity"} 
                        className="w-full h-full object-cover" 
                    />
                </div>
                
                {/* Details */}
                <div>
                    <h3 className="text-white font-bold text-lg mb-1">{amenity?.name || 'Amenity'}</h3>
                    <div className="flex items-center gap-2 text-white font-bold text-xs mb-2">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{booking.startTime} - {booking.endTime}</span>
                    </div>
                    <p className="text-slate-500 text-[11px] font-mono">Booking ID: #{booking._id.substring(0,8)}</p>
                </div>
            </div>

            <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest border uppercase ${getStatusStyle(booking.status)}`}>
                    {booking.status}
                </span>
                
                <button 
                    onClick={() => onViewDetails(booking)}
                    className="w-full md:w-auto bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-colors shadow-lg shadow-purple-900/20"
                >
                    View Details
                </button>
            </div>
        </div>
    );
}
