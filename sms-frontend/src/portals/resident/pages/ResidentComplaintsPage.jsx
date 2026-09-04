import React, { useState, useMemo } from 'react';
import { useGetMyComplaintsQuery } from '../../../store/api/residentApi';
import { Plus, Search, Filter, HeadphonesIcon, ShieldAlert, ArrowUpRight, CheckCircle2, Clock, AlertTriangle, MessageSquareWarning, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RaiseComplaintModal } from '../components/complaints/RaiseComplaintModal';
import ComplaintCard from '../../../components/ui/ComplaintCard';
import Pagination from '../../../components/ui/Pagination';
import { Button } from '../../../components/ui/Button';

// ── Dashboard Widgets ────────────────────────────────────────────────────────

const Sparkline = ({ data, color }) => {
    if (!data || data.length === 0) return null;
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min;
    const stepX = 100 / (data.length - 1);
    
    const points = data.map((val, i) => {
        const x = i * stepX;
        const y = 100 - ((val - min) / (range || 1)) * 100;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg viewBox="0 -10 100 120" className="w-full h-8 overflow-visible mt-2" preserveAspectRatio="none">
            <polyline points={points} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {data.map((val, i) => {
                const x = i * stepX;
                const y = 100 - ((val - min) / (range || 1)) * 100;
                return (
                    <circle key={i} cx={x} cy={y} r="3" fill="#0f111a" stroke={color} strokeWidth="2" />
                );
            })}
        </svg>
    );
};

const StatCard = ({ icon: Icon, title, value, subtitle, color, bg, border, sparklineData, sparklineColor, gradient = "from-[#1e293b]/80 to-[#0f172a]", onClick }) => (
    <div 
        onClick={onClick}
        className={`relative overflow-hidden rounded-[20px] bg-gradient-to-br ${gradient} border border-white/5 p-5 flex flex-col justify-between transition-transform hover:scale-[1.02] shadow-lg ${onClick ? 'cursor-pointer' : ''}`}
    >
        {/* Abstract Background Waves (CSS based) */}
        <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none">
            <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 80C30 50 60 80 120 20L120 80H0Z" fill="currentColor" className="text-white" />
                <path d="M20 80C50 40 80 70 120 0L120 80H20Z" fill="currentColor" className="text-white opacity-50" />
            </svg>
        </div>
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${bg} ${border} border shrink-0 backdrop-blur-md`}>
                <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div>
                <p className="text-[11px] sm:text-[12px] font-semibold text-white mb-0.5 tracking-wide line-clamp-1">{title}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{value}</h3>
                </div>
                <p className="text-[9px] sm:text-[10px] text-white/80 mt-0.5 font-bold line-clamp-1">{subtitle}</p>
            </div>
        </div>
        <div className="relative z-10">
            {sparklineData && <Sparkline data={sparklineData} color={sparklineColor} />}
        </div>
    </div>
);

// ── Main Page Component ──────────────────────────────────────────────────────

export default function ResidentComplaintsPage() {
    // Fetch up to 100 to ensure we have enough data to chart accurately
    const { data, isLoading, isError, refetch } = useGetMyComplaintsQuery({ limit: 100 });
    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    const complaints = data?.data ?? [];

    // Dashboard Calculations
    const total = complaints.length;
    const open = complaints.filter(c => ['OPEN', 'ASSIGNED', 'PENDING_RESIDENT'].includes(c.status)).length;
    const inProgress = complaints.filter(c => c.status === 'IN_PROGRESS').length;
    const resolved = complaints.filter(c => ['RESOLVED', 'CLOSED'].includes(c.status)).length;
    
    // Calculate trend data for sparklines (last 7 days volume)
    const getTrendData = (statusFilter) => {
        const trend = Array(7).fill(0);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        
        complaints.forEach(c => {
            if (statusFilter && !statusFilter.includes(c.status)) return;
            const created = new Date(c.createdAt);
            const diffTime = today - created;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays >= 0 && diffDays < 7) {
                trend[6 - diffDays]++;
            }
        });
        
        // Add a slight baseline so the SVG always renders a line even if all 0
        return trend.map(v => v + 0.1); 
    };
    
    const stats = [
        { title: 'Total Complaints', value: total, subtitle: 'All time', icon: MessageSquareWarning, color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/30', sparklineData: getTrendData(null), sparklineColor: '#a855f7', gradient: 'from-[#2e1d5e]/80 to-[#1c1439]', onClick: () => setActiveTab('All') },
        { title: 'Open', value: open, subtitle: 'Needs attention', icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30', sparklineData: getTrendData(['OPEN', 'ASSIGNED', 'PENDING_RESIDENT']), sparklineColor: '#f87171', gradient: 'from-[#4a1216]/80 to-[#2b0a0d]', onClick: () => setActiveTab('Open') },
        { title: 'In Progress', value: inProgress, subtitle: 'Being resolved', icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/30', sparklineData: getTrendData(['IN_PROGRESS']), sparklineColor: '#fb923c', gradient: 'from-[#4a3212]/80 to-[#261909]', onClick: () => setActiveTab('In Progress') },
        { title: 'Resolved', value: resolved, subtitle: 'Completed', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', sparklineData: getTrendData(['RESOLVED', 'CLOSED']), sparklineColor: '#34d399', gradient: 'from-[#123625]/80 to-[#0a1f15]', onClick: () => setActiveTab('Resolved') },
    ];

    const tabs = [
        { id: 'All', label: 'All', count: total },
        { id: 'Open', label: 'Open', count: open },
        { id: 'In Progress', label: 'In Progress', count: inProgress },
        { id: 'Resolved', label: 'Resolved', count: resolved },
        { id: 'Closed', label: 'Closed', count: complaints.filter(c => c.status === 'CLOSED').length },
    ];

    const filteredComplaints = useMemo(() => {
        let result = complaints;
        if (activeTab !== 'All') {
            if (activeTab === 'Open') result = result.filter(c => ['OPEN', 'ASSIGNED', 'PENDING_RESIDENT'].includes(c.status));
            else if (activeTab === 'In Progress') result = result.filter(c => c.status === 'IN_PROGRESS');
            else if (activeTab === 'Resolved') result = result.filter(c => c.status === 'RESOLVED');
            else if (activeTab === 'Closed') result = result.filter(c => c.status === 'CLOSED');
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(c => c.title.toLowerCase().includes(q) || c.complaintNumber.toLowerCase().includes(q) || c.category.toLowerCase().includes(q));
        }

        // Apply Sorting
        const priorityScore = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1, DRAFT: 0 };
        result = [...result].sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
            if (sortBy === 'priority-desc') return (priorityScore[b.priority] || 0) - (priorityScore[a.priority] || 0);
            if (sortBy === 'priority-asc') return (priorityScore[a.priority] || 0) - (priorityScore[b.priority] || 0);
            return 0;
        });

        return result;
    }, [complaints, activeTab, searchQuery, sortBy]);

    // Donut Chart logic
    const calcDashOffset = (percent, circumference) => circumference - (percent / 100) * circumference;
    const r = 40;
    const circ = 2 * Math.PI * r;
    const pOpen = total ? (open / total) * 100 : 0;
    const pProg = total ? (inProgress / total) * 100 : 0;
    const pRes = total ? (resolved / total) * 100 : 0;

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20 md:pb-8">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 w-full">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2 tracking-tight">Complaints</h1>
                    <p className="hidden md:block text-slate-400 text-sm">Raise, track and resolve issues in your society</p>
                </div>
                
                <div className="flex w-full md:w-auto items-center gap-3">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input 
                            type="text" 
                            placeholder="Search complaints..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#0f111a] border border-slate-800 text-white text-[13px] rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-slate-600"
                        />
                    </div>
                    <button className="h-[42px] w-[42px] rounded-xl bg-[#0f111a] border border-slate-800 flex items-center justify-center text-white font-bold hover:text-white hover:border-slate-700 transition-colors shrink-0">
                        <Filter className="h-4 w-4" />
                    </button>
                    <button onClick={() => setShowModal(true)} className="h-[42px] px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-[13px] font-bold flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(147,51,234,0.3)] shrink-0">
                        <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Raise Complaint</span>
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="flex overflow-x-auto pb-4 gap-4 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {stats.map((s, i) => (
                    <div key={i} className="w-[calc(50vw-24px)] md:w-auto md:flex-1 shrink-0 snap-start">
                        <StatCard {...s} />
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Column */}
                <div className="lg:col-span-8 space-y-6">
                    
                    {/* Hero Banner */}
                    <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-indigo-950/40 via-purple-900/20 to-[#0f111a] border border-indigo-500/20 p-6 md:p-8 flex items-center justify-between shadow-[0_0_30px_rgba(79,70,229,0.1)]">
                        <div className="absolute left-0 top-0 bottom-0 w-1/3 opacity-30 pointer-events-none mix-blend-screen">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0f111a] z-10"></div>
                            <img src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&q=80" alt="Maintenance" className="w-full h-full object-cover" />
                        </div>
                        
                        <div className="relative z-10 w-full flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            <div className="max-w-sm">
                                <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Facing an issue?</h2>
                                <p className="text-[13px] text-indigo-200/70 leading-relaxed">Let us know and we'll get it resolved as quickly as possible by our maintenance team.</p>
                            </div>
                            <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
                                <button onClick={() => setShowModal(true)} className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-bold flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(79,70,229,0.4)]">
                                    <Plus className="h-4 w-4" /> Raise a New Complaint
                                </button>
                                <span className="text-[11px] text-indigo-400/80 font-bold hidden sm:flex items-center gap-1.5"><Clock className="h-3 w-3" /> Usually responded in 24 hrs</span>
                            </div>
                        </div>
                    </div>

                    {/* Tabs & Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0f111a] p-2 rounded-[0px] md:rounded-[20px] border-y md:border border-slate-800">
                        <div className="flex items-center overflow-x-auto gap-1 snap-x no-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold whitespace-nowrap transition-all snap-start ${activeTab === tab.id ? 'bg-slate-800 text-white shadow-md' : 'text-white font-bold hover:text-slate-200 hover:bg-slate-800/50'}`}
                                >
                                    {tab.label}
                                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] flex items-center justify-center ${activeTab === tab.id ? 'bg-slate-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                        {tab.count}
                                    </span>
                                </button>
                            ))}
                        </div>
                        <div className="hidden sm:flex items-center relative shrink-0 border-l border-slate-800 ml-2 pl-4">
                            <select 
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-transparent text-[12px] font-bold text-white font-bold hover:text-white focus:outline-none cursor-pointer appearance-none pr-5 z-10"
                            >
                                <option value="newest" className="bg-slate-900">Newest First</option>
                                <option value="oldest" className="bg-slate-900">Oldest First</option>
                                <option value="priority-desc" className="bg-slate-900">Priority: High to Low</option>
                                <option value="priority-asc" className="bg-slate-900">Priority: Low to High</option>
                            </select>
                            <ChevronDown className="h-3.5 w-3.5 text-slate-500 absolute right-0 pointer-events-none" />
                        </div>
                    </div>

                    {/* Complaint Stream */}
                    {isLoading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => <div key={i} className="h-32 animate-pulse rounded-[20px] bg-slate-800/50 border border-slate-800" />)}
                        </div>
                    ) : filteredComplaints.length === 0 ? (
                        <div className="rounded-[20px] border border-dashed border-slate-700 p-10 flex flex-col items-center justify-center text-center">
                            <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                                <Search className="h-5 w-5 text-slate-500" />
                            </div>
                            <h3 className="text-[15px] font-bold text-white mb-1">No complaints found</h3>
                            <p className="text-[13px] text-slate-500">You don't have any complaints matching this filter.</p>
                        </div>
                    ) : (
                        <div className="space-y-0 md:space-y-4">
                            {filteredComplaints.map(c => (
                                <div key={c._id} className="border-b md:border-none border-slate-800">
                                    <ComplaintCard complaint={c} linkPrefix="/resident/complaints" />
                                </div>
                            ))}
                        </div>
                    )}

                </div>

                {/* Right Column */}
                <div className="lg:col-span-4 space-y-6">
                    
                    {/* Complaint Overview Widget */}
                    <div className="rounded-[24px] bg-[#0f111a] border border-slate-800 p-6">
                        <h3 className="text-[15px] font-bold text-white mb-6">Complaint Overview</h3>
                        
                        <div className="flex items-center justify-center mb-8 relative">
                            <svg className="w-40 h-40 transform -rotate-90">
                                {/* Track */}
                                <circle cx="80" cy="80" r={r} fill="none" stroke="#1e293b" strokeWidth="12" />
                                {/* Resolved (Green) */}
                                <circle cx="80" cy="80" r={r} fill="none" stroke="#10b981" strokeWidth="12" strokeDasharray={circ} strokeDashoffset={calcDashOffset(pRes, circ)} strokeLinecap="round" className="transition-all duration-1000" />
                                {/* In Progress (Orange) - offset by resolved */}
                                <circle cx="80" cy="80" r={r} fill="none" stroke="#f59e0b" strokeWidth="12" strokeDasharray={circ} strokeDashoffset={calcDashOffset(pProg, circ)} transform={`rotate(${(pRes/100)*360} 80 80)`} strokeLinecap="round" className="transition-all duration-1000" />
                                {/* Open (Red) - offset by resolved + in progress */}
                                <circle cx="80" cy="80" r={r} fill="none" stroke="#ef4444" strokeWidth="12" strokeDasharray={circ} strokeDashoffset={calcDashOffset(pOpen, circ)} transform={`rotate(${((pRes + pProg)/100)*360} 80 80)`} strokeLinecap="round" className="transition-all duration-1000" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-bold text-white">{total}</span>
                                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Total</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-[13px]">
                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div><span className="text-white font-bold">Open</span></div>
                                <span className="font-bold text-white">{open} <span className="text-slate-500 text-[11px] font-normal ml-1">({Math.round(pOpen)}%)</span></span>
                            </div>
                            <div className="flex items-center justify-between text-[13px]">
                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]"></div><span className="text-white font-bold">In Progress</span></div>
                                <span className="font-bold text-white">{inProgress} <span className="text-slate-500 text-[11px] font-normal ml-1">({Math.round(pProg)}%)</span></span>
                            </div>
                            <div className="flex items-center justify-between text-[13px]">
                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div><span className="text-white font-bold">Resolved</span></div>
                                <span className="font-bold text-white">{resolved} <span className="text-slate-500 text-[11px] font-normal ml-1">({Math.round(pRes)}%)</span></span>
                            </div>
                        </div>
                    </div>

                    {/* Need Help Widget */}
                    <div className="rounded-[24px] bg-gradient-to-br from-indigo-950/40 to-[#0f111a] border border-indigo-500/20 p-6 shadow-[0_0_30px_rgba(79,70,229,0.05)] text-center relative overflow-hidden">
                        <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-indigo-500/20 rounded-full blur-[40px]"></div>
                        <h3 className="text-[15px] font-bold text-white mb-2 relative z-10 text-left">Need Help?</h3>
                        <div className="flex items-center gap-4 text-left relative z-10 mb-5 mt-4">
                            <div className="h-12 w-12 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                                <HeadphonesIcon className="h-5 w-5 text-indigo-400" />
                            </div>
                            <p className="text-[12px] text-indigo-200/70 leading-relaxed">Our support team is here to help you with complex issues.</p>
                        </div>
                        <Link to="/resident/emergency" className="block w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-bold transition-colors shadow-[0_0_15px_rgba(79,70,229,0.4)] relative z-10">
                            Contact Support
                        </Link>
                    </div>

                    {/* Notice SOS Widget */}
                    <div className="rounded-[24px] bg-gradient-to-br from-red-950/40 to-[#0f111a] border border-red-500/20 p-6 shadow-[0_0_30px_rgba(239,68,68,0.05)] text-center relative overflow-hidden">
                        <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-red-500/20 rounded-full blur-[40px]"></div>
                        <div className="flex items-center gap-2 mb-2 relative z-10 text-left">
                            <ShieldAlert className="h-4 w-4 text-red-400" />
                            <h3 className="text-[15px] font-bold text-white">Emergency</h3>
                        </div>
                        <div className="flex items-center gap-4 text-left relative z-10 mb-5 mt-4">
                            <div className="h-12 w-12 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center shrink-0">
                                <AlertTriangle className="h-5 w-5 text-red-400" />
                            </div>
                            <p className="text-[12px] text-red-200/70 leading-relaxed">For urgent emergencies, please use the SOS button for faster assistance.</p>
                        </div>
                        <Link to="/resident/emergency" className="block w-full py-2.5 rounded-xl bg-transparent border border-red-500/30 hover:bg-red-500/10 text-red-400 text-[13px] font-bold transition-colors relative z-10 text-center">
                            Go to SOS
                        </Link>
                    </div>

                </div>
            </div>

            {showModal && <RaiseComplaintModal onClose={() => { setShowModal(false); refetch(); }} />}

            {/* Mobile FAB */}
            <button 
                onClick={() => setShowModal(true)}
                className="lg:hidden fixed bottom-20 right-4 h-14 w-14 rounded-full bg-purple-600 shadow-[0_0_20px_rgba(147,51,234,0.5)] flex items-center justify-center text-white z-40 active:scale-95 transition-transform"
            >
                <Plus className="h-6 w-6" />
            </button>
        </div>
    );
}
