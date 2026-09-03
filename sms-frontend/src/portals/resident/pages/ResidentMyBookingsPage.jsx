import React, { useState } from 'react';
import { useListBookingsQuery } from '../../../store/api/facilityApi';
import { CalendarClock, Search, ArrowLeft, ChevronRight, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../../components/ui/Button';
import { DEFAULT_AMENITY_IMAGES } from '../../../components/ui/AmenityCard';

export default function ResidentMyBookingsPage() {
    const navigate = useNavigate();
    const [filterStatus, setFilterStatus] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    
    // Fetch all bookings for the resident
    const { data, isLoading, isError } = useListBookingsQuery({ page: 1, limit: 100 });
    const bookings = data?.data?.bookings ?? data?.data?.docs ?? [];

    const filteredBookings = bookings.filter(b => {
        let match = true;
        if (filterStatus) {
            match = b.status === filterStatus;
        }
        if (match && searchQuery) {
            const search = searchQuery.toLowerCase();
            const amenityMatch = b.amenityId?.name?.toLowerCase().includes(search) || false;
            const idMatch = b._id.toLowerCase().includes(search);
            match = amenityMatch || idMatch;
        }
        return match;
    });

    const STATUS_COLORS = {
        PENDING: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        PENDING_APPROVAL: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        CONFIRMED: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        COMPLETED: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        CANCELLED: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
        REJECTED: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    const getBgImage = (amenity) => {
        if (amenity?.image) return amenity.image;
        if (amenity?.facilityType) return DEFAULT_AMENITY_IMAGES[amenity.facilityType] || DEFAULT_AMENITY_IMAGES.OTHER;
        return DEFAULT_AMENITY_IMAGES.OTHER;
    };

    return (
        <div className="max-w-[1000px] mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#1a1c29]/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-lg">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/resident/amenities')}
                        className="w-10 h-10 rounded-full bg-[#1e2030] border border-slate-700/50 flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#25283a] transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white">My Bookings</h1>
                        <p className="hidden text-slate-400 text-sm">View and manage your amenity reservations</p>
                    </div>
                </div>
                
                {/* Search & Filter */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search bookings..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#1e2030] border border-slate-700/50 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-200 focus:border-[#6338f0] focus:outline-none transition-colors"
                        />
                    </div>
                    <div className="relative min-w-[140px]">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full bg-[#1e2030] border border-slate-700/50 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-200 focus:border-[#6338f0] focus:outline-none transition-colors appearance-none"
                        >
                            <option value="">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-28 bg-[#1a1c29]/50 border border-slate-700/50 rounded-2xl animate-pulse" />
                    ))
                ) : filteredBookings.length === 0 ? (
                    <div className="bg-[#1a1c29]/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-12 text-center shadow-lg">
                        <CalendarClock className="w-16 h-16 text-slate-500 mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-bold text-white mb-2">No Bookings Found</h3>
                        <p className="text-slate-400">You don't have any bookings matching your current filters.</p>
                        <button 
                            onClick={() => navigate('/resident/amenities')}
                            className="mt-6 bg-[#6338f0] hover:bg-[#5229db] text-white px-6 py-2.5 rounded-xl font-semibold transition-colors shadow-lg shadow-[#6338f0]/25"
                        >
                            Book an Amenity
                        </button>
                    </div>
                ) : (
                    filteredBookings.map(booking => {
                        const isPending = booking.status === 'PENDING' || booking.status === 'PENDING_APPROVAL';
                        const statusColor = STATUS_COLORS[isPending ? 'PENDING' : booking.status] || STATUS_COLORS.PENDING;
                        
                        return (
                            <div 
                                key={booking._id} 
                                onClick={() => navigate(`/resident/amenities/bookings/${booking._id}`)}
                                className="group bg-[#1a1c29]/80 backdrop-blur-xl border border-slate-700/50 hover:border-[#6338f0]/50 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 transition-all cursor-pointer hover:shadow-lg hover:shadow-[#6338f0]/10"
                            >
                                {/* Thumbnail */}
                                <div className="w-full sm:w-32 h-24 rounded-xl overflow-hidden shrink-0 relative">
                                    <img 
                                        src={getBgImage(booking.amenityId)} 
                                        alt="Amenity" 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f111a]/80 to-transparent" />
                                </div>
                                
                                {/* Info */}
                                <div className="flex-1 min-w-0 w-full">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <h3 className="text-lg font-bold text-white truncate">{booking.amenityId?.name || 'Unknown Amenity'}</h3>
                                        <span className={cn("px-2.5 py-1 text-[10px] font-bold rounded-md border shrink-0", statusColor)}>
                                            {(isPending ? 'PENDING' : booking.status).replace('_', ' ')}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 font-mono mb-2">BKG-{booking._id?.slice(-8).toUpperCase()}</p>
                                    
                                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                                        <div className="flex items-center gap-1.5 text-slate-300">
                                            <CalendarClock className="w-4 h-4 text-[#8560ff]" />
                                            <span className="font-medium">{formatDate(booking.bookingDate)}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-300">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                            <span className="font-medium">{booking.startTime} - {booking.endTime}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="hidden sm:flex shrink-0 w-10 h-10 rounded-full bg-[#1e2030] border border-slate-700/50 items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-[#6338f0] group-hover:border-[#6338f0] transition-colors">
                                    <ChevronRight className="w-5 h-5" />
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
