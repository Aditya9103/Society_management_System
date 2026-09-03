import React from 'react';
import { Users, Clock, Edit2, Trash2, CalendarClock, MapPin } from 'lucide-react';
import { cn } from './Button';

// Default images based on facility type
export const DEFAULT_AMENITY_IMAGES = {
    CLUBHOUSE: '/clubhouse.png',
    SWIMMING_POOL: '/swimmingpool.png',
    GYM: '/gym.png',
    TENNIS_COURT: '/tennis_court.png',
    BADMINTON_COURT: '/badminton_court.png',
    PARTY_HALL: '/party_hall.png',
    KIDS_PLAY_AREA: '/kids_play_area.png',
    CRICKET_NET: '/cricket.png',
    TERRACE: '/terrace.png',
    LIBRARY: '/library.png',
    MEDITATION_ROOM: '/meditation_room.png',
    CONFERENCE_ROOM: '/conference_room.png',
    BBQ_AREA: '/others.png',
    YOGA_STUDIO: '/yoga_studio.png',
    OTHER: '/others.png'
};

const FACILITY_ICONS = {
    CLUBHOUSE: '🏛️',
    SWIMMING_POOL: '🏊',
    GYM: '💪',
    TENNIS_COURT: '🎾',
    BADMINTON_COURT: '🏸',
    CRICKET_NET: '🏏',
    PARTY_HALL: '🎉',
    TERRACE: '🌇',
    LIBRARY: '📚',
    KIDS_PLAY_AREA: '🎠',
    MEDITATION_ROOM: '🧘',
    CONFERENCE_ROOM: '💼',
    BBQ_AREA: '🍖',
    OTHER: '🏢',
};

export default function AmenityCard({ 
    amenity, 
    onEdit, 
    onDelete, 
    onViewBookings,
    onBookNow,
    isAdmin = false 
}) {
    const {
        _id,
        name,
        facilityType,
        customAmenityType,
        image,
        location,
        capacity,
        isActive
    } = amenity;

    const displayType = customAmenityType || facilityType.replace(/_/g, ' ');
    const bgImage = image || DEFAULT_AMENITY_IMAGES[facilityType] || DEFAULT_AMENITY_IMAGES.OTHER;
    const icon = FACILITY_ICONS[facilityType] || '🏢';

    return (
        <div className="bg-[#1a1c29]/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-lg group relative">
            {/* Image Banner */}
            <div className="relative h-40 w-full overflow-hidden">
                <img 
                    src={bgImage} 
                    alt={name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1c29] via-[#1a1c29]/60 to-transparent" />
                
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                    <span className={cn(
                        "px-2.5 py-1 text-xs font-semibold rounded-full border backdrop-blur-md",
                        isActive 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                            : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                    )}>
                        {isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 relative">
                {/* Icon & Title Container */}
                <div className="flex items-center gap-3 -mt-6 relative z-10 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl flex items-center justify-center text-2xl shrink-0">
                        {icon}
                    </div>
                    <div className="min-w-0 flex-1 pt-6">
                        <h3 className="text-lg font-bold text-white leading-tight truncate" title={name}>{name}</h3>
                        <span className="inline-block px-2 py-0.5 mt-1 text-[11px] font-medium bg-[#6338f0]/20 text-[#8560ff] rounded-md capitalize truncate max-w-full">
                            {displayType.toLowerCase()}
                        </span>
                    </div>
                </div>

                {/* Details */}
                <div className="flex items-center gap-6 mb-5 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-500" />
                        <span>{location || 'Location not set'}</span>
                    </div>
                    {capacity && (
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-slate-500" />
                            <span>{capacity} People</span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {isAdmin ? (
                        <>
                            <button 
                                onClick={() => onViewBookings(amenity)}
                                className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold text-white bg-[#6338f0] hover:bg-[#5229db] rounded-xl shadow-lg shadow-[#6338f0]/25 transition-all"
                            >
                                <CalendarClock className="w-4 h-4" /> View Bookings
                            </button>
                            <button 
                                onClick={() => onEdit(amenity)}
                                className="px-4 py-2 flex items-center justify-center gap-2 text-sm font-semibold text-[#6338f0] bg-[#6338f0]/10 hover:bg-[#6338f0]/20 border border-[#6338f0]/20 rounded-xl transition-all"
                            >
                                <Edit2 className="w-4 h-4" /> Edit
                            </button>
                            <button 
                                onClick={() => onDelete(amenity)}
                                className="px-3 py-2 flex items-center justify-center text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </>
                    ) : (
                        <button 
                            onClick={() => onBookNow(amenity)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-[#6338f0] hover:bg-[#5229db] shadow-lg shadow-[#6338f0]/25 rounded-xl transition-all"
                        >
                            <CalendarClock className="w-4 h-4" /> Book Now
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
