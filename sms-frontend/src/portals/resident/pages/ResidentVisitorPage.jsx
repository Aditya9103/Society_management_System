import React, { useState } from 'react';
import { useGetMyVisitorsQuery } from '../../../store/api/residentApi';
import { Plus, Users, Clock, ShieldCheck, ChevronRight, UserCheck } from 'lucide-react';
import { AddVisitorModal } from '../components/visitors/AddVisitorModal';
import { VisitorCard } from '../components/visitors/VisitorCard';

export default function ResidentVisitorPage() {
    const { data, isLoading, isError, refetch, isFetching } = useGetMyVisitorsQuery();
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState('ALL'); // ALL, UPCOMING, ACTIVE, COMPLETED, CANCELLED
    
    const visitors = data?.data ?? [];

    const filteredVisitors = visitors.filter(v => {
        if (filter === 'ALL') return true;
        return v.status === filter;
    });

    // Mock Stats (You might want to calculate these from actual data if available)
    const stats = [
        { icon: <Users className="w-5 h-5 text-[#b388ff]" />, label: 'Total Passes', value: '28', sublabel: 'This Month', iconBg: 'bg-[#3e248a]/50 backdrop-blur-md', gradient: 'from-[#2e1d5e]/80 to-[#1c1439]' },
        { icon: <Users className="w-5 h-5 text-[#2dd4bf]" />, label: 'Active Passes', value: '12', sublabel: 'Currently Active', iconBg: 'bg-[#0f3d38]/50 backdrop-blur-md', gradient: 'from-[#0b2926]/80 to-[#051413]' },
        { icon: <Clock className="w-5 h-5 text-[#f59e0b]" />, label: "Today's Entries", value: '5', sublabel: 'Today', iconBg: 'bg-[#6b4819]/50 backdrop-blur-md', gradient: 'from-[#4a3212]/80 to-[#261909]' },
        { icon: <ShieldCheck className="w-5 h-5 text-[#4ade80]" />, label: 'Approved', value: '24', sublabel: 'This Month', iconBg: 'bg-[#1a4d35]/50 backdrop-blur-md', gradient: 'from-[#123625]/80 to-[#0a1f15]' },
    ];

    const tabs = [
        { id: 'ALL', label: 'All Passes', count: 28 },
        { id: 'UPCOMING', label: 'Upcoming', count: 7 },
        { id: 'ACTIVE', label: 'Active', count: 12 },
        { id: 'COMPLETED', label: 'Completed', count: 16 },
        { id: 'CANCELLED', label: 'Cancelled', count: 3 },
    ];

    return (
        <div className="relative p-4 lg:p-8 font-sans z-10">
            <div className="max-w-[1400px] mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2 tracking-tight">Visitor Passes</h1>
                        <p className="text-white font-bold text-sm">Create, manage and track all your visitor entries</p>
                    </div>
                    <button 
                        onClick={() => setShowModal(true)}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-purple-900/20"
                    >
                        <Plus className="w-5 h-5" /> Invite Visitor
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat, idx) => (
                        <div key={idx} className={`relative overflow-hidden rounded-[20px] bg-gradient-to-br ${stat.gradient} border border-white/5 p-5 flex flex-col justify-between transition-transform hover:scale-[1.02] shadow-lg`}>
                            {/* Abstract Background Waves (CSS based) */}
                            <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none">
                                <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M0 80C30 50 60 80 120 20L120 80H0Z" fill="currentColor" className="text-white" />
                                    <path d="M20 80C50 40 80 70 120 0L120 80H20Z" fill="currentColor" className="text-white opacity-50" />
                                </svg>
                            </div>
                            
                            <div className="relative z-10 flex items-start gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.iconBg}`}>
                                    {stat.icon}
                                </div>
                                <div>
                                    <p className="text-[12px] font-semibold text-white font-bold mb-0.5 tracking-wide">{stat.label}</p>
                                    <p className="text-white text-2xl font-bold leading-none mb-1 tracking-tight">{stat.value}</p>
                                    <p className="text-white font-bold text-[10px] font-bold">{stat.sublabel}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Tabs */}
                        <div className="flex overflow-x-auto pb-2 scrollbar-hide space-x-2">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setFilter(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap
                                        ${filter === tab.id ? 'bg-[#1e1a33] text-purple-400 border border-purple-500/30' : 'bg-[#151822] text-white font-bold border border-transparent hover:bg-slate-800'}`}
                                >
                                    {tab.label}
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${filter === tab.id ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-500'}`}>
                                        {tab.count}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* List */}
                        <div className="space-y-4">
                            {isLoading ? (
                                [...Array(3)].map((_, i) => <div key={i} className="h-32 animate-pulse rounded-[20px] bg-slate-800/50" />)
                            ) : isError ? (
                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">Failed to load visitors. <button onClick={refetch} className="underline ml-1">Retry</button></div>
                            ) : filteredVisitors.length === 0 ? (
                                <div className="rounded-[20px] border border-dashed border-slate-700 p-10 flex flex-col items-center justify-center text-center">
                                    <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                                        <UserCheck className="h-5 w-5 text-slate-500" />
                                    </div>
                                    <h3 className="text-[15px] font-bold text-white mb-1">No passes found</h3>
                                    <p className="text-[13px] text-slate-500">You don't have any passes matching this filter.</p>
                                </div>
                            ) : (
                                filteredVisitors.map(v => <VisitorCard key={v._id} visitor={v} />)
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Invite Widget */}
                        <div className="bg-gradient-to-b from-[#1a142e] to-[#120f22] border border-[#2d2449] rounded-3xl p-6 text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[40px] rounded-full"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 blur-[40px] rounded-full"></div>
                            
                            <div className="w-16 h-16 mx-auto bg-purple-500/20 rounded-2xl flex items-center justify-center mb-4 border border-purple-500/30">
                                <ShieldCheck className="w-8 h-8 text-purple-400" />
                            </div>
                            <h3 className="text-white text-lg font-bold mb-2">Invite with Ease</h3>
                            <p className="text-white font-bold text-sm mb-6 leading-relaxed">Send digital passes to your guests and let them in with QR code verification.</p>
                            <button 
                                onClick={() => setShowModal(true)}
                                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-900/20"
                            >
                                <Plus className="w-5 h-5" /> Invite Visitor
                            </button>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-[#151822] border border-slate-800 rounded-3xl p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-white font-bold">Recent Activity</h3>
                            </div>
                            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-800 before:to-transparent">
                                
                                {visitors.length === 0 ? (
                                    <p className="text-slate-500 text-sm text-center py-4 relative z-10">No recent activity</p>
                                ) : (
                                    [...visitors].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)).slice(0, 4).map((v, idx) => {
                                        let icon, bgColor, borderColor, actionText, timeStr;
                                        
                                        const timeDate = new Date(v.updatedAt || v.createdAt || v.expectedArrival);
                                        timeStr = timeDate.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

                                        switch(v.status) {
                                            case 'ACTIVE':
                                                icon = <div className="w-2 h-2 rounded-full bg-emerald-500"></div>;
                                                bgColor = 'bg-emerald-500/20';
                                                borderColor = 'border-emerald-500';
                                                actionText = 'Checked in at Main Gate';
                                                break;
                                            case 'COMPLETED':
                                                icon = <div className="w-2 h-2 rounded-full bg-blue-500"></div>;
                                                bgColor = 'bg-blue-500/20';
                                                borderColor = 'border-blue-500';
                                                actionText = 'Checked out';
                                                break;
                                            case 'CANCELLED':
                                                icon = <div className="w-2 h-2 rounded-full bg-red-500"></div>;
                                                bgColor = 'bg-red-500/20';
                                                borderColor = 'border-red-500';
                                                actionText = 'Pass cancelled';
                                                break;
                                            default: // PENDING / APPROVED
                                                icon = <Plus className="w-3 h-3 text-purple-400" />;
                                                bgColor = 'bg-purple-500/20';
                                                borderColor = 'border-purple-500';
                                                actionText = 'Pass created';
                                                break;
                                        }

                                        return (
                                            <div key={v._id || idx} className="relative flex items-start gap-4">
                                                <div className={`w-6 h-6 rounded-full ${bgColor} border ${borderColor} flex items-center justify-center z-10`}>
                                                    {icon}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-200">{v.visitorName}</p>
                                                    <p className="text-xs text-white font-bold mt-0.5">{actionText}</p>
                                                    <p className="text-[10px] text-slate-500 mt-1">{timeStr}</p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}

                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {showModal && <AddVisitorModal onClose={() => { setShowModal(false); refetch(); }} />}
        </div>
    );
}
