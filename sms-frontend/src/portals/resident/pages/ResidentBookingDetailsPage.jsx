import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useListBookingsQuery } from '../../../store/api/facilityApi';
import { ArrowLeft, MapPin, CalendarClock, Users, XCircle, Star, Download } from 'lucide-react';
import { cn } from '../../../components/ui/Button';
import { DEFAULT_AMENITY_IMAGES } from '../../../components/ui/AmenityCard';

// Modals for actions
import { CancelConfirmModal } from '../components/amenities/CancelConfirmModal';
import { RatingModal } from '../components/amenities/RatingModal';

export default function ResidentBookingDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Fetch bookings to find the current one
    const { data, isLoading } = useListBookingsQuery({ page: 1, limit: 100 });
    const bookings = data?.data?.bookings ?? data?.data?.docs ?? [];
    const booking = bookings.find(b => b._id === id);

    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [rateModalOpen, setRateModalOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="max-w-[1000px] mx-auto p-6 flex flex-col gap-6">
                <div className="h-20 bg-[#1a1c29]/50 border border-slate-700/50 rounded-2xl animate-pulse" />
                <div className="h-96 bg-[#1a1c29]/50 border border-slate-700/50 rounded-2xl animate-pulse" />
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="max-w-[1000px] mx-auto p-6 text-center pt-20">
                <h1 className="text-2xl font-bold text-white mb-2">Booking Not Found</h1>
                <p className="hidden text-slate-400 mb-6">The booking you are looking for does not exist or you don't have access.</p>
                <button 
                    onClick={() => navigate('/resident/amenities/bookings')}
                    className="bg-[#6338f0] text-white px-6 py-2 rounded-xl"
                >
                    Back to Bookings
                </button>
            </div>
        );
    }

    const STATUS_COLORS = {
        PENDING: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        PENDING_APPROVAL: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        CONFIRMED: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        COMPLETED: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        CANCELLED: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
        REJECTED: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
    };

    const isPending = booking.status === 'PENDING' || booking.status === 'PENDING_APPROVAL';
    const statusColor = STATUS_COLORS[isPending ? 'PENDING' : booking.status] || STATUS_COLORS.PENDING;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
        });
    };

    const getBgImage = (amenity) => {
        if (amenity?.image) return amenity.image;
        if (amenity?.facilityType) return DEFAULT_AMENITY_IMAGES[amenity.facilityType] || DEFAULT_AMENITY_IMAGES.OTHER;
        return DEFAULT_AMENITY_IMAGES.OTHER;
    };

    const canCancel = ['PENDING', 'PENDING_APPROVAL', 'CONFIRMED'].includes(booking.status);
    const canRate = booking.status === 'COMPLETED' && !booking.rating;

    return (
        <div className="max-w-[1000px] mx-auto space-y-6 pb-20">
            {/* Header Navigation */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-full bg-[#1e2030] border border-slate-700/50 flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#25283a] transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Booking Details</h1>
                        <p className="hidden text-slate-400 text-sm">BKG-{booking._id?.slice(-8).toUpperCase()}</p>
                    </div>
                    <span className={cn("px-4 py-1.5 text-xs font-bold rounded-md border", statusColor)}>
                        {(isPending ? 'PENDING' : booking.status).replace('_', ' ')}
                    </span>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-[#1a1c29]/80 backdrop-blur-xl border-x-0 border-y sm:border border-slate-700/50 -mx-4 sm:mx-0 rounded-none sm:rounded-3xl overflow-hidden shadow-lg relative">
                {/* Hero Image */}
                <div className="h-56 sm:h-80 relative w-full overflow-hidden">
                    <img 
                        src={getBgImage(booking.amenityId)} 
                        alt="Amenity" 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1c29] via-[#1a1c29]/40 to-transparent" />
                    
                    <div className="absolute bottom-6 left-6 right-6">
                        <div className="flex items-end gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-3xl shadow-xl shrink-0">
                                🏛️
                            </div>
                            <div className="flex-1 pb-1">
                                <h2 className="text-3xl font-bold text-white mb-1 drop-shadow-md">{booking.amenityId?.name || 'Amenity'}</h2>
                                <p className="text-slate-300 flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4 text-[#8560ff]" />
                                    {booking.amenityId?.location || 'Location not specified'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 sm:p-8 space-y-8">
                    {/* Schedule & Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-[#1e2030] rounded-2xl p-5 border border-slate-700/50 flex flex-col justify-center space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#6338f0]/10 flex items-center justify-center text-[#8560ff] shrink-0">
                                    <CalendarClock className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-400 mb-0.5">Date</p>
                                    <p className="text-sm font-semibold text-white">{formatDate(booking.bookingDate)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#6338f0]/10 flex items-center justify-center text-[#8560ff] shrink-0">
                                    <CalendarClock className="w-5 h-5 opacity-0" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-400 mb-0.5">Time Slot</p>
                                    <p className="text-sm font-semibold text-white">{booking.startTime} - {booking.endTime}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-[#1e2030] rounded-2xl p-5 border border-slate-700/50 flex flex-col justify-center space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-400 mb-0.5">Guests</p>
                                    <p className="text-sm font-semibold text-white">{booking.numberOfGuests || 1} Person(s)</p>
                                </div>
                            </div>
                            {booking.purpose && (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                                        <span className="font-bold text-lg">P</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-400 mb-0.5">Purpose</p>
                                        <p className="text-sm font-semibold text-white">{booking.purpose}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-[#1e2030] rounded-2xl p-6 border border-slate-700/50">
                        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                            Payment Details
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                            <div className="min-w-0">
                                <p className="text-xs text-slate-500 mb-1">Total Amount</p>
                                <p className="text-sm font-bold text-white truncate">₹{booking.totalAmount || 0}</p>
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-slate-500 mb-1">Payment Status</p>
                                <span className={cn(
                                    "px-1.5 py-0.5 text-[10px] sm:text-xs font-semibold rounded-md border inline-block",
                                    booking.paymentStatus === 'PAID' 
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                        : booking.paymentStatus === 'NOT_REQUIRED'
                                            ? "bg-slate-500/10 text-slate-400 border-slate-500/20"
                                            : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                )}>
                                    {(booking.paymentStatus || 'PENDING').replace('_', ' ')}
                                </span>
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-slate-500 mb-1 truncate">Payment Method</p>
                                <p className="text-sm font-medium text-slate-300 truncate">Online</p>
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-slate-500 mb-1 truncate">Transaction ID</p>
                                <p className="text-xs font-medium text-slate-300 truncate">{booking.paymentId || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 mt-16 sm:mt-0 border-t border-slate-700/50 bg-[#1e2030] sm:bg-[#1e2030]/50 flex flex-col sm:flex-row sm:flex-wrap justify-end gap-3 fixed sm:relative bottom-0 left-0 right-0 z-40 pb-safe">
                    <button className="flex justify-center items-center gap-1.5 px-5 py-3.5 sm:py-2.5 bg-transparent text-slate-300 hover:text-white hover:bg-[#25283a] border border-slate-700/50 rounded-xl text-sm font-semibold transition">
                        <Download className="w-4 h-4" /> Download Receipt
                    </button>
                    {canCancel && (
                        <button 
                            onClick={() => setCancelModalOpen(true)}
                            className="flex justify-center items-center gap-1.5 px-5 py-3.5 sm:py-2.5 bg-transparent text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 rounded-xl text-sm font-semibold transition"
                        >
                            <XCircle className="w-4 h-4" /> Cancel Booking
                        </button>
                    )}
                    {canRate && (
                        <button 
                            onClick={() => setRateModalOpen(true)}
                            className="flex justify-center items-center gap-1.5 px-5 py-3.5 sm:py-2.5 bg-[#6338f0] text-white hover:bg-[#5229db] shadow-lg shadow-[#6338f0]/25 rounded-xl text-sm font-semibold transition"
                        >
                            <Star className="w-4 h-4" /> Rate Experience
                        </button>
                    )}
                </div>
            </div>

            {/* Modals */}
            {cancelModalOpen && (
                <CancelConfirmModal 
                    booking={booking} 
                    onClose={() => setCancelModalOpen(false)}
                />
            )}
            
            {rateModalOpen && (
                <RatingModal 
                    booking={booking} 
                    onClose={() => setRateModalOpen(false)}
                />
            )}
        </div>
    );
}
