import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Building2, 
    Plus, 
    Search, 
    Filter, 
    ChevronDown, 
    Edit2, 
    MoreVertical, 
    Layers, 
    Grid,
    PieChart,
    RefreshCw
} from 'lucide-react';
import {
    useListTowersQuery,
    useDeleteTowerMutation,
} from '../../../store/api/societyAdminApi';
import { Button } from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';
import Modal from '../../../components/ui/Modal';
import CreateTowerModal from '../components/CreateTowerModal';

const StatCard = ({ icon: Icon, title, value, subtitle, iconBg, iconColor, gradient, onClick }) => (
    <div 
        onClick={onClick}
        className={`relative overflow-hidden rounded-[20px] bg-gradient-to-br ${gradient} border border-white/5 p-5 flex flex-col justify-between transition-transform hover:scale-[1.02] shadow-lg ${onClick ? 'cursor-pointer' : ''}`}
    >
        <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none">
            <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 80C30 50 60 80 120 20L120 80H0Z" fill="currentColor" className="text-white" />
                <path d="M20 80C50 40 80 70 120 0L120 80H20Z" fill="currentColor" className="text-white opacity-50" />
            </svg>
        </div>
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg} shrink-0 backdrop-blur-md`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <div>
                <p className="text-[11px] sm:text-[12px] font-semibold text-white mb-0.5 tracking-wide line-clamp-1">{title}</p>
                <div className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-1">{value}</div>
                <p className="text-[9px] sm:text-[10px] text-white/80 font-bold line-clamp-1">{subtitle}</p>
            </div>
        </div>
    </div>
);

export default function TowersPage() {
    const navigate = useNavigate();
    const { data, isLoading, isError, refetch, isFetching } = useListTowersQuery();
    const [deleteTower] = useDeleteTowerMutation();

    const [isTowerModalOpen, setIsTowerModalOpen] = useState(false);
    const [editingTower, setEditingTower] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [sortBy, setSortBy] = useState('name_asc');

    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const [deleteConfirmModal, setDeleteConfirmModal] = useState({ open: false, type: null, tower: null });

    const towers = Array.isArray(data?.data) ? data.data : [];

    // Derive stats
    const stats = useMemo(() => {
        let totalTowers = towers.length;
        let totalFloors = 0;
        let totalUnits = 0;
        let totalOccupied = 0;
        
        towers.forEach(t => {
            totalFloors += (t.floorCount || 0);
            totalUnits += (t.totalUnits || 0);
            totalOccupied += (t.occupiedUnits || 0);
        });

        const occupancyRate = totalUnits > 0 ? Math.round((totalOccupied / totalUnits) * 100) : 0;

        return { totalTowers, totalFloors, totalUnits, occupancyRate };
    }, [towers]);

    // Filter and Sort Towers
    const filteredTowers = useMemo(() => {
        let result = [...towers];

        // 1. Filter by Search
        if (searchQuery) {
            result = result.filter(t => 
                t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                t.code.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // 2. Filter by Building Type
        if (filterType !== 'All') {
            result = result.filter(t => t.buildingType === filterType);
        }

        // 3. Sort
        result.sort((a, b) => {
            if (sortBy === 'name_asc') {
                return a.name.localeCompare(b.name);
            } else if (sortBy === 'name_desc') {
                return b.name.localeCompare(a.name);
            } else if (sortBy === 'floors_desc') {
                const aFloors = a.floorCount || a.totalFloors || 0;
                const bFloors = b.floorCount || b.totalFloors || 0;
                return bFloors - aFloors;
            } else if (sortBy === 'occupancy_desc') {
                const aOcc = a.totalUnits > 0 ? (a.occupiedUnits || 0) / a.totalUnits : 0;
                const bOcc = b.totalUnits > 0 ? (b.occupiedUnits || 0) / b.totalUnits : 0;
                return bOcc - aOcc;
            }
            return 0;
        });

        return result;
    }, [towers, searchQuery, filterType, sortBy]);

    const showSuccess = (msg) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(''), 4000);
    };

    const showError = (msg) => {
        setErrorMsg(msg);
        setTimeout(() => setErrorMsg(''), 4000);
    }

    const handleCreateTower = () => {
        setEditingTower(null);
        setIsTowerModalOpen(true);
    };

    const handleEditTower = (tower) => {
        setEditingTower(tower);
        setIsTowerModalOpen(true);
    };

    const handleDeleteTowerConfirm = async () => {
        try {
            await deleteTower(deleteConfirmModal.tower._id).unwrap();
            showSuccess('Tower deleted successfully!');
        } catch (err) {
            showError(err?.data?.message || 'Failed to delete tower.');
        } finally {
            setDeleteConfirmModal({ open: false, type: null, tower: null });
        }
    };

    const navigateToDetails = (towerId) => {
        navigate(`/admin/towers/${towerId}`);
    };

    const getOccupancyColor = (percentage) => {
        if (percentage >= 90) return 'bg-emerald-500';
        if (percentage >= 70) return 'bg-amber-500';
        return 'bg-red-500';
    };

    const getOccupancyTextColor = (percentage) => {
        if (percentage >= 90) return 'text-emerald-500';
        if (percentage >= 70) return 'text-amber-500';
        return 'text-red-500';
    };

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Towers & Floors</h1>
                    <p className="text-slate-400 text-sm">Manage all towers, floors and building structure</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={refetch}
                        disabled={isFetching}
                        className="p-2 border border-slate-700/50 bg-[#1e2030] rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                        <RefreshCw className={`w-5 h-5 ${isFetching ? 'animate-spin' : ''}`} />
                    </button>
                    <button 
                        onClick={handleCreateTower}
                        className="bg-[#6338f0] hover:bg-[#5225e2] text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Create New Tower
                    </button>
                </div>
            </div>

            {successMsg && <Alert type="success">{successMsg}</Alert>}
            {errorMsg && <Alert type="error">{errorMsg}</Alert>}
            {isError && <Alert type="error">Failed to load towers. Please refresh.</Alert>}

            {/* Stats Overview */}
            <div className="flex overflow-x-auto pb-4 gap-4 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] mb-4 md:mb-8">
                <div className="w-[calc(50vw-24px)] md:w-auto md:flex-1 shrink-0 snap-start">
                    <StatCard 
                        icon={Building2}
                        title="Total Towers"
                        value={stats.totalTowers}
                        subtitle="Registered"
                        iconBg="bg-[#3e248a]/50"
                        iconColor="text-[#b388ff]"
                        gradient="from-[#2e1d5e]/80 to-[#1c1439]"
                    />
                </div>
                <div className="w-[calc(50vw-24px)] md:w-auto md:flex-1 shrink-0 snap-start">
                    <StatCard 
                        icon={Layers}
                        title="Total Floors"
                        value={stats.totalFloors}
                        subtitle="Across all towers"
                        iconBg="bg-[#1d488c]/50"
                        iconColor="text-[#60a5fa]"
                        gradient="from-[#143261]/80 to-[#0b1c36]"
                    />
                </div>
                <div className="w-[calc(50vw-24px)] md:w-auto md:flex-1 shrink-0 snap-start">
                    <StatCard 
                        icon={Grid}
                        title="Total Units"
                        value={stats.totalUnits}
                        subtitle="Flats & shops"
                        iconBg="bg-[#1a4d35]/50"
                        iconColor="text-[#4ade80]"
                        gradient="from-[#123625]/80 to-[#0a1f15]"
                    />
                </div>
                <div className="w-[calc(50vw-24px)] md:w-auto md:flex-1 shrink-0 snap-start">
                    <StatCard 
                        icon={PieChart}
                        title="Occupancy"
                        value={`${stats.occupancyRate}%`}
                        subtitle="Overall rate"
                        iconBg="bg-[#6b1e28]/50"
                        iconColor="text-[#f87171]"
                        gradient="from-[#4a1216]/80 to-[#2b0a0d]"
                    />
                </div>
            </div>

            {/* List Section */}
            <div className="bg-[#1a1c29] border border-slate-800/50 rounded-2xl overflow-hidden flex flex-col min-h-[500px]">
                {/* Toolbar */}
                <div className="p-5 border-b border-slate-800/50 flex flex-col md:flex-row gap-4 justify-between">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search towers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#131525] border border-slate-800 text-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#6338f0]"
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:flex-none">
                            <select 
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-full appearance-none flex items-center justify-between gap-2 bg-[#131525] border border-slate-800 text-slate-300 px-4 py-2.5 rounded-lg text-sm hover:border-slate-700 focus:outline-none focus:border-[#6338f0]"
                            >
                                <option value="All">All Types</option>
                                <option value="Residential">Residential</option>
                                <option value="Commercial">Commercial</option>
                                <option value="Mixed">Mixed</option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        <div className="relative flex-1 md:flex-none">
                            <select 
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full appearance-none flex items-center justify-between gap-2 bg-[#131525] border border-slate-800 text-slate-300 px-4 py-2.5 rounded-lg text-sm hover:border-slate-700 focus:outline-none focus:border-[#6338f0]"
                            >
                                <option value="name_asc">Name (A-Z)</option>
                                <option value="name_desc">Name (Z-A)</option>
                                <option value="floors_desc">Most Floors</option>
                                <option value="occupancy_desc">Highest Occupancy</option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="p-5 space-y-4">
                            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-800/50 animate-pulse rounded-xl" />)}
                        </div>
                    ) : filteredTowers.length === 0 ? (
                        <div className="p-10 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                                <Building2 className="w-8 h-8 text-slate-500" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">No towers found</h3>
                            <p className="text-slate-400 text-sm max-w-sm mb-6">Create your first tower to start managing building structure and floors.</p>
                            <Button onClick={handleCreateTower}><Plus className="w-4 h-4 mr-2" /> Create Tower</Button>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            <thead>
                                <tr className="border-b border-slate-800/50 bg-[#131525]/50">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tower Name</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Code</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Floors</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Units</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider min-w-[180px]">Amenities</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider min-w-[200px]">Occupancy</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTowers.map(tower => {
                                    const occupied = tower.occupiedUnits || 0;
                                    const total = tower.totalUnits || 0;
                                    const occPercent = total > 0 ? Math.round((occupied / total) * 100) : 0;
                                    const codeColors = ['text-purple-400 bg-purple-500/10 border-purple-500/20', 'text-blue-400 bg-blue-500/10 border-blue-500/20', 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'];
                                    const codeColor = codeColors[(tower.code.charCodeAt(0) || 0) % codeColors.length];

                                    return (
                                        <tr key={tower._id} className="border-b border-slate-800/30 hover:bg-[#202236]/50 transition-colors group cursor-pointer" onClick={() => navigateToDetails(tower._id)}>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-900/20">
                                                        <Building2 className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white text-base">{tower.name}</div>
                                                        <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{tower.description || 'Residential Tower'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm border ${codeColor}`}>
                                                    {tower.code}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="font-bold text-white text-base">{tower.floorCount || tower.totalFloors || 0}</div>
                                                <div className="text-xs text-slate-500 mt-0.5">Floors</div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="font-bold text-white text-base">{tower.totalUnits || 0}</div>
                                                <div className="text-xs text-slate-500 mt-0.5">Units</div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {tower.amenities?.slice(0, 3).map((a, i) => (
                                                        <span key={i} className={`px-2 py-1 rounded-md text-[11px] font-bold border 
                                                            ${i===0?'text-purple-400 bg-purple-500/10 border-purple-500/20':
                                                              i===1?'text-blue-400 bg-blue-500/10 border-blue-500/20':
                                                              'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'}`}>
                                                            {a}
                                                        </span>
                                                    ))}
                                                    {(tower.amenities?.length || 0) > 3 && (
                                                        <span className="px-2 py-1 rounded-md text-[11px] font-bold text-slate-400 bg-slate-800/50 border border-slate-700/50">
                                                            +{tower.amenities.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex justify-between items-end mb-2">
                                                    <span className={`font-bold text-base ${getOccupancyTextColor(occPercent)}`}>{occPercent}%</span>
                                                    <span className="text-xs text-slate-400 font-medium">{occupied}/{total} Units</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${getOccupancyColor(occPercent)}`} style={{ width: `${occPercent}%` }} />
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                                                    <button 
                                                        onClick={() => handleEditTower(tower)}
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => navigateToDetails(tower._id)}
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700"
                                                    >
                                                        <Building2 className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => setDeleteConfirmModal({ open: true, type: 'tower', tower })}
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700"
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
                
                {/* Pagination (Mock) */}
                {!isLoading && filteredTowers.length > 0 && (
                    <div className="p-4 border-t border-slate-800/50 bg-[#131525]/30 flex items-center justify-between text-sm text-slate-400 mt-auto">
                        <div>Showing 1 to {filteredTowers.length} of {filteredTowers.length} towers</div>
                        <div className="flex items-center gap-2">
                            <button className="w-8 h-8 rounded border border-slate-700/50 flex items-center justify-center opacity-50 cursor-not-allowed">&lt;</button>
                            <button className="w-8 h-8 rounded bg-[#6338f0] text-white flex items-center justify-center font-bold">1</button>
                            <button className="w-8 h-8 rounded border border-slate-700/50 flex items-center justify-center opacity-50 cursor-not-allowed">&gt;</button>
                            <select className="ml-2 bg-[#1a1c29] border border-slate-700/50 rounded-lg px-2 py-1.5 focus:outline-none">
                                <option>10 / page</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            <CreateTowerModal
                isOpen={isTowerModalOpen}
                initialData={editingTower}
                onClose={() => {
                    setIsTowerModalOpen(false);
                    setEditingTower(null);
                }}
            />

            <Modal
                isOpen={deleteConfirmModal.open}
                onClose={() => setDeleteConfirmModal({ open: false, type: null, tower: null })}
                title="Delete Tower"
                theme="dark"
            >
                <div className="p-4 space-y-4">
                    <p className="text-slate-400">
                        Are you sure you want to delete this tower?
                        <br /><br />
                        <strong>Warning:</strong> You can only delete a tower if it has <strong className="text-white">NO occupied units</strong>. Vacant units and floors will be permanently cascade-deleted.
                    </p>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="secondary" onClick={() => setDeleteConfirmModal({ open: false, type: null, tower: null })} className="bg-[#131525] border-slate-700 hover:text-white text-slate-300">Cancel</Button>
                        <Button
                            variant="danger"
                            onClick={handleDeleteTowerConfirm}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Confirm Delete
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
