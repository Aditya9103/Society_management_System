import React, { useState, useMemo } from 'react';
import { useGetMyNoticesQuery } from '../../../store/api/residentApi';
import { Search, Filter, Calendar, Bell, AlertTriangle, Clock, Pin, ChevronRight, Menu, Activity, RefreshCw } from 'lucide-react';
import { NoticeCard } from '../components/notices/NoticeCard';

const StatCard = ({ icon: Icon, title, value, subtitle, iconBg, iconColor, gradient, onClick }) => (
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
        
        <div className="relative z-10 flex items-start gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg} shrink-0 backdrop-blur-md`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <div>
                <p className="text-[12px] font-semibold text-white font-bold mb-0.5 tracking-wide">{title}</p>
                <div className="text-2xl font-bold text-white tracking-tight mb-1">{value}</div>
                <p className="text-[10px] text-white font-bold font-bold">{subtitle}</p>
            </div>
        </div>
    </div>
);

export default function ResidentNoticesPage() {
    const { data, isLoading, isError, refetch } = useGetMyNoticesQuery();

    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('All');

    const rawData = data?.data;
    const notices = Array.isArray(rawData?.data) ? rawData.data : (Array.isArray(rawData) ? rawData : []);

    // Derived Stats
    const totalNotices = notices.length;
    const unreadNotices = notices.filter(n => !n.hasAcknowledged && n.requiresAcknowledgement).length;
    const highPriority = notices.filter(n => n.priority === 'HIGH' || n.priority === 'URGENT').length;
    const thisMonth = notices.filter(n => {
        if (!n.publishedAt) return false;
        const pubDate = new Date(n.publishedAt);
        const now = new Date();
        return pubDate.getMonth() === now.getMonth() && pubDate.getFullYear() === now.getFullYear();
    }).length;

    // Categories available
    const categories = ['All', 'General', 'Urgent', 'Maintenance', 'Events', 'Updates'];

    // Category Counts
    const categoryCounts = {
        'All': totalNotices,
        'General': notices.filter(n => n.noticeType === 'GENERAL').length,
        'Urgent': notices.filter(n => n.priority === 'URGENT' || n.priority === 'HIGH').length,
        'Maintenance': notices.filter(n => n.noticeType === 'MAINTENANCE').length,
        'Events': notices.filter(n => n.noticeType === 'EVENT' || n.noticeType === 'MEETING').length,
        'Updates': notices.filter(n => !['GENERAL', 'MAINTENANCE', 'EVENT', 'MEETING'].includes(n.noticeType) && !['URGENT', 'HIGH'].includes(n.priority)).length
    };

    // Filter notices
    const filteredNotices = useMemo(() => {
        return notices.filter(n => {
            const matchesSearch = n.title?.toLowerCase().includes(searchQuery.toLowerCase()) || n.content?.toLowerCase().includes(searchQuery.toLowerCase());

            let matchesTab = true;
            if (activeTab !== 'All') {
                if (activeTab === 'Urgent') {
                    matchesTab = n.priority === 'URGENT' || n.priority === 'HIGH';
                } else if (activeTab === 'Maintenance') {
                    matchesTab = n.noticeType === 'MAINTENANCE';
                } else if (activeTab === 'Events') {
                    matchesTab = n.noticeType === 'EVENT' || n.noticeType === 'MEETING';
                } else if (activeTab === 'General') {
                    matchesTab = n.noticeType === 'GENERAL';
                } else if (activeTab === 'Updates') {
                    matchesTab = !['MAINTENANCE', 'EVENT', 'GENERAL', 'MEETING'].includes(n.noticeType) && !['URGENT', 'HIGH'].includes(n.priority);
                }
            }

            return matchesSearch && matchesTab;
        });
    }, [notices, searchQuery, activeTab]);

    const pinnedNotice = notices.find(n => n.isPinned);

    return (
        <div className="relative text-white p-4 lg:p-8 font-sans z-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Notice Board</h1>
                    <p className="hidden text-sm text-white font-bold">Stay informed with important announcements & updates from your society</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white font-bold" />
                        <input
                            type="text"
                            placeholder="Search notices..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-[#12131c] border border-slate-800 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 w-full md:w-64 transition-all"
                        />
                    </div>
                    <button className="h-10 w-10 flex items-center justify-center rounded-full bg-[#12131c] border border-slate-800 hover:border-purple-500/30 hover:bg-purple-500/10 transition-colors shrink-0">
                        <Filter className="h-4 w-4 text-white font-bold" />
                    </button>
                </div>
            </div>

            {/* Top Stats Row */}
            <div className="flex overflow-x-auto pb-4 gap-4 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] mb-4 md:mb-8">
                <div className="w-[85vw] sm:w-[250px] shrink-0 snap-start">
                <StatCard 
                    icon={Calendar}
                    title="Total Notices"
                    value={totalNotices}
                    subtitle="All time"
                    iconBg="bg-[#3e248a]/50"
                    iconColor="text-[#b388ff]"
                    gradient="from-[#2e1d5e]/80 to-[#1c1439]"
                    onClick={() => setActiveTab('All')}
                />
                </div>
                <div className="w-[85vw] sm:w-[250px] shrink-0 snap-start">
                <StatCard 
                    icon={Bell}
                    title="Unread"
                    value={unreadNotices}
                    subtitle="Need your attention"
                    iconBg="bg-[#1d488c]/50"
                    iconColor="text-[#60a5fa]"
                    gradient="from-[#143261]/80 to-[#0b1c36]"
                    onClick={() => setActiveTab('All')}
                />
                </div>
                <div className="w-[85vw] sm:w-[250px] shrink-0 snap-start">
                <StatCard 
                    icon={AlertTriangle}
                    title="High Priority"
                    value={highPriority}
                    subtitle="Important alerts"
                    iconBg="bg-[#6b1e28]/50"
                    iconColor="text-[#f87171]"
                    gradient="from-[#4a1216]/80 to-[#2b0a0d]"
                    onClick={() => setActiveTab('Urgent')}
                />
                </div>
                <div className="w-[85vw] sm:w-[250px] shrink-0 snap-start">
                <StatCard 
                    icon={Clock}
                    title="This Month"
                    value={thisMonth}
                    subtitle="New announcements"
                    iconBg="bg-[#1a4d35]/50"
                    iconColor="text-[#4ade80]"
                    gradient="from-[#123625]/80 to-[#0a1f15]"
                    onClick={() => setActiveTab('General')}
                />
                </div>
            </div>

            {/* Main Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column (Notices List) */}
                <div className="lg:col-span-8">

                    {/* Category Tabs */}
                    <div className="flex items-center overflow-x-auto gap-2 md:gap-3 px-4 md:px-0 mb-6 md:mb-8 snap-x pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveTab(cat)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-[12px] md:text-[13px] font-bold whitespace-nowrap transition-all snap-start ${activeTab === cat ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)] border border-purple-500' : 'bg-[#0f111a] text-white font-bold border border-slate-800 hover:bg-slate-800/50 hover:text-slate-200'}`}
                            >
                                {cat}
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] flex items-center justify-center ${activeTab === cat ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                    {categoryCounts[cat]}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Notices Stream */}
                    <div className="space-y-4 md:space-y-6">
                        {isLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-40 rounded-[20px] bg-slate-800/40 animate-pulse border border-slate-800/80"></div>
                                ))}
                            </div>
                        ) : filteredNotices.length > 0 ? (
                            filteredNotices.map(notice => (
                                <NoticeCard key={notice._id} notice={notice} />
                            ))
                        ) : (
                            <div className="text-center py-16 bg-[#0f111a] rounded-[24px] border border-slate-800">
                                <Bell className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                                <h3 className="text-lg font-bold text-white mb-1">No notices found</h3>
                                <p className="hidden md:block text-sm text-white font-bold">Try adjusting your filters or search query.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column (Widgets) */}
                <div className="lg:col-span-4 space-y-6 hidden lg:block">

                    {/* Pinned Notice Widget */}
                    {pinnedNotice && (
                        <div className="bg-gradient-to-br from-[#1c113b] to-[#0f0b20] border border-purple-500/30 rounded-[24px] p-5 relative overflow-hidden group shadow-[0_0_30px_rgba(168,85,247,0.1)]">
                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <div className="flex items-center gap-2">
                                    <Pin className="h-4 w-4 text-purple-400" />
                                    <span className="text-[13px] font-bold text-white">Pinned Notice</span>
                                </div>
                                <span className="text-[10px] text-purple-400/80 uppercase font-bold tracking-wider">View All</span>
                            </div>

                            <div className="relative z-10">
                                <h3 className="text-[17px] font-bold text-white mb-2 leading-tight">{pinnedNotice.title}</h3>
                                <p className="text-[13px] text-white font-bold line-clamp-2 leading-relaxed mb-4">{pinnedNotice.content ? pinnedNotice.content.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ') : ''}</p>
                                <p className="text-[11px] text-purple-300 font-bold">
                                    {pinnedNotice.publishedAt ? new Date(pinnedNotice.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Recently updated'}
                                </p>
                            </div>

                            {/* Decorative Clock / Background */}
                            <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-1/4 translate-y-1/4 pointer-events-none">
                                <Clock className="h-40 w-40 text-purple-500" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0b20] via-transparent to-transparent pointer-events-none z-0"></div>
                        </div>
                    )}

                    {/* Notice Categories */}
                    <div className="bg-[#0f111a] border border-slate-800/80 rounded-[24px] p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[15px] font-bold text-white">Notice Categories</h3>
                            <span className="text-[10px] text-purple-400 uppercase font-bold tracking-wider">View All</span>
                        </div>

                        <div className="space-y-2">
                            {[
                                { icon: Calendar, label: 'General', count: notices.filter(n => n.noticeType === 'GENERAL').length, color: 'text-purple-400' },
                                { icon: AlertTriangle, label: 'Maintenance', count: notices.filter(n => n.noticeType === 'MAINTENANCE').length, color: 'text-orange-400' },
                                { icon: Bell, label: 'Events', count: notices.filter(n => n.noticeType === 'EVENT' || n.noticeType === 'MEETING').length, color: 'text-blue-400' },
                                { icon: Activity, label: 'Urgent', count: notices.filter(n => n.priority === 'URGENT' || n.priority === 'HIGH').length, color: 'text-red-400' },
                                { icon: RefreshCw, label: 'Updates', count: notices.filter(n => !['GENERAL', 'MAINTENANCE', 'EVENT', 'MEETING'].includes(n.noticeType) && !['URGENT', 'HIGH'].includes(n.priority)).length, color: 'text-emerald-400' },
                            ].map((cat, idx) => (
                                <div key={idx} className="flex items-center justify-between py-2 cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <cat.icon className={`h-4 w-4 ${cat.color}`} />
                                        <span className="text-[13px] font-semibold text-white font-bold group-hover:text-white transition-colors">{cat.label}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-slate-500">{cat.count}</span>
                                        <ChevronRight className="h-3 w-3 text-slate-600 group-hover:text-purple-400 transition-colors" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-[#0f111a] border border-slate-800/80 rounded-[24px] p-5">
                        <h3 className="text-[15px] font-bold text-white mb-4">Recent Activity</h3>
                        <div className="space-y-4">
                            {notices.slice(0, 3).map((n, i) => (
                                <div key={n._id || i} className="flex gap-3 relative">
                                    {i !== 2 && <div className="absolute left-[3px] top-3 bottom-[-16px] w-[2px] bg-slate-800"></div>}
                                    <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 z-10 ${n.priority === 'URGENT' || n.priority === 'HIGH' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : n.noticeType === 'MAINTENANCE' ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]' : 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]'}`}></div>
                                    <div>
                                        <p className="text-[11px] font-semibold text-white font-bold mb-0.5">
                                            {n.noticeType === 'EVENT' ? 'New event scheduled' : n.noticeType === 'MAINTENANCE' ? 'Maintenance alert' : 'New notice posted'}
                                        </p>
                                        <p className="text-[13px] font-bold text-white line-clamp-1">{n.title}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full py-2.5 mt-5 rounded-[12px] bg-slate-800/50 hover:bg-slate-800 text-xs font-bold text-white font-bold transition-colors border border-slate-700/50">
                            View All Activity
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
