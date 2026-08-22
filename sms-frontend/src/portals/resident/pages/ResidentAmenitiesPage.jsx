import React, { useState, useRef } from 'react';
import { useListAmenitiesQuery, useListBookingsQuery } from '../../../store/api/facilityApi';
import { Search, SlidersHorizontal, CalendarDays, ArrowRight } from 'lucide-react';

// Sub components
import { AmenityCard } from '../components/amenities/AmenityCard';
import { UpcomingBookingCard } from '../components/amenities/UpcomingBookingCard';
import { MyBookingsList } from '../components/amenities/MyBookingsList';
import { QuickInfoWidget } from '../components/amenities/QuickInfoWidget';
import { BottomInfoBanner } from '../components/amenities/BottomInfoBanner';
import { BookModal } from '../components/amenities/BookModal';
import { BookingDetailsModal } from '../components/amenities/BookingDetailsModal';
import { CancelConfirmModal } from '../components/amenities/CancelConfirmModal';
import { RatingModal } from '../components/amenities/RatingModal';

export default function ResidentAmenitiesPage() {
    const { data: aData, isLoading: aLoading, refetch: refetchAmenities } = useListAmenitiesQuery({ isActive: true });
    const { data: bData, isLoading: bLoading, refetch: refetchBookings } = useListBookingsQuery({ page: 1, limit: 10 });
    
    const [selectedAmenity, setSelectedAmenity] = useState(null);
    const [viewTarget, setViewTarget] = useState(null);
    const [cancelTarget, setCancelTarget] = useState(null);
    const [rateTarget, setRateTarget] = useState(null);

    const [filter, setFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    const amenitiesSectionRef = useRef(null);
    const bookingsSectionRef = useRef(null);

    const amenities = aData?.data?.amenities ?? [];
    const bookings = bData?.data?.bookings ?? bData?.data?.docs ?? [];
    
    // Find next upcoming booking
    const upcomingBookings = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'PENDING_APPROVAL');
    upcomingBookings.sort((a,b) => new Date(a.bookingDate) - new Date(b.bookingDate));
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
    const scrollToBookings = () => bookingsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });

    return (
        <div className="min-h-screen bg-[#0f111a] p-4 lg:p-8 font-sans">
            <div className="max-w-[1400px] mx-auto">
                
                {/* Top Banner & Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2 tracking-tight">Amenities Booking</h1>
                        <p className="text-slate-400 text-sm">Book and manage your community amenities</p>
                    </div>
                    <button 
                        onClick={scrollToBookings}
                        className="bg-[#151822] hover:bg-slate-800 border border-purple-500/30 text-purple-400 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors"
                    >
                        <CalendarDays className="w-4 h-4" /> My Bookings
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Main Content Area */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* Hero Promotion Widget */}
                        <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-[#120f22] border border-indigo-500/20 rounded-3xl p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between min-h-[220px]">
                            {/* Decorative lighting */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 blur-[60px] rounded-full mix-blend-screen pointer-events-none"></div>
                            
                            <div className="z-10 md:w-1/2">
                                <h2 className="text-3xl font-bold text-white mb-3 leading-tight text-shadow-sm">
                                    Book Your Favorite <span className="text-indigo-400">Amenities</span>
                                </h2>
                                <p className="text-indigo-200/80 text-sm mb-6 leading-relaxed">
                                    From clubhouse to sports courts, enjoy world-class facilities at your convenience.
                                </p>
                                <button 
                                    onClick={scrollToAmenities}
                                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-purple-900/20"
                                >
                                    Explore Amenities <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                            
                            {/* Generic Image placeholder representing the 3D graphic */}
                            <div className="z-10 md:w-1/2 flex justify-end mt-6 md:mt-0 relative">
                                <img src="https://images.unsplash.com/photo-1542314831-c6a4d14eff43?auto=format&fit=crop&q=80&w=600" alt="3D Pool" className="w-full max-w-[320px] rounded-2xl shadow-2xl shadow-black/50 border border-white/10 brightness-90 contrast-125" />
                                <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-indigo-950/80 rounded-2xl hidden md:block"></div>
                            </div>
                        </div>

                        {/* Search and Filter */}
                        <div ref={amenitiesSectionRef} className="flex flex-col md:flex-row gap-4 items-center pt-2">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input 
                                    type="text" 
                                    placeholder="Search amenities..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-[#151822] border border-slate-800 text-white rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-purple-500/50" 
                                />
                            </div>
                            <button className="w-full md:w-auto bg-[#151822] hover:bg-slate-800 border border-slate-800 text-slate-300 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shrink-0">
                                <SlidersHorizontal className="w-4 h-4" /> Filters
                            </button>
                        </div>

                        {/* Custom Tabs */}
                        <div className="flex overflow-x-auto pb-2 space-x-2 border-b border-slate-800/80 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            {TABS.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setFilter(tab.id)}
                                    className={`flex items-center gap-2 px-5 py-3 text-sm font-bold transition-all whitespace-nowrap border-b-2
                                        ${filter === tab.id ? 'text-purple-400 border-purple-500 bg-purple-500/5 rounded-t-lg' : 'text-slate-400 border-transparent hover:text-slate-300'}`}
                                >
                                    <span className="opacity-70 grayscale">{tab.icon}</span> {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Popular Amenities Grid */}
                        <div>
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="text-white font-bold">Popular Amenities</h3>
                                <button onClick={() => { setFilter('ALL'); setSearchQuery(''); }} className="text-purple-400 text-xs font-medium hover:text-purple-300">View All</button>
                            </div>
                            
                            {aLoading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {[1,2,3,4].map(i => <div key={i} className="h-64 bg-slate-800/50 animate-pulse rounded-2xl"></div>)}
                                </div>
                            ) : filteredAmenities.length === 0 ? (
                                <div className="text-center py-10 text-slate-500">No amenities found matching your criteria.</div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {filteredAmenities.map(amenity => (
                                        <AmenityCard key={amenity._id} amenity={amenity} onBook={setSelectedAmenity} />
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        {/* Upcoming Bookings Section */}
                        <div className="mt-8">
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="text-white font-bold">Your Upcoming Bookings</h3>
                                <button onClick={scrollToBookings} className="text-purple-400 text-xs font-medium hover:text-purple-300">View All</button>
                            </div>
                            
                            {bLoading ? (
                                <div className="h-32 bg-slate-800/50 animate-pulse rounded-3xl"></div>
                            ) : nextBooking ? (
                                <UpcomingBookingCard booking={nextBooking} onViewDetails={setViewTarget} />
                            ) : (
                                <div className="bg-[#151822] border border-slate-800 rounded-3xl p-6 text-center text-slate-500 text-sm">
                                    You have no upcoming bookings.
                                </div>
                            )}
                        </div>
                        
                        {/* Footer Info Banner */}
                        <BottomInfoBanner />

                    </div>

                    {/* Right Sidebar */}
                    <div className="lg:col-span-4 space-y-8" ref={bookingsSectionRef}>
                        {/* My Bookings List Widget */}
                        <MyBookingsList bookings={bookings} onViewAll={setViewTarget} />
                        
                        {/* Quick Info Widget */}
                        <QuickInfoWidget />
                    </div>
                </div>

            </div>

            {/* Modals */}
            {selectedAmenity && (
                <BookModal 
                    amenity={selectedAmenity} 
                    onClose={(refresh) => {
                        setSelectedAmenity(null);
                        if (refresh) { refetchAmenities(); refetchBookings(); }
                    }} 
                />
            )}

            {viewTarget && (
                <BookingDetailsModal 
                    booking={viewTarget} 
                    onClose={() => setViewTarget(null)}
                    onCancel={(b) => setCancelTarget(b)}
                    onRate={(b) => setRateTarget(b)}
                />
            )}

            {cancelTarget && (
                <CancelConfirmModal 
                    booking={cancelTarget} 
                    onClose={(refresh) => {
                        setCancelTarget(null);
                        if (refresh) refetchBookings();
                    }}
                />
            )}

            {rateTarget && (
                <RatingModal 
                    booking={rateTarget} 
                    onClose={(refresh) => {
                        setRateTarget(null);
                        if (refresh) refetchBookings();
                    }}
                />
            )}
        </div>
    );
}
