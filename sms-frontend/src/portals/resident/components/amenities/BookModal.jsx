import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { 
    X, Calendar as CalendarIcon, Clock, Wallet, Users, 
    CheckCircle2, MapPin, Info, ChevronLeft, ChevronRight,
    Wind, Volume2, ArrowLeft
} from 'lucide-react';
import { useGetAvailabilityQuery, useCreateBookingMutation } from '../../../../store/api/facilityApi';
import { useNavigate } from 'react-router-dom';

const DEFAULT_AMENITY_IMAGES = {
    'CLUBHOUSE': 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
    'SWIMMING_POOL': 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&q=80',
    'GYM': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
    'TENNIS_COURT': 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&q=80',
    'BADMINTON_COURT': 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&q=80',
    'PARTY_HALL': 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80',
    'LIBRARY': 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&q=80',
    'MEDITATION_ROOM': 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&q=80',
    'DEFAULT': 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80'
};

const getAmenityImage = (amenity) => {
    if (amenity?.image) return amenity.image;
    return DEFAULT_AMENITY_IMAGES[amenity?.facilityType] || DEFAULT_AMENITY_IMAGES['DEFAULT'];
};

const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        dates.push(d);
    }
    return dates;
};

const DATES = generateDates();
const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function BookModal({ amenities = [], initialAmenityId, onClose }) {
    const navigate = useNavigate();
    
    const [activeId, setActiveId] = useState(initialAmenityId || amenities[0]?._id);
    const [selectedDateObj, setSelectedDateObj] = useState(DATES[0]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [purpose, setPurpose] = useState('');
    const [guests, setGuests] = useState(0);

    const activeAmenity = amenities.find(a => a._id === activeId) || amenities[0];
    const activeDateStr = selectedDateObj.toISOString().slice(0, 10);

    useEffect(() => {
        setSelectedSlot(null);
    }, [activeId, activeDateStr]);

    const { data: availData, isLoading: availLoading } = useGetAvailabilityQuery(
        { amenityId: activeId, date: activeDateStr },
        { skip: !activeId || !activeDateStr }
    );
    const [createBooking, { isLoading: creating }] = useCreateBookingMutation();

    const slots = availData?.data?.slots ?? [];
    const availMsg = availData?.data?.reason;
    const hasConfiguredSlots = Object.values(activeAmenity?.availableSlots || {}).some(arr => arr.length > 0);

    const getCost = () => {
        if (!activeAmenity?.isPaid) return 'Free';
        if (!selectedSlot && hasConfiguredSlots) return 'Select slot';
        
        let hours = 2; 
        if (selectedSlot) {
            const [sh, sm] = selectedSlot.startTime.split(':').map(Number);
            const [eh, em] = selectedSlot.endTime.split(':').map(Number);
            hours = (eh + em/60) - (sh + sm/60);
            if (hours < 0) hours += 24;
        }
        
        return `₹${Math.ceil(hours * activeAmenity.hourlyRate).toLocaleString()}`;
    };

    const handleBook = async () => {
        if (!selectedSlot && hasConfiguredSlots) { 
            return toast.error('Please select a time slot.'); 
        }

        const start = hasConfiguredSlots ? selectedSlot?.startTime : '09:00';
        const end = hasConfiguredSlots ? selectedSlot?.endTime : '11:00';

        try {
            await createBooking({ 
                amenityId: activeId, 
                bookingDate: activeDateStr, 
                startTime: start, 
                endTime: end, 
                purpose: purpose || 'Resident Booking', 
                expectedGuests: Number(guests) 
            }).unwrap();
            
            toast.success('Booking requested successfully!');
            onClose(true);
        } catch (e) {
            toast.error(e?.data?.message ?? e?.message ?? 'Failed to create booking.');
        }
    };

    const calendarRef = useRef(null);
    const scrollLeft = () => calendarRef.current?.scrollBy({ left: -200, behavior: 'smooth' });
    const scrollRight = () => calendarRef.current?.scrollBy({ left: 200, behavior: 'smooth' });

    if (!activeAmenity) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center lg:p-6 bg-black/90 backdrop-blur-md">
            
            <div className="bg-[#10121a] w-full h-[100dvh] lg:h-[90vh] lg:max-w-[1200px] lg:rounded-[32px] flex flex-col lg:flex-row shadow-[0_0_80px_rgba(0,0,0,0.8)] lg:border border-slate-800/50 relative overflow-hidden">
                
                {/* Close Button (Desktop Only) */}
                <button 
                    onClick={() => onClose(false)} 
                    className="hidden lg:block absolute top-6 right-6 p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors z-30 border border-white/5"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* MOBILE NAV BAR */}
                <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-800/50 bg-[#10121a] shrink-0 z-30 relative">
                    <button onClick={() => onClose(false)} className="p-2 -ml-2 text-gray-400 hover:text-white">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h2 className="text-[13px] font-bold text-[#d4af37] tracking-widest uppercase absolute left-1/2 -translate-x-1/2">
                        Booking
                    </h2>
                </div>

                {/* MOBILE AMENITY SELECTOR (Horizontal scroll) */}
                <div className="lg:hidden border-b border-slate-800/50 bg-[#151722] shrink-0">
                    <div className="flex overflow-x-auto custom-scrollbar snap-x snap-mandatory">
                        {amenities.map(am => {
                            const isSelected = am._id === activeId;
                            return (
                                <button
                                    key={am._id}
                                    onClick={() => setActiveId(am._id)}
                                    className={`flex flex-col items-center justify-center gap-1.5 shrink-0 w-[25%] py-3 snap-start transition-all ${isSelected ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}
                                >
                                    <div className={`w-12 h-12 rounded-full overflow-hidden border-2 ${isSelected ? 'border-[#d4af37]' : 'border-transparent'}`}>
                                        <img src={getAmenityImage(am)} className="w-full h-full object-cover" alt="" />
                                    </div>
                                    <span className={`text-[10px] font-bold text-center leading-tight px-1 ${isSelected ? 'text-[#d4af37]' : 'text-gray-400'}`}>
                                        {am.name}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* LEFT SIDEBAR - DESKTOP ONLY */}
                <div className="hidden lg:flex w-[320px] bg-[#151722] border-r border-slate-800/50 flex-col shrink-0">
                    <div className="p-8 pb-6 border-b border-slate-800/50">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full border border-[#d4af37]/30 flex items-center justify-center bg-[#d4af37]/10">
                                <CalendarIcon className="w-5 h-5 text-[#d4af37]" />
                            </div>
                            <h2 className="text-[14px] font-bold text-[#d4af37] tracking-widest uppercase">
                                Resident Amenities
                            </h2>
                        </div>
                        <p className="text-gray-400 text-sm mt-3">
                            Book your favorite amenities and make the most of your community.
                        </p>
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-[11px] font-bold text-[#d4af37] tracking-widest uppercase mb-4 px-2">Choose Amenity</h3>
                        
                        <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2 flex-1 min-h-0">
                            {amenities.map(am => {
                                const isSelected = am._id === activeId;
                                return (
                                    <button
                                        key={am._id}
                                        onClick={() => setActiveId(am._id)}
                                        className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all border text-left group ${
                                            isSelected 
                                            ? 'bg-gradient-to-r from-[#d4af37]/10 to-transparent border-[#d4af37]/50' 
                                            : 'bg-transparent border-transparent hover:bg-white/5'
                                        }`}
                                    >
                                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden shrink-0 border ${
                                            isSelected ? 'border-[#d4af37]' : 'border-slate-800 group-hover:border-slate-700'
                                        }`}>
                                            <img src={getAmenityImage(am)} className="w-full h-full object-cover" alt="" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className={`font-bold text-sm truncate ${isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                                                {am.name}
                                            </h4>
                                            <p className={`text-[12px] truncate mt-0.5 ${isSelected ? 'text-[#d4af37]/80' : 'text-gray-500'}`}>
                                                {am.facilityType.replace(/_/g, ' ')}
                                            </p>
                                        </div>
                                        {isSelected && (
                                            <div className="w-6 h-6 rounded-full bg-[#d4af37] flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(212,175,55,0.3)]">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-auto p-6 border-t border-slate-800/50">
                        <button 
                            onClick={() => { onClose(false); navigate('/resident/amenities/bookings'); }}
                            className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-700/50 text-gray-300 hover:text-white hover:border-slate-600 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <CalendarIcon className="w-5 h-5 text-gray-400 group-hover:text-[#d4af37] transition-colors" />
                                <span className="text-sm font-bold tracking-wider">VIEW MY BOOKINGS</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* RIGHT PANEL - BOOKING DETAILS */}
                <div className="flex-1 flex flex-col relative z-20 min-w-0 overflow-hidden">
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-10 pb-[180px] lg:pb-32">
                        
                        {/* Header Banner */}
                        <div className="relative h-[200px] lg:h-[240px] rounded-2xl lg:rounded-3xl overflow-hidden mb-6 lg:mb-10 border border-slate-800/50">
                            <img src={getAmenityImage(activeAmenity)} className="absolute inset-0 w-full h-full object-cover" alt="" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#10121a] via-[#10121a]/60 to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-r from-[#10121a]/80 to-transparent" />
                            
                            <div className="absolute bottom-4 left-4 right-4 lg:bottom-6 lg:left-8 lg:right-8">
                                <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1 lg:mb-2">{activeAmenity.name}</h1>
                                <p className="text-gray-300 text-xs lg:text-sm max-w-xl line-clamp-2">{activeAmenity.description || 'A premium space for residents.'}</p>
                                
                                <div className="flex flex-wrap items-center gap-4 mt-3 lg:mt-5">
                                    <div className="flex items-center gap-1.5 text-[#d4af37] text-xs lg:text-sm font-bold">
                                        <Users className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> {activeAmenity.capacity ? `${activeAmenity.capacity} Capacity` : 'Any Capacity'}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-gray-400 text-xs lg:text-sm font-medium">
                                        <Wind className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> AC
                                    </div>
                                    <div className="flex items-center gap-1.5 text-gray-400 text-xs lg:text-sm font-medium">
                                        <Volume2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> Audio
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Booking Controls Area */}
                        <div className="flex flex-col gap-6 lg:gap-10">
                            
                            {/* Calendar Section */}
                            <div>
                                <h3 className="text-[11px] lg:text-[12px] font-bold text-[#d4af37] tracking-widest uppercase mb-4 lg:mb-5 px-1">Select Date</h3>
                                
                                <div className="bg-[#151722] border border-slate-800/50 rounded-2xl lg:rounded-3xl p-4 lg:p-6">
                                    <div className="flex items-center justify-between mb-4 lg:mb-6">
                                        <button onClick={scrollLeft} className="p-2 text-gray-400 hover:text-white"><ChevronLeft className="w-5 h-5"/></button>
                                        <div className="text-white font-bold tracking-wider text-sm lg:text-base">
                                            {MONTHS[selectedDateObj.getMonth()]} {selectedDateObj.getFullYear()}
                                        </div>
                                        <button onClick={scrollRight} className="p-2 text-gray-400 hover:text-white"><ChevronRight className="w-5 h-5"/></button>
                                    </div>

                                    {/* Horizontal Scrolling Calendar */}
                                    <div className="flex gap-2 lg:gap-3 overflow-x-auto custom-scrollbar pb-2 -mx-2 px-2" ref={calendarRef}>
                                        {DATES.map((d, i) => {
                                            const isSelected = d.toDateString() === selectedDateObj.toDateString();
                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() => setSelectedDateObj(d)}
                                                    className={`flex flex-col items-center justify-center min-w-[56px] lg:min-w-[64px] h-[70px] lg:h-[80px] rounded-[14px] lg:rounded-2xl transition-all border shrink-0 ${
                                                        isSelected 
                                                        ? 'bg-gradient-to-b from-[#d4af37]/20 to-[#d4af37]/5 border-[#d4af37]/50 shadow-[0_0_15px_rgba(212,175,55,0.15)]' 
                                                        : 'bg-transparent border-slate-800 hover:border-slate-600 hover:bg-white/5'
                                                    }`}
                                                >
                                                    <span className={`text-[9px] lg:text-[10px] font-bold mb-0.5 lg:mb-1 ${isSelected ? 'text-[#d4af37]' : 'text-gray-500'}`}>
                                                        {DAYS[d.getDay()]}
                                                    </span>
                                                    <span className={`text-lg lg:text-xl font-bold ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                                                        {d.getDate()}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Time Slots Section */}
                            <div>
                                <h3 className="text-[11px] lg:text-[12px] font-bold text-[#d4af37] tracking-widest uppercase mb-4 lg:mb-5 px-1 mt-2 lg:mt-0">Select Time Slot</h3>
                                
                                <div className="bg-[#151722] border border-slate-800/50 rounded-2xl lg:rounded-3xl p-4 lg:p-6 min-h-[160px] lg:min-h-[200px]">
                                    
                                    {availLoading ? (
                                        <div className="h-full flex items-center justify-center p-8">
                                            <div className="w-8 h-8 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    ) : availMsg ? (
                                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex gap-2 text-red-400 text-xs lg:text-sm">
                                            <Info className="w-4 h-4 lg:w-5 lg:h-5 shrink-0 mt-0.5" />
                                            <p>{availMsg}</p>
                                        </div>
                                    ) : !hasConfiguredSlots ? (
                                        <div className="text-gray-400 text-xs lg:text-sm text-center py-6 lg:py-10">
                                            This amenity does not have pre-configured slots. 
                                            <br/><br/>
                                            <span className="text-[10px] opacity-60">(Feature disabled for MVP demo, please use amenities with slots)</span>
                                        </div>
                                    ) : slots.length === 0 ? (
                                        <div className="text-gray-500 text-xs lg:text-sm text-center py-8 lg:py-10 border border-dashed border-slate-800 rounded-xl lg:rounded-2xl">
                                            No slots available on this day.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 lg:gap-3">
                                            {slots.map((s, i) => {
                                                const avail = s.available;
                                                const isSelected = selectedSlot?.startTime === s.startTime;
                                                
                                                const formatTime = (time24) => {
                                                    const [h, m] = time24.split(':');
                                                    const hNum = parseInt(h);
                                                    const ampm = hNum >= 12 ? 'PM' : 'AM';
                                                    const h12 = hNum % 12 || 12;
                                                    return `${h12.toString().padStart(2, '0')}:${m} ${ampm}`;
                                                };

                                                return (
                                                    <button
                                                        key={i}
                                                        disabled={!avail}
                                                        onClick={() => setSelectedSlot(s)}
                                                        className={`px-2 lg:px-3 py-2.5 lg:py-3 rounded-lg lg:rounded-xl text-[10px] lg:text-[11px] font-bold border transition-all truncate text-center ${
                                                            !avail 
                                                            ? 'bg-slate-900/50 border-slate-800/50 text-slate-600 cursor-not-allowed'
                                                            : isSelected
                                                                ? 'bg-[#d4af37] border-[#d4af37] text-black shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                                                                : 'bg-[#10121a] border-slate-800 text-gray-400 hover:text-white hover:border-[#d4af37]/50'
                                                        }`}
                                                    >
                                                        {formatTime(s.startTime)} - {formatTime(s.endTime)}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}

                                    <div className="mt-6 lg:mt-8 pt-4 lg:pt-6 border-t border-slate-800/50 flex gap-2.5 text-gray-500 text-[10px] lg:text-[11px] leading-relaxed">
                                        <Info className="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0 text-[#d4af37] mt-0.5 lg:mt-0" />
                                        You can cancel or modify your booking up to {activeAmenity.cancellationDeadlineHours} hours before the start time.
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Booking Summary Footer */}
                    <div className="absolute bottom-0 left-0 right-0 bg-[#151722]/95 backdrop-blur-xl border-t border-slate-800 p-4 lg:p-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 lg:gap-6 z-30 pb-safe">
                        
                        {/* Mobile Summary Row */}
                        <div className="flex md:hidden items-center justify-between px-2">
                            <div>
                                <span className="text-[9px] font-bold text-[#d4af37] tracking-widest uppercase block mb-1">Total Cost</span>
                                <div className="text-white font-bold text-lg">{getCost()}</div>
                            </div>
                            <div className="text-right">
                                <span className="text-[9px] font-bold text-[#d4af37] tracking-widest uppercase block mb-1">Time</span>
                                <div className="text-white font-bold text-sm">{selectedSlot ? `${selectedSlot.startTime} - ${selectedSlot.endTime}` : '-- : --'}</div>
                            </div>
                        </div>

                        {/* Desktop Summary Grid */}
                        <div className="hidden md:grid flex-1 w-full grid-cols-4 gap-4 divide-x divide-slate-800">
                            <div className="px-4 first:pl-0">
                                <span className="text-[10px] font-bold text-[#d4af37] tracking-widest uppercase block mb-1">Amenity</span>
                                <div className="flex items-center gap-2 text-white font-bold text-sm">
                                    <MapPin className="w-4 h-4 text-gray-500" />
                                    <span className="truncate">{activeAmenity.name}</span>
                                </div>
                            </div>
                            <div className="px-4">
                                <span className="text-[10px] font-bold text-[#d4af37] tracking-widest uppercase block mb-1">Date</span>
                                <div className="flex items-center gap-2 text-white font-bold text-sm">
                                    <CalendarIcon className="w-4 h-4 text-gray-500" />
                                    <span>{selectedDateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                </div>
                            </div>
                            <div className="px-4">
                                <span className="text-[10px] font-bold text-[#d4af37] tracking-widest uppercase block mb-1">Time</span>
                                <div className="flex items-center gap-2 text-white font-bold text-sm">
                                    <Clock className="w-4 h-4 text-gray-500" />
                                    <span>{selectedSlot ? `${selectedSlot.startTime} - ${selectedSlot.endTime}` : 'Not selected'}</span>
                                </div>
                            </div>
                            <div className="px-4">
                                <span className="text-[10px] font-bold text-[#d4af37] tracking-widest uppercase block mb-1">Cost</span>
                                <div className="flex items-center gap-2 text-white font-bold text-sm">
                                    <Wallet className="w-4 h-4 text-gray-500" />
                                    <span>{getCost()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 shrink-0 w-full md:w-auto mt-2 md:mt-0">
                            <button 
                                onClick={() => onClose(false)}
                                className="hidden md:block px-8 py-3.5 rounded-xl border border-slate-700 text-white font-bold text-[13px] hover:bg-white/5 transition-colors"
                            >
                                CANCEL
                            </button>
                            <button 
                                onClick={handleBook}
                                disabled={creating || (!selectedSlot && hasConfiguredSlots)}
                                className="flex-1 md:flex-none px-6 lg:px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f5d061] text-black font-bold text-[13px] lg:text-[13px] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                            >
                                {creating ? 'Processing...' : 'Confirm Booking'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
