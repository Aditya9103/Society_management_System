import React, { useState } from 'react';
import { useGetMyVehiclesQuery, useRegisterVehicleMutation, useDeleteMyVehicleMutation, useRegenerateVehicleQrMutation, useGetMyVehicleLogsQuery, useGetMyViolationsQuery, useGetParkingSlotsQuery } from '../../../store/api/vehicleApi';
import { Car, Plus, QrCode, Trash2, ShieldAlert, CheckCircle2, RefreshCw, Search, ChevronDown, Calendar, Hash, Filter, ParkingCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import QRCode from 'react-qr-code';
import { toast } from 'react-hot-toast';
import AddVehicleModal from '../components/vehicles/AddVehicleModal';
import ParkingOverview from '../components/vehicles/ParkingOverview';

export default function ResidentVehiclePage() {
    const { data, isLoading } = useGetMyVehiclesQuery();
    const [registerVehicle, { isLoading: isRegistering }] = useRegisterVehicleMutation();
    const [deleteVehicle] = useDeleteMyVehicleMutation();
    const [regenerateQr, { isLoading: isRegenerating }] = useRegenerateVehicleQrMutation();

    const { data: logsData, isLoading: isLogsLoading } = useGetMyVehicleLogsQuery();
    const { data: violationsData, isLoading: isViolationsLoading } = useGetMyViolationsQuery();
    const { data: parkingData, isLoading: isParkingLoading } = useGetParkingSlotsQuery();

    const [showAddModal, setShowAddModal] = useState(false);
    const [activeTab, setActiveTab] = useState('My Vehicles');
    const [searchQuery, setSearchQuery] = useState('');
    const [vehicleFilter, setVehicleFilter] = useState('ALL');
    const [vehicleSort, setVehicleSort] = useState('NEWEST');

    const vehicles = data?.data?.vehicles || [];
    const logs = logsData?.data?.logs || [];
    const violations = violationsData?.data?.violations || [];
    const parkingSlots = parkingData?.data?.slots || [];

    const myParkingSlots = parkingSlots.filter(slot => {
        if (!slot.assignedVehicleId) return false;
        const assignedId = typeof slot.assignedVehicleId === 'object' ? slot.assignedVehicleId._id : slot.assignedVehicleId;
        return vehicles.some(v => v._id === assignedId);
    });

    const handleAddVehicle = async (formData) => {
        try {
            await registerVehicle(formData).unwrap();
            toast.success('Vehicle registered successfully');
            setShowAddModal(false);
        } catch (e) {
            toast.error(e?.data?.message || 'Failed to register vehicle');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this vehicle?')) return;
        try {
            await deleteVehicle(id).unwrap();
            toast.success('Vehicle removed successfully');
        } catch (e) {
            toast.error(e?.data?.message || 'Failed to delete vehicle. It may be currently inside the society.');
        }
    };

    const handleRegenerate = async (id) => {
        if (!window.confirm('Generate a new QR Code? The old one will instantly become invalid.')) return;
        try {
            await regenerateQr(id).unwrap();
            toast.success('QR Code regenerated successfully');
        } catch (e) {
            toast.error(e?.data?.message || 'Failed to regenerate QR');
        }
    };

    const tabs = ['My Vehicles', 'My Parking', 'Parking History', 'Violations'];

    const filteredAndSortedVehicles = [...vehicles]
        .filter(v => {
            // Search filter
            const matchesSearch = v.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  (v.make && v.make.toLowerCase().includes(searchQuery.toLowerCase())) ||
                                  (v.model && v.model.toLowerCase().includes(searchQuery.toLowerCase()));
            
            if (!matchesSearch) return false;

            // Type/Status filter
            if (vehicleFilter === 'ALL') return true;
            if (vehicleFilter === 'PARKED') return v.isCurrentlyParked;
            if (vehicleFilter === 'NOT_PARKED') return !v.isCurrentlyParked;
            if (vehicleFilter === 'TWO_WHEELER') return v.vehicleType === 'TWO_WHEELER';
            if (vehicleFilter === 'FOUR_WHEELER') return v.vehicleType === 'FOUR_WHEELER';
            
            return true;
        })
        .sort((a, b) => {
            switch (vehicleSort) {
                case 'NEWEST':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'OLDEST':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'MAKE_ASC':
                    return (a.make || '').localeCompare(b.make || '');
                case 'MAKE_DESC':
                    return (b.make || '').localeCompare(a.make || '');
                default:
                    return 0;
            }
        });

    const activeParked = vehicles.filter(v => v.isCurrentlyParked).length;

    return (
        <div className="relative text-white p-6 -m-6 md:-m-8 z-10">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">Vehicles & Parking</h1>
                        <p className="text-slate-400">Manage your vehicles and parking spaces</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 font-medium transition-colors">
                            <QrCode size={18} /> Scan QR
                        </button>
                        <button 
                            onClick={() => setShowAddModal(true)} 
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:opacity-90 shadow-[0_4px_15px_rgba(99,102,241,0.4)] transition-all"
                        >
                            <Plus size={18} /> Add Vehicle
                        </button>
                    </div>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-start justify-between">
                        <div>
                            <p className="text-slate-400 text-xs font-medium mb-1 uppercase tracking-wider">Total Vehicles</p>
                            <h3 className="text-2xl font-bold text-white">{vehicles.length}</h3>
                            <p className="text-slate-500 text-xs mt-1">Registered</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                            <Car size={20} />
                        </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-start justify-between">
                        <div>
                            <p className="text-slate-400 text-xs font-medium mb-1 uppercase tracking-wider">Active Parking</p>
                            <h3 className="text-2xl font-bold text-white">{activeParked}</h3>
                            <p className="text-slate-500 text-xs mt-1">In Use</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                            <ParkingCircle size={20} />
                        </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-start justify-between">
                        <div>
                            <p className="text-slate-400 text-xs font-medium mb-1 uppercase tracking-wider">Available Slots</p>
                            <h3 className="text-2xl font-bold text-white">
                                {parkingSlots.filter(s => s.status === 'AVAILABLE' && !s.assignedVehicleId).length}
                            </h3>
                            <p className="text-slate-500 text-xs mt-1">Free Slots</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                            <CheckCircle2 size={20} />
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 border-b border-white/10 overflow-x-auto no-scrollbar">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                                activeTab === tab 
                                ? 'border-indigo-500 text-indigo-400' 
                                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-white/20'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {activeTab === 'My Vehicles' && (
                    <div className="space-y-6">
                        {/* Search & Filters */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
                            <div className="relative w-full sm:max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                <input 
                                    type="text"
                                    placeholder="Search vehicles..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-[#131525] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                />
                            </div>
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <div className="relative flex-1 sm:flex-none">
                                    <select 
                                        value={vehicleFilter}
                                        onChange={(e) => setVehicleFilter(e.target.value)}
                                        className="appearance-none w-full flex items-center justify-between gap-3 pl-4 pr-10 py-2.5 bg-[#131525] border border-white/10 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors text-slate-300 focus:outline-none"
                                    >
                                        <option value="ALL">All Vehicles</option>
                                        <option value="PARKED">Currently Parked</option>
                                        <option value="NOT_PARKED">Not Parked</option>
                                        <option value="TWO_WHEELER">Two Wheelers</option>
                                        <option value="FOUR_WHEELER">Four Wheelers</option>
                                    </select>
                                    <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                                <div className="relative flex-1 sm:flex-none">
                                    <select 
                                        value={vehicleSort}
                                        onChange={(e) => setVehicleSort(e.target.value)}
                                        className="appearance-none w-full flex items-center justify-between gap-3 pl-10 pr-10 py-2.5 bg-[#131525] border border-white/10 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors text-slate-300 focus:outline-none"
                                    >
                                        <option value="NEWEST">Newest First</option>
                                        <option value="OLDEST">Oldest First</option>
                                        <option value="MAKE_ASC">Make (A-Z)</option>
                                        <option value="MAKE_DESC">Make (Z-A)</option>
                                    </select>
                                    <Filter className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Vehicles List */}
                        {isLoading ? (
                            <div className="flex justify-center py-12">
                                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                            </div>
                        ) : filteredAndSortedVehicles.length === 0 ? (
                            <div className="py-16 text-center bg-white/5 rounded-2xl border border-white/10 border-dashed">
                                <Car className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-white mb-2">No vehicles found</h3>
                                <p className="text-slate-400 text-sm">Add a vehicle to manage your parking spaces or adjust your filters.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredAndSortedVehicles.map(v => (
                                    <div key={v._id} className="bg-[#131525] border border-white/5 rounded-2xl p-5 flex flex-col lg:flex-row gap-6 shadow-lg hover:border-white/10 transition-colors">
                                        
                                        {/* Left: Image Placeholder */}
                                        <div className="w-full lg:w-48 h-32 bg-gradient-to-br from-[#1c1f36] to-[#0f1120] rounded-xl flex items-center justify-center overflow-hidden border border-white/5 shrink-0 relative group">
                                            {v.vehiclePhotoUrl ? (
                                                <img src={v.vehiclePhotoUrl} alt="Vehicle" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                                            ) : (
                                                <Car className="w-12 h-12 text-slate-600" />
                                            )}
                                        </div>

                                        {/* Center: Details */}
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-lg font-bold text-white">{v.make} {v.model || 'Unknown'}</h3>
                                                        {v.isPrimary && <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400">Primary</span>}
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-slate-300 font-mono text-sm tracking-wide bg-white/5 px-2 py-1 rounded">{v.vehicleNumber}</span>
                                                        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full border 
                                                            ${v.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                                              v.status === 'PENDING_APPROVAL' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                                                              'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                                            {v.status.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button onClick={() => handleDelete(v._id)} className="text-slate-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-colors">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-slate-400 mt-4">
                                                <div className="flex items-center gap-1.5"><Car size={14} /> {(v.vehicleType === 'OTHER' ? v.customVehicleType : v.vehicleType).replace('_', ' ')} • {v.color || 'No Color'} • {v.fuelType}</div>
                                                <div className="flex items-center gap-1.5"><Calendar size={14} /> Registered {new Date(v.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                            </div>
                                        </div>

                                        {/* Divider */}
                                        <div className="hidden lg:block w-px bg-white/5 my-2"></div>

                                        {/* Right: Parking & QR */}
                                        <div className="flex items-center gap-6 lg:min-w-[280px]">
                                            <div className="flex-1">
                                                <p className="text-xs text-slate-500 font-medium mb-1">Parking Slot</p>
                                                {v.parkingSlotId ? (
                                                    <div>
                                                        <p className="font-bold text-white text-lg">{v.parkingSlotId.slotNumber}</p>
                                                        <p className="text-xs text-slate-400">Basement Floor 1</p>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p className="font-bold text-slate-300 text-lg">Unassigned</p>
                                                        <p className="text-xs text-slate-500">-</p>
                                                    </div>
                                                )}

                                                <div className="mt-3 flex items-center gap-1.5">
                                                    <span className={`w-2 h-2 rounded-full ${v.isCurrentlyParked ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`}></span>
                                                    <span className={`text-xs font-semibold ${v.isCurrentlyParked ? 'text-emerald-400' : 'text-red-400'}`}>
                                                        {v.isCurrentlyParked ? 'Currently Parked' : 'Not Parked'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* QR Code */}
                                            {v.qrToken ? (
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="p-2 bg-white rounded-xl shadow-lg border border-white/20">
                                                        <QRCode value={v.qrToken} size={64} level="H" />
                                                    </div>
                                                    <button onClick={() => handleRegenerate(v._id)} className="text-[10px] font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                                                        <RefreshCw size={10} /> Regenerate
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="w-[80px] h-[80px] bg-white/5 rounded-xl flex items-center justify-center border border-dashed border-white/20">
                                                    <QrCode className="text-slate-500" size={24} />
                                                </div>
                                            )}
                                        </div>
                                        
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {/* Parking Overview graphic */}
                        <ParkingOverview vehicles={vehicles} parkingData={parkingSlots} />
                    </div>
                )}

                {activeTab === 'My Parking' && (
                    <div className="space-y-6">
                        {isParkingLoading ? (
                            <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" /></div>
                        ) : myParkingSlots.length === 0 ? (
                            <div className="py-16 text-center bg-white/5 rounded-2xl border border-white/10 border-dashed">
                                <ParkingCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-white mb-2">No parking slots</h3>
                                <p className="text-slate-400 text-sm">You haven't been assigned any parking slots yet.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                {myParkingSlots.map(slot => (
                                    <div key={slot._id} className="bg-[#131525] border border-white/5 rounded-2xl p-5 shadow-lg">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">{slot.floor}</p>
                                                <h3 className="text-2xl font-bold text-white">{slot.slotNumber}</h3>
                                            </div>
                                            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
                                                {slot.type.replace('_', ' ')}
                                            </span>
                                        </div>
                                        {slot.assignedVehicleId ? (
                                            <div className="bg-white/5 rounded-xl p-4 flex items-center gap-4 border border-white/5">
                                                <div className="w-10 h-10 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-400"><Car size={20} /></div>
                                                <div>
                                                    <p className="text-sm font-bold text-white">{slot.assignedVehicleId.vehicleNumber}</p>
                                                    <p className="text-xs text-slate-400">Currently Assigned</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-white/5 rounded-xl p-4 flex items-center gap-4 border border-white/5 border-dashed">
                                                <div className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center text-slate-500"><Car size={20} /></div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-400">Empty Slot</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'Parking History' && (
                    <div className="space-y-6">
                        {isLogsLoading ? (
                            <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" /></div>
                        ) : logs.length === 0 ? (
                            <div className="py-16 text-center bg-white/5 rounded-2xl border border-white/10 border-dashed">
                                <Calendar className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-white mb-2">No history</h3>
                                <p className="text-slate-400 text-sm">No entry or exit logs found for your vehicles.</p>
                            </div>
                        ) : (
                            <div className="bg-[#131525] border border-white/5 rounded-2xl shadow-lg overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white/5 border-b border-white/10">
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date & Time</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Vehicle</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Action</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Gate</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {logs.map(log => (
                                            <tr key={log._id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4 text-sm text-white">
                                                    {new Date(log.status === 'ENTRY' ? log.entryTime : log.exitTime).toLocaleString('en-GB')}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-mono text-slate-300">
                                                    {log.vehicleNumber}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className={`inline-flex px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wide border 
                                                        ${log.status === 'ENTRY' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                                        {log.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-400">
                                                    {log.gateId?.name || 'Main Gate'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'Violations' && (
                    <div className="space-y-6">
                        {isViolationsLoading ? (
                            <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" /></div>
                        ) : violations.length === 0 ? (
                            <div className="py-16 text-center bg-white/5 rounded-2xl border border-white/10 border-dashed">
                                <ShieldAlert className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-white mb-2">All clear!</h3>
                                <p className="text-slate-400 text-sm">You have zero parking violations.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {violations.map(violation => (
                                    <div key={violation._id} className="bg-[#131525] border border-red-500/20 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_4px_15px_rgba(220,38,38,0.1)]">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                                                <ShieldAlert className="w-5 h-5 text-red-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white mb-1">{violation.type.replace('_', ' ')}</h3>
                                                <p className="text-sm text-slate-400 mb-2">{violation.description || 'No description provided.'}</p>
                                                <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                                                    <span>{new Date(violation.createdAt).toLocaleDateString('en-GB')}</span>
                                                    <span className="font-mono text-slate-300 bg-white/5 px-2 py-0.5 rounded">{violation.vehicleId?.vehicleNumber}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-red-400 mb-1">₹{violation.fineAmount}</p>
                                            <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                                                {violation.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                
                {/* Modal */}
                {showAddModal && (
                    <AddVehicleModal 
                        onClose={() => setShowAddModal(false)}
                        onAdd={handleAddVehicle}
                        isLoading={isRegistering}
                    />
                )}
            </div>
        </div>
    );
}
