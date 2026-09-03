import React, { useState, useMemo } from 'react';
import { Building2, Plus, Download, Search, Settings } from 'lucide-react';
import { 
    useListAmenitiesQuery, 
    useDeleteAmenityMutation,
    useListBookingsQuery 
} from '../../../store/api/facilityApi';
import { toast } from 'react-hot-toast';
import StatCard from '../components/dashboard/StatCard';
import AmenityCard from '../../../components/ui/AmenityCard';
import BookingList from '../components/amenities/BookingList';
import AmenityFormModal from '../components/amenities/AmenityFormModal';

export default function AdminAmenitiesPage() {
    const [tab, setTab] = useState('amenities'); // 'amenities' | 'bookings'
    const [formTarget, setFormTarget] = useState(undefined); // undefined = closed, null = create, object = edit
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const { data: amenityData, isLoading: loadingAmenities, refetch: refetchAmenities } = useListAmenitiesQuery({});
    const { data: bookingData } = useListBookingsQuery({ limit: 1000 }); // fetch to get stats
    
    const [deleteAmenity] = useDeleteAmenityMutation();

    const amenities = amenityData?.data?.amenities ?? [];
    const allBookings = bookingData?.data?.bookings ?? [];

    const stats = useMemo(() => {
        const active = amenities.filter(a => a.isActive).length;
        const autoApprove = amenities.filter(a => a.autoApproval).length;
        return {
            totalAmenities: amenities.length,
            activeAmenities: active,
            totalBookings: allBookings.length,
            autoApproved: autoApprove,
            manualApproval: amenities.length - autoApprove
        };
    }, [amenities, allBookings]);

    const filteredAmenities = amenities.filter(a => 
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        a.facilityType.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleFormClose = (saved) => { 
        setFormTarget(undefined); 
        if (saved) refetchAmenities(); 
    };

    const handleDelete = async (id) => {
        try {
            await deleteAmenity(id).unwrap();
            toast.success('Amenity deleted successfully!');
            refetchAmenities();
        } catch (e) {
            toast.error(e?.data?.message ?? 'Delete failed');
        }
        setDeleteConfirm(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        {tab === 'amenities' ? 'Amenities' : 'Bookings'}
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        {tab === 'amenities' ? 'Manage all amenities and their booking settings' : 'Manage amenity bookings and resident details'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-[#1a1c29]/50 border border-slate-700/50 rounded-xl p-1">
                        <button 
                            onClick={() => setTab('amenities')}
                            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${tab === 'amenities' ? 'bg-white text-[#1a1c29]' : 'text-slate-400 hover:text-white'}`}
                        >
                            Amenities
                        </button>
                        <button 
                            onClick={() => setTab('bookings')}
                            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${tab === 'bookings' ? 'bg-white text-[#1a1c29]' : 'text-slate-400 hover:text-white'}`}
                        >
                            Bookings
                        </button>
                    </div>
                    
                    {tab === 'amenities' && (
                        <>
                            <button className="flex items-center gap-2 px-4 py-2 border border-slate-700 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800 transition">
                                <Download className="w-4 h-4" /> Export
                            </button>
                            <button 
                                onClick={() => setFormTarget(null)}
                                className="flex items-center gap-2 px-4 py-2 bg-[#6338f0] text-white rounded-xl text-sm font-semibold hover:bg-[#5229db] shadow-lg shadow-[#6338f0]/25 transition"
                            >
                                <Plus className="w-4 h-4" /> Add Amenity
                            </button>
                        </>
                    )}
                </div>
            </div>

            {tab === 'amenities' ? (
                <div className="space-y-6">
                    {/* Stats */}
                    <div className="flex overflow-x-auto pb-4 gap-4 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        <div className="w-[80vw] sm:w-[250px] shrink-0 snap-start">
                            <StatCard 
                                label="Total Amenities" 
                            value={stats.totalAmenities} 
                            icon={Building2}
                            gradient="bg-gradient-to-br from-indigo-500 to-indigo-600"
                            subLabel="All amenities"                            />
                        </div>
                        <div className="w-[80vw] sm:w-[250px] shrink-0 snap-start">
                            <StatCard 
                                label="Active Amenities" 
                            value={stats.activeAmenities} 
                            icon={Building2}
                            gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
                            subLabel="Currently active"                            />
                        </div>
                        <div className="w-[80vw] sm:w-[250px] shrink-0 snap-start">
                            <StatCard 
                                label="Total Bookings" 
                            value={stats.totalBookings} 
                            icon={Building2}
                            gradient="bg-gradient-to-br from-amber-500 to-amber-600"
                            subLabel="All time"                            />
                        </div>
                        <div className="w-[80vw] sm:w-[250px] shrink-0 snap-start">
                            <StatCard 
                                label="Auto-Approved" 
                            value={stats.autoApproved} 
                            icon={Building2}
                            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
                            subLabel="Amenities"                            />
                        </div>
                        <div className="w-[80vw] sm:w-[250px] shrink-0 snap-start">
                            <StatCard 
                                label="Manual Approval" 
                            value={stats.manualApproval} 
                            icon={Building2}
                            gradient="bg-gradient-to-br from-rose-500 to-rose-600"
                            subLabel="Amenities"                            />
                        </div>
                    </div>

                    {/* Controls & Search */}
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search amenities..."
                                className="w-full bg-[#1a1c29]/50 border border-slate-700/50 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-200 focus:border-[#6338f0] focus:outline-none"
                            />
                        </div>
                        <select className="bg-[#1a1c29]/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-400 focus:outline-none min-w-[150px]">
                            <option>All Statuses</option>
                            <option>Active</option>
                            <option>Inactive</option>
                        </select>
                        <select className="bg-[#1a1c29]/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-400 focus:outline-none min-w-[150px]">
                            <option>All Locations</option>
                        </select>
                        <button className="p-2.5 bg-[#6338f0] text-white rounded-xl shadow-lg shadow-[#6338f0]/25">
                            <Settings className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Grid */}
                    {loadingAmenities ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-800/50 border border-slate-700/50" />
                            ))}
                        </div>
                    ) : filteredAmenities.length === 0 ? (
                        <div className="flex flex-col items-center justify-center bg-[#1a1c29]/50 border border-slate-700/50 rounded-2xl p-16 text-center">
                            <Building2 className="w-16 h-16 text-slate-600 mb-4" />
                            <p className="text-lg font-bold text-slate-300">No amenities found</p>
                            <p className="text-sm text-slate-500 mt-2">Get started by creating your first amenity.</p>
                            <button 
                                onClick={() => setFormTarget(null)}
                                className="mt-6 flex items-center gap-2 px-6 py-2.5 bg-[#6338f0] text-white rounded-xl text-sm font-semibold hover:bg-[#5229db] shadow-lg shadow-[#6338f0]/25 transition"
                            >
                                <Plus className="w-4 h-4" /> Add Amenity
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                            {filteredAmenities.map(amenity => (
                                <AmenityCard 
                                    key={amenity._id} 
                                    amenity={amenity}
                                    isAdmin={true}
                                    onEdit={() => setFormTarget(amenity)}
                                    onDelete={() => setDeleteConfirm(amenity)}
                                    onViewBookings={() => setTab('bookings')}
                                />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex-1 -mx-4 sm:-mx-6 lg:-mx-8">
                    <BookingList />
                </div>
            )}

            {/* Modals */}
            {formTarget !== undefined && (
                <AmenityFormModal existing={formTarget} onClose={handleFormClose} />
            )}

            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-[#1e2030] border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
                        <div className="flex items-center gap-2 text-rose-500">
                            <h2 className="text-lg font-bold">Delete Amenity?</h2>
                        </div>
                        <p className="text-sm text-slate-400">Delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2 border border-slate-600 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800 transition">Cancel</button>
                            <button onClick={() => handleDelete(deleteConfirm._id)} className="flex-1 py-2 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 transition">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
