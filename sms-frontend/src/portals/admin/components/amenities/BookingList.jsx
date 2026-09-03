import React, { useState } from 'react';
import { 
    CalendarClock, Clock, User, Users, CheckCircle2, XCircle, ChevronLeft, ChevronRight, 
    Calendar as CalendarIcon, Filter, Search, MoreVertical, X, Phone, Mail, MapPin, AlertCircle, PlayCircle
} from 'lucide-react';
import { 
    useListBookingsQuery, 
    useApproveBookingMutation, 
    useRejectBookingMutation, 
    useCancelBookingMutation, 
    useMarkCompletedMutation, 
    useMarkNoShowMutation 
} from '../../../../store/api/facilityApi';
import { toast } from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import { cn } from '../../../../components/ui/Button';
import { DEFAULT_AMENITY_IMAGES } from '../../../../components/ui/AmenityCard';

const STATUS_COLORS = {
    PENDING: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    CONFIRMED: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    CANCELLED: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    REJECTED: 'bg-red-500/10 text-red-500 border-red-500/20',
    COMPLETED: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    NO_SHOW: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

export default function BookingList() {
    const [filterStatus, setFilterStatus] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const limit = 10;

    const { data, isLoading, refetch } = useListBookingsQuery({ 
        status: filterStatus || undefined, 
        date: filterDate || undefined,
        page,
        limit
    });
    
    const [approve] = useApproveBookingMutation();
    const [reject] = useRejectBookingMutation();
    const [cancel] = useCancelBookingMutation();
    const [complete] = useMarkCompletedMutation();
    const [noShow] = useMarkNoShowMutation();

    const [selectedBooking, setSelectedBooking] = useState(null);
    const [rejectId, setRejectId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    const bookings = data?.data?.bookings || [];
    const total = data?.pagination?.total || 0;
    const totalPages = data?.pagination?.totalPages || 1;

    // Local filter for search query
    const filteredBookings = bookings.filter(b => {
        if (!searchQuery) return true;
        const residentName = `${b.residentId?.userId?.firstName || ''} ${b.residentId?.userId?.lastName || ''}`.toLowerCase();
        const amenityName = b.amenityId?.name?.toLowerCase() || '';
        const q = searchQuery.toLowerCase();
        return residentName.includes(q) || amenityName.includes(q) || b._id.includes(q);
    });

    const act = async (fn, arg, successMsg) => {
        try {
            await fn(arg).unwrap();
            toast.success(successMsg);
            if (selectedBooking?._id === arg || selectedBooking?._id === arg?.id) {
                // Keep selected but update state via refetch
            }
            refetch();
        } catch (e) {
            toast.error(e?.data?.message ?? 'Action failed');
        }
    };

    const handleReject = async () => {
        if (!rejectReason) return toast.error('Reason required');
        await act(reject, { id: rejectId, reason: rejectReason }, 'Booking rejected');
        setRejectId(null);
        setRejectReason('');
    };

    const formatDate = (dateStr) => {
        try { return format(parseISO(dateStr), 'd MMM yyyy'); }
        catch { return dateStr; }
    };

    const getBgImage = (amenity) => {
        if (amenity?.image) return amenity.image;
        return DEFAULT_AMENITY_IMAGES[amenity?.facilityType] || DEFAULT_AMENITY_IMAGES.OTHER;
    };

    return (
        <>
            <div className="flex flex-col gap-4 h-[calc(100vh-8.5rem)] w-full px-4 lg:px-6">
            {/* Top Filter Bar */}
            <div className="flex flex-wrap items-center gap-4 bg-[#1a1c29]/50 border border-slate-700/50 rounded-2xl p-2.5">
                <div className="relative min-w-[200px]">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full bg-[#1e2030] border border-slate-700/50 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-200 focus:border-[#6338f0] focus:outline-none"
                    >
                        <option value="">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
                <div className="relative min-w-[200px]">
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="w-full bg-[#1e2030] border border-slate-700/50 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-200 focus:border-[#6338f0] focus:outline-none css-date-icon-fix"
                    />
                </div>
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by resident, amenity or booking ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#1e2030] border border-slate-700/50 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-200 focus:border-[#6338f0] focus:outline-none"
                    />
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
                {/* Left Panel: List */}
                <div className="w-full lg:w-[400px] xl:w-[450px] flex flex-col shrink-0">
                    <div className="pb-3 mb-3 border-b border-slate-700/50 flex items-center justify-between">
                        <h3 className="font-bold text-white text-sm">All Bookings ({total})</h3>
                        <MoreVertical className="w-4 h-4 text-slate-400 cursor-pointer" />
                    </div>

                {/* List Container */}
                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                    {isLoading ? (
                        [...Array(5)].map((_, i) => (
                            <div key={i} className="h-28 animate-pulse bg-slate-800/50 rounded-xl border border-slate-700/50" />
                        ))
                    ) : filteredBookings.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-500">
                            <CalendarClock className="w-8 h-8 mb-2 opacity-50" />
                            <p className="text-sm">No bookings found</p>
                        </div>
                    ) : (
                        filteredBookings.map(booking => {
                            const isSelected = selectedBooking?._id === booking._id;
                            const residentName = booking.residentId?.userId 
                                ? `${booking.residentId.userId.firstName} ${booking.residentId.userId.lastName}`
                                : 'Unknown Resident';
                            
                            return (
                                <div 
                                    key={booking._id} 
                                    onClick={() => setSelectedBooking(booking)}
                                    className={cn(
                                        "p-4 rounded-xl border cursor-pointer transition-all hover:border-[#6338f0]/50",
                                        isSelected 
                                            ? "bg-[#6338f0]/10 border-[#6338f0]" 
                                            : "bg-[#1a1c29]/50 border-slate-700/50"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
                                                <img 
                                                    src={getBgImage(booking.amenityId)} 
                                                    alt="Amenity" 
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-white text-sm leading-tight">
                                                    {booking.amenityId?.name || 'Unknown Amenity'}
                                                </h4>
                                                <p className="text-xs text-slate-400 mt-0.5">RES-{booking.residentId?.userId?._id?.slice(-6) || 'XXXX'}</p>
                                            </div>
                                        </div>
                                        <span className={cn(
                                            "px-2 py-0.5 text-[10px] font-semibold rounded-md border",
                                            STATUS_COLORS[booking.status]
                                        )}>
                                            {booking.status}
                                        </span>
                                    </div>
                                    <div className="space-y-1.5 mt-3">
                                        <div className="flex items-center gap-2 text-xs text-slate-300">
                                            <CalendarIcon className="w-3.5 h-3.5 text-slate-500" />
                                            <span>{formatDate(booking.bookingDate)} • {booking.startTime} - {booking.endTime}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-300">
                                            <User className="w-3.5 h-3.5 text-slate-500" />
                                            <span>{residentName}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="pt-3 mt-3 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-400">
                        <button 
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="p-1 hover:text-white disabled:opacity-50"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-1">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className={cn(
                                        "w-6 h-6 rounded flex items-center justify-center transition-colors",
                                        page === i + 1 ? "bg-[#6338f0] text-white" : "hover:bg-slate-700"
                                    )}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button 
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="p-1 hover:text-white disabled:opacity-50"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>

            {/* Right Panel: Detail View */}
            <div className="flex-1 flex flex-col min-w-0">
                {!selectedBooking ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-[#1a1c29]/30 rounded-[20px] border border-slate-700/30">
                        <CalendarClock className="w-16 h-16 mb-4 opacity-20" />
                        <h3 className="text-xl font-bold text-slate-300">No Booking Selected</h3>
                        <p className="text-sm mt-1">Select a booking from the list to view details</p>
                    </div>
                ) : (
                    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar pr-2">
                        {/* Header */}
                        <div className="pb-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 bg-[#0f111a]/95 backdrop-blur z-10 border-b border-slate-700/50">
                            <div>
                                <h2 className="text-lg font-bold text-white">Booking Details</h2>
                                <p className="text-xs text-slate-400 mt-1">View and manage booking information</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                {selectedBooking.status === 'PENDING' ? (
                                    <button
                                        onClick={() => act(approve, { id: selectedBooking._id }, 'Approved')}
                                        className="px-4 py-1.5 text-xs font-bold rounded-md border cursor-pointer bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 transition-all flex items-center gap-1.5"
                                        title="Click to Approve Booking"
                                    >
                                        <CheckCircle2 className="w-4 h-4" /> Approve
                                    </button>
                                ) : (
                                    <span className={cn(
                                        "px-3 py-1 text-xs font-bold rounded-md border",
                                        STATUS_COLORS[selectedBooking.status]
                                    )}>
                                        {selectedBooking.status}
                                    </span>
                                )}
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-400">Booking ID</p>
                                    <p className="text-xs font-mono font-medium text-slate-200">
                                        BKG-{selectedBooking._id?.slice(-8).toUpperCase() || 'XXXX'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="space-y-6 flex-1">
                            
                            {/* Amenity Hero Card */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                <div className="relative rounded-2xl overflow-hidden h-48 xl:h-auto xl:aspect-[2/1] shadow-lg group">
                                    <img 
                                        src={getBgImage(selectedBooking.amenityId)} 
                                        alt="Amenity" 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f111a] via-[#0f111a]/40 to-transparent" />
                                    
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                                                <span className="text-2xl">🏛️</span>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white shadow-sm">{selectedBooking.amenityId?.name}</h3>
                                                <p className="text-sm text-slate-300 flex items-center gap-1">
                                                    <MapPin className="w-3.5 h-3.5" /> {selectedBooking.amenityId?.location || 'Location Not Set'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-[#1e2030] rounded-2xl p-5 border border-slate-700/50 flex flex-col justify-center space-y-4 shadow-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[#6338f0]/10 flex items-center justify-center text-[#6338f0]">
                                            <CalendarIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-slate-400">Date</p>
                                            <p className="text-sm font-semibold text-white">{formatDate(selectedBooking.bookingDate)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                                            <Clock className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-slate-400">Time Slot</p>
                                            <p className="text-sm font-semibold text-white">{selectedBooking.startTime} - {selectedBooking.endTime}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                            <Users className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-slate-400">Expected Guests</p>
                                            <p className="text-sm font-semibold text-white">{selectedBooking.expectedGuests || 1} People</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Info Blocks Grid */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                
                                {/* Resident Info */}
                                <div className="bg-[#1e2030] border border-slate-700/50 rounded-2xl p-5 shadow-lg">
                                    <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                                        <User className="w-4 h-4 text-slate-400" /> Resident Information
                                    </h4>
                                    <div className="flex items-start gap-4">
                                        <img 
                                            src={selectedBooking.residentId?.userId?.profilePicture || `https://ui-avatars.com/api/?name=${selectedBooking.residentId?.userId?.firstName}+${selectedBooking.residentId?.userId?.lastName}&background=6338f0&color=fff`} 
                                            alt="Resident" 
                                            className="w-14 h-14 rounded-full border-2 border-slate-700 object-cover shrink-0"
                                        />
                                        <div className="space-y-2 flex-1">
                                            <div>
                                                <p className="font-bold text-white text-base leading-tight">
                                                    {selectedBooking.residentId?.userId?.firstName} {selectedBooking.residentId?.userId?.lastName}
                                                </p>
                                                <p className="text-xs text-emerald-400 font-medium">RES-{selectedBooking.residentId?.userId?._id?.slice(-6) || 'XXXX'}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs text-slate-300 flex items-center gap-2">
                                                    <Phone className="w-3.5 h-3.5 text-slate-500" /> 
                                                    {selectedBooking.residentId?.userId?.phone || 'N/A'}
                                                </p>
                                                <p className="text-xs text-slate-300 flex items-center gap-2">
                                                    <MapPin className="w-3.5 h-3.5 text-slate-500" /> 
                                                    Tower {selectedBooking.residentId?.tower || '-'}, Flat {selectedBooking.residentId?.flatNumber || '-'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Booking Summary */}
                                <div className="bg-[#1e2030] border border-slate-700/50 rounded-2xl p-5 shadow-lg">
                                    <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-slate-400" /> Booking Summary
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-400">Booking ID</span>
                                            <span className="font-semibold text-white">BKG-{selectedBooking._id.slice(-8).toUpperCase()}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-400">Booked On</span>
                                            <span className="font-medium text-slate-200">{formatDate(selectedBooking.createdAt)}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-400">Purpose</span>
                                            <span className="font-medium text-slate-200">{selectedBooking.purpose || 'Not specified'}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-400">Booking For</span>
                                            <span className="font-medium text-slate-200">Self</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Information */}
                                <div className="bg-[#1e2030] border border-slate-700/50 rounded-2xl p-5 shadow-lg xl:col-span-2">
                                    <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                                        <PlayCircle className="w-4 h-4 text-slate-400" /> Payment Information
                                    </h4>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="min-w-0">
                                            <p className="text-xs text-slate-500 mb-1 truncate">Amount</p>
                                            <p className="text-sm font-bold text-white truncate">₹{selectedBooking.totalAmount || 0}</p>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs text-slate-500 mb-1">Payment Status</p>
                                            <span className={cn(
                                                "px-1.5 py-0.5 text-[10px] sm:text-xs font-semibold rounded-md border inline-block",
                                                selectedBooking.paymentStatus === 'PAID' 
                                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                                    : selectedBooking.paymentStatus === 'NOT_REQUIRED'
                                                        ? "bg-slate-500/10 text-slate-400 border-slate-500/20"
                                                        : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                            )}>
                                                {(selectedBooking.paymentStatus || 'PENDING').replace('_', ' ')}
                                            </span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs text-slate-500 mb-1 truncate">Payment Method</p>
                                            <p className="text-sm font-medium text-slate-300 truncate">Online</p>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs text-slate-500 mb-1 truncate">Transaction ID</p>
                                            <p className="text-xs font-medium text-slate-300 truncate">{selectedBooking.paymentId || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Action Buttons Footer */}
                            <div className="pt-4 mt-6 border-t border-slate-700/50 flex flex-wrap gap-3 justify-end sticky bottom-0 bg-[#0f111a]/95 backdrop-blur z-10 pb-2">
                                {selectedBooking.status === 'PENDING' && (
                                    <>
                                        <button onClick={() => setRejectId(selectedBooking._id)} className="flex items-center gap-1.5 px-5 py-2.5 bg-transparent text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 rounded-xl text-sm font-semibold transition">
                                            <XCircle className="w-4 h-4" /> Reject Booking
                                        </button>
                                        <button onClick={() => act(approve, { id: selectedBooking._id }, 'Approved')} className="flex items-center gap-1.5 px-5 py-2.5 bg-[#6338f0] text-white hover:bg-[#5229db] shadow-lg shadow-[#6338f0]/25 rounded-xl text-sm font-semibold transition">
                                            <CheckCircle2 className="w-4 h-4" /> Approve Booking
                                        </button>
                                    </>
                                )}
                                {selectedBooking.status === 'CONFIRMED' && (
                                    <>
                                        <button onClick={() => act(cancel, { id: selectedBooking._id }, 'Cancelled')} className="flex items-center gap-1.5 px-5 py-2.5 bg-transparent text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 rounded-xl text-sm font-semibold transition">
                                            <XCircle className="w-4 h-4" /> Cancel Booking
                                        </button>
                                        <button onClick={() => act(complete, selectedBooking._id, 'Completed')} className="flex items-center gap-1.5 px-5 py-2.5 bg-transparent text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-sm font-semibold transition">
                                            <CheckCircle2 className="w-4 h-4" /> Mark Completed
                                        </button>
                                    </>
                                )}
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
        </div>
            {/* Reject Modal */}
            {rejectId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-[#1e2030] border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
                        <div className="flex items-center justify-between mb-2 text-white">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <XCircle className="w-5 h-5 text-red-500" /> Reject Booking
                            </h2>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-400">Rejection Reason</label>
                            <textarea 
                                value={rejectReason}
                                onChange={e => setRejectReason(e.target.value)}
                                className="w-full bg-[#1a1c29]/50 border border-slate-700/50 rounded-xl p-3 text-sm text-slate-200 focus:border-[#6338f0] focus:outline-none"
                                rows="3"
                                placeholder="Why are you rejecting this booking?"
                                autoFocus
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button onClick={() => { setRejectId(null); setRejectReason(''); }} className="flex-1 py-2 border border-slate-600 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800 transition">Cancel</button>
                            <button onClick={handleReject} className="flex-1 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition">Reject Booking</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
