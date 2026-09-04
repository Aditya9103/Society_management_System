import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    Building2, 
    Edit2, 
    Plus, 
    ChevronRight, 
    Layers, 
    Grid, 
    PieChart,
    Settings,
    FileText,
    Activity,
    MoreVertical,
    Download,
    Trash2
} from 'lucide-react';
import { useListTowersQuery, useDeleteFloorMutation } from '../../../store/api/societyAdminApi';
import { Button } from '../../../components/ui/Button';
import CreateTowerModal from '../components/CreateTowerModal';
import FloorModal from '../components/towers/FloorModal';
import Modal from '../../../components/ui/Modal';
import Alert from '../../../components/ui/Alert';

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

export default function TowerDetailsPage() {
    const { towerId } = useParams();
    const navigate = useNavigate();
    const { data, isLoading } = useListTowersQuery();
    const [deleteFloor] = useDeleteFloorMutation();

    const [activeTab, setActiveTab] = useState('Overview');
    const [isTowerModalOpen, setIsTowerModalOpen] = useState(false);
    
    const [floorModal, setFloorModal] = useState({ open: false, floor: null });
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, floor: null });
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const towers = data?.data || [];
    const tower = towers.find(t => t._id === towerId);

    const floors = useMemo(() => {
        if (!tower?.floors) return [];
        return [...tower.floors].sort((a, b) => b.floorNumber - a.floorNumber);
    }, [tower]);

    const stats = useMemo(() => {
        if (!tower) return { totalFloors: 0, totalUnits: 0, occupancyRate: 0, unitsPerFloor: 0 };
        const totalUnits = tower.totalUnits || 0;
        const occupied = tower.occupiedUnits || 0;
        const occupancyRate = totalUnits > 0 ? Math.round((occupied / totalUnits) * 100) : 0;
        const unitsPerFloor = tower.defaultUnitsPerFloor || 0;
        return { totalFloors: tower.floorCount || 0, totalUnits, occupancyRate, unitsPerFloor };
    }, [tower]);

    const showSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 4000); };
    const showError = (msg) => { setErrorMsg(msg); setTimeout(() => setErrorMsg(''), 4000); };

    if (isLoading) {
        return <div className="p-8 text-center text-slate-400 animate-pulse">Loading tower details...</div>;
    }

    if (!tower) {
        return (
            <div className="p-10 flex flex-col items-center justify-center text-center">
                <Building2 className="w-12 h-12 text-slate-600 mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Tower Not Found</h2>
                <p className="text-slate-400 mb-6">The tower you are looking for does not exist or has been deleted.</p>
                <Button onClick={() => navigate('/admin/towers')}>Back to Towers</Button>
            </div>
        );
    }

    const handleDeleteFloorConfirm = async () => {
        try {
            await deleteFloor({ towerId: tower._id, floorId: deleteConfirm.floor._id }).unwrap();
            showSuccess('Floor deleted successfully');
        } catch (err) {
            showError(err?.data?.message || 'Failed to delete floor');
        } finally {
            setDeleteConfirm({ open: false, floor: null });
        }
    };

    const TABS = ['Overview', 'Floors', 'Units', 'Amenities', 'Reports', 'Activity Log', 'Settings'];

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-slate-400">
                <Link to="/admin/towers" className="hover:text-white transition-colors">Towers & Floors</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-slate-200 font-medium">{tower.name}</span>
            </div>

            {/* Header */}
            <div className="bg-[#1a1c29] border border-slate-800/50 rounded-2xl p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6338f0] to-[#5225e2] flex items-center justify-center shadow-lg shadow-[#6338f0]/20 shrink-0">
                        <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-1">{tower.name}</h1>
                        <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
                            <span className="flex items-center gap-1.5 text-slate-400 bg-slate-800/50 px-2.5 py-1 rounded-md border border-slate-700/50">
                                <span className="text-indigo-400">Code:</span> {tower.code}
                            </span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-300">{stats.totalFloors} Floors</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-300">{stats.unitsPerFloor} Units per floor</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <Button variant="secondary" className="flex-1 lg:flex-none bg-[#131525] border-slate-700 text-slate-300 hover:text-white" onClick={() => setIsTowerModalOpen(true)}>
                        <Edit2 className="w-4 h-4 mr-2" /> Edit Tower
                    </Button>
                    <Button className="flex-1 lg:flex-none bg-[#6338f0] hover:bg-[#5225e2] text-white" onClick={() => setFloorModal({ open: true, floor: null })}>
                        <Plus className="w-4 h-4 mr-2" /> Add Floor
                    </Button>
                </div>
            </div>

            {errorMsg && <Alert type="error">{errorMsg}</Alert>}
            {successMsg && <Alert type="success">{successMsg}</Alert>}

            {/* Navigation Tabs */}
            <div className="flex overflow-x-auto hide-scrollbar border-b border-slate-800">
                <div className="flex gap-6 px-2">
                    {TABS.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 text-sm font-bold whitespace-nowrap transition-colors relative ${activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#6338f0] rounded-t-full shadow-[0_-2px_10px_rgba(99,56,240,0.5)]" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* Main Content (Left, spans 2 cols on xl) */}
                <div className="xl:col-span-2 space-y-6">
                    {activeTab === 'Overview' && (
                        <>
                            {/* Tower Overview Cards */}
                            <div className="flex overflow-x-auto pb-4 gap-4 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] mb-4">
                                <div className="w-[calc(50vw-24px)] md:w-auto md:flex-1 shrink-0 snap-start">
                                    <StatCard 
                                        icon={Layers}
                                        title="Total Floors"
                                        value={stats.totalFloors}
                                        subtitle="In this tower"
                                        iconBg="bg-[#3e248a]/50"
                                        iconColor="text-[#b388ff]"
                                        gradient="from-[#2e1d5e]/80 to-[#1c1439]"
                                    />
                                </div>
                                <div className="w-[calc(50vw-24px)] md:w-auto md:flex-1 shrink-0 snap-start">
                                    <StatCard 
                                        icon={Grid}
                                        title="Total Units"
                                        value={stats.totalUnits}
                                        subtitle="Flats & shops"
                                        iconBg="bg-[#1d488c]/50"
                                        iconColor="text-[#60a5fa]"
                                        gradient="from-[#143261]/80 to-[#0b1c36]"
                                    />
                                </div>
                                <div className="w-[calc(50vw-24px)] md:w-auto md:flex-1 shrink-0 snap-start">
                                    <StatCard 
                                        icon={PieChart}
                                        title="Occupancy"
                                        value={`${stats.occupancyRate}%`}
                                        subtitle="Occupied units"
                                        iconBg="bg-[#6b1e28]/50"
                                        iconColor="text-[#f87171]"
                                        gradient="from-[#4a1216]/80 to-[#2b0a0d]"
                                    />
                                </div>
                                <div className="w-[calc(50vw-24px)] md:w-auto md:flex-1 shrink-0 snap-start">
                                    <StatCard 
                                        icon={Building2}
                                        title="Per Floor"
                                        value={stats.unitsPerFloor}
                                        subtitle="Default units"
                                        iconBg="bg-[#1a4d35]/50"
                                        iconColor="text-[#4ade80]"
                                        gradient="from-[#123625]/80 to-[#0a1f15]"
                                    />
                                </div>
                            </div>

                            {/* Floors Table */}
                            <div className="bg-[#1a1c29] border border-slate-800/50 rounded-2xl overflow-hidden">
                                <div className="p-5 border-b border-slate-800/50 flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-white">Floors</h3>
                                    <button className="text-[#6338f0] text-sm font-bold hover:text-indigo-400" onClick={() => setActiveTab('Floors')}>View All</button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-[#131525]/50 border-b border-slate-800/50">
                                                <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase">Floor Name</th>
                                                <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase">Type</th>
                                                <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase">Units</th>
                                                <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase">Occupancy</th>
                                                <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {floors.slice(0, 10).map((floor) => {
                                                const fOccupied = 0; // Mock until floor occupancy is added to API
                                                const fTotal = floor.totalUnits || 0;
                                                const fOccPercent = fTotal > 0 ? Math.round((fOccupied / fTotal) * 100) : 0;
                                                const isBasement = floor.floorNumber < 0;

                                                return (
                                                    <tr key={floor._id} className="border-b border-slate-800/30 hover:bg-[#202236]/50">
                                                        <td className="px-5 py-4 font-bold text-slate-200">
                                                            {floor.floorName}
                                                            {isBasement && <span className="ml-2 text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded uppercase tracking-wider">Basement</span>}
                                                        </td>
                                                        <td className="px-5 py-4 text-sm text-slate-400">{tower.buildingType || 'Residential'}</td>
                                                        <td className="px-5 py-4 font-medium text-slate-300">{fTotal} Units</td>
                                                        <td className="px-5 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                                    <div className="h-full bg-[#6338f0]" style={{ width: `${fOccPercent}%` }} />
                                                                </div>
                                                                <span className="text-xs font-bold text-slate-400">{fOccPercent}%</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button onClick={() => setFloorModal({ open: true, floor })} className="p-1.5 text-slate-500 hover:text-white bg-slate-800/50 hover:bg-slate-700 rounded transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                                                                <button onClick={() => setDeleteConfirm({ open: true, floor })} className="p-1.5 text-slate-500 hover:text-white bg-slate-800/50 hover:bg-red-900/50 hover:text-red-400 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                    {floors.length === 0 && <div className="p-6 text-center text-slate-500 text-sm">No floors created yet.</div>}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab !== 'Overview' && (
                        <div className="bg-[#1a1c29] border border-slate-800/50 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
                            <Settings className="w-12 h-12 text-slate-600 mb-4" />
                            <h2 className="text-xl font-bold text-white mb-2">{activeTab}</h2>
                            <p className="text-slate-400 max-w-sm">This section is currently under construction. Please check back later.</p>
                        </div>
                    )}
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                    {/* Tower Details Box */}
                    <div className="bg-[#1a1c29] border border-slate-800/50 rounded-2xl p-5">
                        <h3 className="text-lg font-bold text-white mb-4">Tower Details</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wider">Tower Name</div>
                                <div className="text-sm font-semibold text-slate-200">{tower.name}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wider">Short Code</div>
                                <div className="text-sm font-semibold text-slate-200">{tower.code}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wider">Description</div>
                                <div className="text-sm text-slate-300 leading-relaxed">{tower.description || 'No description provided.'}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wider">Building Type</div>
                                <div className="text-sm font-semibold text-slate-200">{tower.buildingType || 'Residential'}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wider">Created</div>
                                <div className="text-sm font-semibold text-slate-200">{new Date(tower.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                            </div>
                        </div>
                    </div>

                    {/* Amenities Box */}
                    <div className="bg-[#1a1c29] border border-slate-800/50 rounded-2xl p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white">Amenities in Tower</h3>
                        </div>
                        {tower.amenities && tower.amenities.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {tower.amenities.map((amenity, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-[#6338f0]/10 border border-[#6338f0]/30 text-indigo-300 rounded-lg text-sm font-medium">
                                        {amenity}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-slate-500 italic">No amenities specified.</div>
                        )}
                        <Button variant="secondary" className="w-full mt-4 bg-[#131525] border-slate-700 hover:bg-slate-800" onClick={() => setIsTowerModalOpen(true)}>Manage Amenities</Button>
                    </div>

                    {/* Quick Actions Box */}
                    <div className="bg-[#1a1c29] border border-slate-800/50 rounded-2xl p-5">
                        <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
                        <div className="space-y-2">
                            <button onClick={() => setActiveTab('Floors')} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#202236] transition-colors text-slate-300 hover:text-white group">
                                <div className="flex items-center gap-3"><Layers className="w-4 h-4 text-slate-500 group-hover:text-blue-400" /> <span className="text-sm font-semibold">View All Floors</span></div>
                                <ChevronRight className="w-4 h-4 text-slate-600" />
                            </button>
                            <button onClick={() => setActiveTab('Units')} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#202236] transition-colors text-slate-300 hover:text-white group">
                                <div className="flex items-center gap-3"><Grid className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" /> <span className="text-sm font-semibold">View All Units</span></div>
                                <ChevronRight className="w-4 h-4 text-slate-600" />
                            </button>
                            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#202236] transition-colors text-slate-300 hover:text-white group">
                                <div className="flex items-center gap-3"><Download className="w-4 h-4 text-slate-500 group-hover:text-indigo-400" /> <span className="text-sm font-semibold">Download Report</span></div>
                            </button>
                            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-900/10 hover:border-red-900/30 border border-transparent transition-colors text-slate-300 hover:text-red-400 group">
                                <div className="flex items-center gap-3"><Trash2 className="w-4 h-4 text-slate-500 group-hover:text-red-400" /> <span className="text-sm font-semibold">Delete Tower</span></div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <CreateTowerModal
                isOpen={isTowerModalOpen}
                initialData={tower}
                onClose={() => setIsTowerModalOpen(false)}
            />

            {floorModal.open && (
                <FloorModal
                    isOpen={floorModal.open}
                    onClose={() => setFloorModal({ open: false, floor: null })}
                    tower={tower}
                    floor={floorModal.floor}
                />
            )}

            <Modal isOpen={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, floor: null })} title="Delete Floor" theme="dark">
                <div className="p-4 space-y-4">
                    <p className="text-slate-400">Are you sure you want to delete floor "{deleteConfirm.floor?.floorName}"?</p>
                    <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => setDeleteConfirm({ open: false, floor: null })} className="bg-[#131525] border-slate-700 hover:text-white text-slate-300">Cancel</Button>
                        <Button variant="danger" className="bg-red-600 text-white hover:bg-red-700" onClick={handleDeleteFloorConfirm}>Delete</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
