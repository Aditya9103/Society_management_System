import React, { useState, useRef } from 'react';
import { useListAmenitiesQuery, useListBookingsQuery } from '../../../store/api/facilityApi';
import { Search, SlidersHorizontal, CalendarDays, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Sub components
import AmenityCard from '../../../components/ui/AmenityCard';
import { UpcomingBookingCard } from '../components/amenities/UpcomingBookingCard';
import { MyBookingsList } from '../components/amenities/MyBookingsList';
import { QuickInfoWidget } from '../components/amenities/QuickInfoWidget';
import { BottomInfoBanner } from '../components/amenities/BottomInfoBanner';
import { BookModal } from '../components/amenities/BookModal';
import { BookingDetailsModal } from '../components/amenities/BookingDetailsModal';
import { CancelConfirmModal } from '../components/amenities/CancelConfirmModal';
import { RatingModal } from '../components/amenities/RatingModal';
import { cn } from '../../../components/ui/Button';

export default function ResidentAmenitiesPage() {
    const { data: aData, isLoading: aLoading, refetch: refetchAmenities } = useListAmenitiesQuery({ isActive: true });
    const { data: bData, isLoading: bLoading, refetch: refetchBookings } = useListBookingsQuery({ page: 1, limit: 10 });

    const navigate = useNavigate();
    const [selectedAmenity, setSelectedAmenity] = useState(null);

    const [filter, setFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    const amenitiesSectionRef = useRef(null);
    const bookingsSectionRef = useRef(null);

    const amenities = aData?.data?.amenities ?? [];
    const bookings = bData?.data?.bookings ?? bData?.data?.docs ?? [];

    // Find next upcoming booking
    const upcomingBookings = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'PENDING_APPROVAL');
    upcomingBookings.sort((a, b) => new Date(a.bookingDate) - new Date(b.bookingDate));
    const nextBooking = upcomingBookings.length > 0 ? upcomingBookings[0] : null;

    // Filter logic
    const filteredAmenities = amenities.filter(a => {
        let match = true;
        if (filter !== 'ALL') {
            if (filter === 'INDOOR') match = ['CLUBHOUSE', 'GYM', 'PARTY_HALL', 'LIBRARY', 'MEDITATION_ROOM', 'CONFERENCE_ROOM'].includes(a.facilityType);
            else if (filter === 'OUTDOOR') match = ['SWIMMING_POOL', 'TENNIS_COURT', 'BADMINTON_COURT', 'CRICKET_NET', 'TERRACE', 'KIDS_PLAY_AREA', 'BBQ_AREA'].includes(a.facilityType);
            else if (filter === 'SPORTS') match = ['SWIMMING_POOL', 'GYM', 'TENNIS_COURT', 'BADMINTON_COURT', 'CRICKET_NET'].includes(a.facilityType);
            else if (filter === 'ENTERTAINMENT') match = ['PARTY_HALL', 'CLUBHOUSE', 'KIDS_PLAY_AREA'].includes(a.facilityType);
            else if (filter === 'OTHERS') match = ['OTHER'].includes(a.facilityType);
        }
        if (match && searchQuery) {
            match = a.name.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return match;
    });

    const TABS = [
        { id: 'ALL', label: 'All', icon: '🫂' },
        { id: 'INDOOR', label: 'Indoor', icon: '🏠' },
        { id: 'OUTDOOR', label: 'Outdoor', icon: '🌲' },
        { id: 'SPORTS', label: 'Sports', icon: '⚽' },
        { id: 'ENTERTAINMENT', label: 'Entertainment', icon: '🎉' },
        { id: 'OTHERS', label: 'Others', icon: '📦' },
    ];

    const scrollToAmenities = () => amenitiesSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    const navigateToMyBookings = () => navigate('/resident/amenities/bookings');

    return (
        <>
            <div className="max-w-[1400px] mx-auto space-y-6 pb-20">

                {/* Top Banner & Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2 tracking-tight">Amenities Booking</h1>
                        <p className="hidden text-slate-400 text-sm">Book and manage your community amenities</p>
                    </div>
                    <button
                        onClick={navigateToMyBookings}
                        className="bg-[#1e2030] hover:bg-[#25283a] border border-slate-700/50 text-slate-200 px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-colors shadow-sm"
                    >
                        <CalendarDays className="w-4 h-4" /> My Bookings
                    </button>
                </div>

                <div className="space-y-8">

                    {/* Main Content Area */}
                    <div className="space-y-8">

                        {/* Hero Promotion Widget */}
                        <div className="bg-gradient-to-bl from-[#1a1c29] to-[#2a1a5e]/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl relative overflow-hidden flex flex-col md:flex-row min-h-[180px] shadow-lg">

                            {/* Left Half Content */}
                            <div className="w-full md:w-7/12 p-6 md:p-8 relative z-10 flex flex-col justify-center pr-6 md:pr-2">
                                {/* Decorative lighting */}
                                <div className="absolute top-0 left-0 w-64 h-64 bg-[#8560ff]/10 blur-[80px] rounded-full pointer-events-none"></div>
                                <div className="absolute bottom-0 left-10 w-40 h-40 bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none"></div>

                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight drop-shadow-md">
                                    Book Your Favorite <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8560ff] to-purple-300">Amenities</span>
                                </h2>
                                <p className="text-slate-300 text-sm mb-5 leading-relaxed max-w-md">
                                    From clubhouse to sports courts, enjoy world-class facilities at your convenience.
                                </p>
                                <button
                                    onClick={scrollToAmenities}
                                    className="bg-gradient-to-r from-[#6338f0] to-[#8560ff] hover:from-[#5229db] hover:to-[#6338f0] text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-[#6338f0]/30 w-fit"
                                >
                                    Explore Amenities <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Full Right Half Image */}
                            <div className="w-full md:w-5/12 relative min-h-[140px] md:min-h-full shrink-0">
                                <img src="/others.png" alt="Amenities" className="absolute inset-0 w-full h-full object-cover" />
                                {/* Gradient overlay to smoothly blend image into the left side */}
                                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-[#1a1c29] md:from-transparent via-transparent to-transparent md:to-[#1a1c29]" />
                            </div>
                        </div>

                        {/* Search and Filter */}
                        <div ref={amenitiesSectionRef} className="flex flex-col md:flex-row gap-4 items-center pt-2">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search amenities..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-[#1e2030] border border-slate-700/50 text-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[#6338f0] transition-colors"
                                />
                            </div>
                            <button className="w-full md:w-auto bg-[#1e2030] hover:bg-[#25283a] border border-slate-700/50 text-slate-200 font-semibold px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shrink-0">
                                <SlidersHorizontal className="w-4 h-4" /> Filters
                            </button>
                        </div>

                        {/* Custom Tabs */}
                        <div className="flex overflow-x-auto pb-4 gap-2 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            {TABS.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setFilter(tab.id)}
                                    className={cn(
                                        "flex items-center gap-2 px-5 py-2.5 text-sm font-semibold transition-all whitespace-nowrap rounded-xl border snap-start",
                                        filter === tab.id
                                            ? "bg-[#6338f0]/10 text-[#8560ff] border-[#6338f0]/20"
                                            : "bg-[#1e2030] text-slate-400 border-slate-700/50 hover:bg-[#25283a] hover:text-slate-300"
                                    )}
                                >
                                    <span className={filter === tab.id ? '' : 'opacity-70 grayscale'}>{tab.icon}</span> {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Popular Amenities Grid */}
                        <div>
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="text-white font-bold">Popular Amenities</h3>
                                <button onClick={() => { setFilter('ALL'); setSearchQuery(''); }} className="text-purple-400 text-xs font-bold hover:text-purple-300">View All</button>
                            </div>

                            {aLoading ? (
                                <div className="grid grid-rows-2 lg:grid-rows-1 grid-flow-col auto-cols-[calc(50%-8px)] md:auto-cols-[calc(33.33%-16px)] lg:auto-cols-[calc(25%-18px)] gap-4 lg:gap-6 overflow-x-auto pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-72 bg-slate-800/50 animate-pulse rounded-2xl w-full"></div>)}
                                </div>
                            ) : filteredAmenities.length === 0 ? (
                                <div className="text-center py-10 text-slate-500">No amenities found matching your criteria.</div>
                            ) : (
                                <div className="grid grid-rows-2 lg:grid-rows-1 grid-flow-col auto-cols-[calc(50%-8px)] md:auto-cols-[calc(33.33%-16px)] lg:auto-cols-[calc(25%-18px)] gap-4 lg:gap-6 overflow-x-auto pb-6 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                    {filteredAmenities.map(amenity => (
                                        <div key={amenity._id} className="snap-start w-full">
                                            <AmenityCard
                                                amenity={amenity}
                                                onBookNow={setSelectedAmenity}
                                                isAdmin={false}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Upcoming Bookings Section */}
                        <div className="mt-8">
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="text-white font-bold">Your Upcoming Bookings</h3>
                                <button onClick={navigateToMyBookings} className="text-purple-400 text-xs font-bold hover:text-purple-300">View All</button>
                            </div>

                            {bLoading ? (
                                <div className="h-32 bg-slate-800/50 animate-pulse rounded-3xl"></div>
                            ) : nextBooking ? (
                                <UpcomingBookingCard booking={nextBooking} onViewDetails={() => navigate(`/resident/amenities/bookings/${nextBooking._id}`)} />
                            ) : (
                                <div className="bg-[#151822] border border-slate-800 rounded-3xl p-6 text-center text-slate-500 text-sm">
                                    You have no upcoming bookings.
                                </div>
                            )}
                        </div>

                        {/* Footer Info Banner */}
                        <BottomInfoBanner />

                    </div>
                </div>

            </div>

            {/* Modals */}
            {selectedAmenity && (
                <BookModal
                    amenities={amenities}
                    initialAmenityId={selectedAmenity._id}
                    onClose={(refresh) => {
                        setSelectedAmenity(null);
                        if (refresh) { refetchAmenities(); refetchBookings(); }
                    }}
                />
            )}
        </>
    );
}
