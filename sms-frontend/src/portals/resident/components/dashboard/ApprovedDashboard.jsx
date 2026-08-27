import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetNotificationsQuery, useMarkAsReadMutation } from '../../../../store/api/notificationApi';
import { formatDistanceToNow } from 'date-fns';
import { 
    MessageSquareWarning, Users, Receipt, Bell, 
    ShieldAlert, Building2, Car, FileText, 
    ChevronRight, UserCheck, Search, Plus, ChevronDown, MessageCircle, Megaphone,
    Shield, Leaf, Siren, Pencil, Coffee, Folder
} from 'lucide-react';
import { CommandPaletteModal } from './CommandPaletteModal';
import { WeatherWidget } from './WeatherWidget';

export function ApprovedDashboard({ profile, user }) {
    const navigate = useNavigate();
    const societyName = profile?.societyId?.name || 'Green Valley Apartment';
    const city = profile?.societyId?.city || 'Delhi';

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    // State for dropdowns and modals
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const notifRef = useRef(null);
    const quickActionRef = useRef(null);

    // Global Search Cmd+K Listener
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Notifications data
    const { data: notifData } = useGetNotificationsQuery();
    const [markAsRead] = useMarkAsReadMutation();
    
    // Safely extract notifications array depending on API response structure
    const rawList = notifData?.data?.data || notifData?.data;
    const notifications = Array.isArray(rawList) ? rawList : [];
    const unreadCount = notifData?.data?.unreadCount || notifData?.unreadCount || 0;

    // Handle outside clicks for dropdowns
    useEffect(() => {
        function handleClickOutside(event) {
            if (notifRef.current && !notifRef.current.contains(event.target)) setIsNotifOpen(false);
            if (quickActionRef.current && !quickActionRef.current.contains(event.target)) setIsQuickActionOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="space-y-8 pb-6 relative z-10">
            {/* ── Top Banner ──────────────────────── */}
            <div className="relative rounded-3xl -mx-4 sm:mx-0 -mt-4 sm:mt-0">
                <div className="relative z-10 p-4 sm:px-6 sm:py-5">
                    {/* Top Toolbar */}
                    <div className="flex items-center justify-between mb-6 sm:mb-8">

                        {/* Search Bar */}
                        <div className="flex-1 max-w-md mx-auto sm:ml-0 sm:mr-8">
                            <button 
                                onClick={() => setIsSearchOpen(true)}
                                className="relative flex items-center w-full h-10 rounded-xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-md px-3 group hover:border-purple-500/50 transition-colors cursor-text text-left"
                            >
                                <Search size={18} className="text-slate-400 mr-2" />
                                <span className="w-full bg-transparent text-sm text-slate-400">Search anything...</span>
                                <div className="hidden sm:flex items-center justify-center bg-slate-800 rounded px-1.5 py-0.5 text-[10px] font-bold text-slate-400 border border-slate-700">
                                    ⌘K
                                </div>
                            </button>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-3 sm:gap-4">
                            {/* Notifications */}
                            <div className="relative" ref={notifRef}>
                                <button 
                                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                                    className="relative flex items-center justify-center h-10 w-10 rounded-xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-md text-slate-300 hover:text-white transition-colors"
                                >
                                    <Bell size={18} />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-[#0b0c10]">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* Dropdown Menu */}
                                {isNotifOpen && (
                                    <div className="absolute right-0 mt-2 w-80 max-h-[400px] overflow-y-auto bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl z-50">
                                        <div className="p-4 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-900/95 backdrop-blur z-10">
                                            <h3 className="font-bold text-white">Notifications</h3>
                                            {unreadCount > 0 && <span className="text-xs text-indigo-400 font-semibold">{unreadCount} unread</span>}
                                        </div>
                                        {notifications.length === 0 ? (
                                            <div className="p-6 text-center text-slate-500 text-sm">No new notifications</div>
                                        ) : (
                                            <div className="flex flex-col">
                                                {notifications.map(notif => (
                                                    <div 
                                                        key={notif._id} 
                                                        onClick={() => { if (!notif.readAt) markAsRead(notif._id); }}
                                                        className={`p-4 border-b border-slate-800/50 cursor-pointer hover:bg-slate-800/50 transition-colors ${!notif.readAt ? 'bg-indigo-500/5' : ''}`}
                                                    >
                                                        <div className="flex justify-between items-start mb-1">
                                                            <span className="text-sm font-semibold text-slate-200">{notif.title}</span>
                                                            <span className="text-[10px] text-slate-500 shrink-0 ml-2">{formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}</span>
                                                        </div>
                                                        <p className="text-xs text-slate-400 line-clamp-2">{notif.body}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Quick Actions */}
                            <div className="relative" ref={quickActionRef}>
                                <button 
                                    onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
                                    className="hidden sm:flex items-center gap-2 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all"
                                >
                                    <Plus size={16} />
                                    Quick Action
                                    <ChevronDown size={14} className={`ml-1 opacity-80 transition-transform ${isQuickActionOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown Menu */}
                                {isQuickActionOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl z-50 p-2 flex flex-col gap-1">
                                        <button onClick={() => { navigate('/resident/amenities'); setIsQuickActionOpen(false); }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-sm text-slate-300 hover:text-white transition-colors text-left">
                                            <Coffee size={16} className="text-fuchsia-400" /> Book Amenity
                                        </button>
                                        <button onClick={() => { navigate('/resident/visitors'); setIsQuickActionOpen(false); }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-sm text-slate-300 hover:text-white transition-colors text-left">
                                            <UserCheck size={16} className="text-emerald-400" /> Pre-approve Visitor
                                        </button>
                                        <button onClick={() => { navigate('/resident/complaints'); setIsQuickActionOpen(false); }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-sm text-slate-300 hover:text-white transition-colors text-left">
                                            <MessageCircle size={16} className="text-rose-400" /> Raise Complaint
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Greeting & Weather */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                        <div className="drop-shadow-md">
                            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1.5 flex items-center gap-3">
                                {getGreeting()}, {user?.firstName}! <span className="animate-bounce inline-block origin-bottom-right">👋</span>
                            </h1>
                            <p className="text-slate-200 text-xs sm:text-sm font-medium">
                                Welcome back to {societyName}
                            </p>
                        </div>
                        
                        {/* Weather Widget */}
                        <WeatherWidget defaultCity={city} />
                    </div>
                </div>
            </div>

            {/* ── Stats Grid ──────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                    title="Total Complaints" 
                    value="12" 
                    subtitle="2 Escalated"
                    subtitleColor="text-red-500"
                    icon={<MessageCircle size={26} className="text-[#d946ef]" strokeWidth={2.5} />}
                    bgClass="bg-[#d946ef]/10"
                    glowColor="#d946ef"
                    svgPoints="0,22 10,25 20,15 25,25 35,20 45,5 55,18 65,22 75,10 85,20 95,25 100,22"
                />
                <StatCard 
                    title="Pending Visitors" 
                    value="3" 
                    subtitle="View all"
                    subtitleColor="text-[#10b981]"
                    icon={<Users size={26} className="text-[#10b981]" strokeWidth={2.5} />}
                    bgClass="bg-[#10b981]/10"
                    glowColor="#10b981"
                    svgPoints="0,25 10,20 20,25 30,15 40,25 50,5 60,15 70,25 80,15 90,25 100,20"
                />
                <StatCard 
                    title="Unpaid Invoices" 
                    value="2" 
                    subtitle="Total ₹4,250"
                    subtitleColor="text-[#f59e0b]"
                    icon={<Receipt size={26} className="text-[#f59e0b]" strokeWidth={2.5} />}
                    bgClass="bg-[#f59e0b]/10"
                    glowColor="#f59e0b"
                    svgPoints="0,25 15,15 25,22 35,15 45,25 55,5 65,18 75,22 85,10 95,20 100,25"
                />
                <StatCard 
                    title="Active Notices" 
                    value="5" 
                    subtitle="New updates"
                    subtitleColor="text-[#3b82f6]"
                    icon={<Megaphone size={26} className="text-[#3b82f6]" strokeWidth={2.5} />}
                    bgClass="bg-[#3b82f6]/10"
                    glowColor="#3b82f6"
                    svgPoints="0,22 10,20 25,25 35,12 45,20 55,5 65,15 75,25 85,15 95,22 100,20"
                />
            </div>

            {/* ── SOS Banner ──────────────────────────────────────────────── */}
            <div className="relative rounded-2xl p-[1px] bg-gradient-to-r from-fuchsia-600/80 via-slate-800 to-red-600/80 shadow-[0_0_40px_rgba(239,68,68,0.15)] mt-4 mb-8">
                <div className="relative w-full h-full overflow-hidden rounded-[15px] p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-6"
                     style={{ background: 'linear-gradient(90deg, rgba(30,10,50,0.5) 0%, rgba(10,11,18,1) 40%, rgba(60,10,10,0.6) 100%)' }}>
                    
                    {/* Radar glow and rings (Left) */}
                    <div className="absolute left-1/2 sm:left-[-20px] top-1/2 -translate-x-1/2 sm:translate-x-0 -translate-y-1/2 w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] pointer-events-none opacity-30 sm:opacity-40 mix-blend-screen">
                        <div className="absolute inset-0 rounded-full border-[0.5px] border-fuchsia-500/20"></div>
                        <div className="absolute inset-8 rounded-full border-[0.5px] border-fuchsia-500/30"></div>
                        <div className="absolute inset-16 rounded-full border-[0.5px] border-fuchsia-500/20"></div>
                        <div className="absolute top-0 bottom-0 left-1/2 w-[0.5px] bg-fuchsia-500/20"></div>
                        <div className="absolute left-0 right-0 top-1/2 h-[0.5px] bg-fuchsia-500/20"></div>
                    </div>

                    {/* EKG & Buildings Background (Center-Right) */}
                    <div className="absolute right-0 sm:right-[150px] lg:right-[250px] bottom-0 h-[60%] sm:h-[80%] w-[100%] sm:w-[350px] pointer-events-none opacity-30 sm:opacity-80">
                        <svg viewBox="0 0 200 100" className="w-full h-full preserve-3d" preserveAspectRatio="none">
                            {/* Buildings silhouette */}
                            <g fill="#1a1c29" className="opacity-90">
                                <rect x="30" y="50" width="8" height="50" />
                                <rect x="40" y="40" width="12" height="60" />
                                <rect x="54" y="60" width="10" height="40" />
                                <rect x="66" y="30" width="15" height="70" />
                                <rect x="83" y="55" width="12" height="45" />
                                <rect x="97" y="45" width="15" height="55" />
                                <rect x="114" y="35" width="12" height="65" />
                                <rect x="128" y="50" width="10" height="50" />
                                <rect x="140" y="40" width="15" height="60" />
                            </g>
                            {/* Windows */}
                            <g fill="#2a2d42" className="opacity-70">
                                <rect x="43" y="45" width="2" height="2" />
                                <rect x="47" y="45" width="2" height="2" />
                                <rect x="43" y="55" width="2" height="2" />
                                <rect x="69" y="35" width="2" height="2" />
                                <rect x="74" y="35" width="2" height="2" />
                                <rect x="69" y="45" width="2" height="2" />
                                <rect x="99" y="50" width="2" height="2" />
                                <rect x="117" y="40" width="2" height="2" />
                                <rect x="143" y="45" width="2" height="2" />
                                <rect x="148" y="55" width="2" height="2" />
                            </g>
                            {/* Pulse Line */}
                            <defs>
                                <filter id="ekg-glow">
                                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                                    <feMerge>
                                        <feMergeNode in="blur"/>
                                        <feMergeNode in="SourceGraphic"/>
                                    </feMerge>
                                </filter>
                            </defs>
                            <polyline 
                                points="0,85 100,85 110,75 115,100 125,50 135,95 140,75 145,85 200,85"
                                fill="none" 
                                stroke="#ef4444" 
                                strokeWidth="1.5"
                                filter="url(#ekg-glow)"
                            />
                        </svg>
                    </div>

                    {/* Left Content */}
                    <div className="relative z-10 flex flex-col sm:flex-row items-center text-center sm:text-left gap-4 sm:gap-6 w-full md:w-auto">
                        {/* Glowing Shield Icon */}
                        <div className="relative flex h-[60px] w-[60px] sm:h-[70px] sm:w-[70px] shrink-0 items-center justify-center sm:ml-2">
                            <div className="absolute inset-0 rounded-full bg-fuchsia-600/30 blur-[20px]"></div>
                            <Shield className="absolute h-10 w-10 sm:h-12 sm:w-12 text-[#e879f9] filter drop-shadow-[0_0_8px_rgba(232,121,249,0.8)]" strokeWidth={1.5} />
                            <Leaf className="absolute h-[18px] w-[18px] sm:h-[22px] sm:w-[22px] text-[#e879f9] mt-1 filter drop-shadow-[0_0_5px_rgba(232,121,249,0.8)]" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-[16px] sm:text-[17px] font-bold text-white mb-1.5 tracking-wide">Stay Safe, Stay Connected</h2>
                            <p className="text-[12px] sm:text-[13px] font-medium text-slate-300 max-w-[340px] leading-relaxed">
                                In case of any emergency, press the SOS button or contact security immediately.
                            </p>
                        </div>
                    </div>

                    {/* Right Button */}
                    <button 
                        onClick={() => navigate('/resident/emergency')}
                        className="relative z-10 w-full md:w-auto shrink-0 flex items-center justify-center gap-2 rounded-xl border-2 border-[#ef4444] bg-[#ef4444]/10 px-5 py-3 sm:px-6 text-sm font-bold text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:shadow-[0_0_25px_rgba(239,68,68,0.6)] hover:bg-[#ef4444]/20 hover:-translate-y-0.5 transition-all"
                    >
                        <Siren size={18} className="text-white filter drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]" strokeWidth={2.5} />
                        Go to SOS
                        <ChevronRight size={16} className="ml-1 opacity-70" />
                    </button>
                </div>
            </div>

            {/* ── Quick Access ────────────────────────────────────────────── */}
            <div>
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-[17px] font-bold text-white">Quick Access</h3>
                    <button className="flex items-center gap-1.5 text-[13px] font-semibold text-purple-400 hover:text-purple-300 transition-colors">
                        <Pencil size={14} /> Edit
                    </button>
                </div>
                <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
                    <QuickAccessBtn 
                        icon={<Coffee size={28} className="text-[#d946ef] filter drop-shadow-[0_0_5px_rgba(217,70,239,0.5)]" strokeWidth={2} />} 
                        label="Amenities" 
                        sub="Book Facilities" 
                        onClick={() => navigate('/resident/amenities')}
                        glowColor="#d946ef"
                        bgClass="bg-[#d946ef]/10"
                    />
                    <QuickAccessBtn 
                        icon={<Users size={28} className="text-[#10b981] filter drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]" strokeWidth={2} />} 
                        label="Visitor Passes" 
                        sub="Manage Visitors" 
                        onClick={() => navigate('/resident/visitors')}
                        glowColor="#10b981"
                        bgClass="bg-[#10b981]/10"
                    />
                    <QuickAccessBtn 
                        icon={<MessageCircle size={28} className="text-[#f43f5e] filter drop-shadow-[0_0_5px_rgba(244,63,94,0.5)]" strokeWidth={2} />} 
                        label="Complaints" 
                        sub="Raise & Track" 
                        onClick={() => navigate('/resident/complaints')}
                        glowColor="#f43f5e"
                        bgClass="bg-[#f43f5e]/10"
                    />
                    <QuickAccessBtn 
                        icon={<Receipt size={28} className="text-[#f59e0b] filter drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]" strokeWidth={2} />} 
                        label="Invoices" 
                        sub="View & Pay" 
                        onClick={() => navigate('/resident/invoices')}
                        glowColor="#f59e0b"
                        bgClass="bg-[#f59e0b]/10"
                    />
                    <QuickAccessBtn 
                        icon={<Folder size={28} className="text-[#3b82f6] filter drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]" strokeWidth={2} />} 
                        label="Documents" 
                        sub="My Documents" 
                        onClick={() => navigate('/resident/documents')}
                        glowColor="#3b82f6"
                        bgClass="bg-[#3b82f6]/10"
                    />
                    <QuickAccessBtn 
                        icon={<Car size={28} className="text-[#06b6d4] filter drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]" strokeWidth={2} />} 
                        label="Vehicles" 
                        sub="My Vehicles" 
                        onClick={() => navigate('/resident/vehicles')}
                        glowColor="#06b6d4"
                        bgClass="bg-[#06b6d4]/10"
                    />
                </div>
            </div>

            {/* ── Lists ───────────────────────────────────────────────────── */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Notices */}
                <div className="rounded-2xl bg-[#0a0b12] border border-slate-800/80 p-5 relative overflow-hidden shadow-sm hover:border-slate-700 transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 rounded-full blur-[40px] pointer-events-none"></div>
                    <div className="flex items-center justify-between mb-5 relative z-10">
                        <h3 className="text-[15px] font-bold text-white flex items-center gap-2">
                            <div className="bg-purple-500/20 p-1.5 rounded-lg text-purple-400">
                                <FileText size={16} />
                            </div>
                            Recent Notices
                        </h3>
                        <button onClick={() => navigate('/resident/notices')} className="text-xs font-semibold text-purple-400 hover:text-purple-300">View All</button>
                    </div>
                    <div className="space-y-4 relative z-10">
                        <NoticeItem title="Notice for Water Supply Suspension" date="11 July 2026" badge="HIGH" badgeColor="bg-red-500/20 text-red-400" dotColor="bg-red-500" />
                        <NoticeItem title="Lift Maintenance Schedule" date="9 July 2026" badge="GENERAL" badgeColor="bg-blue-500/20 text-blue-400" dotColor="bg-purple-500" />
                        <NoticeItem title="Society Annual General Meeting" date="5 July 2026" badge="GENERAL" badgeColor="bg-blue-500/20 text-blue-400" dotColor="bg-purple-500" />
                        <NoticeItem title="Parking Area Cleaning" date="3 July 2026" badge="GENERAL" badgeColor="bg-blue-500/20 text-blue-400" dotColor="bg-purple-500" />
                    </div>
                </div>

                {/* Upcoming Amenities */}
                <div className="rounded-2xl bg-[#0a0b12] border border-slate-800/80 p-5 relative overflow-hidden shadow-sm hover:border-slate-700 transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-600/5 rounded-full blur-[40px] pointer-events-none"></div>
                    <div className="flex items-center justify-between mb-5 relative z-10">
                        <h3 className="text-[15px] font-bold text-white flex items-center gap-2">
                            <div className="bg-fuchsia-500/20 p-1.5 rounded-lg text-fuchsia-400">
                                <Building2 size={16} />
                            </div>
                            Upcoming Amenities
                        </h3>
                        <button onClick={() => navigate('/resident/amenities')} className="text-xs font-semibold text-fuchsia-400 hover:text-fuchsia-300">View All</button>
                    </div>
                    <div className="space-y-4 relative z-10">
                        <AmenityItem title="Swimming Pool" date="Tomorrow, 06:00 AM - 08:00 AM" img="https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=200&auto=format&fit=crop" />
                        <AmenityItem title="Gym" date="Today, 07:00 AM - 09:00 PM" img="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=200&auto=format&fit=crop" />
                        <AmenityItem title="Tennis Court" date="Today, 06:00 PM - 08:00 PM" img="https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=200&auto=format&fit=crop" />
                        <button onClick={() => navigate('/resident/amenities')} className="text-xs font-semibold text-fuchsia-400 hover:text-fuchsia-300 mt-2 block">View All Amenities →</button>
                    </div>
                </div>
            </div>
            {/* Search Command Palette Modal */}
            <CommandPaletteModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

        </div>
    );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ title, value, subtitle, subtitleColor, icon, bgClass, glowColor, svgPoints }) {
    const filterId = `glow-${title.replace(/\s+/g, '-')}`;
    const gradId = `grad-${title.replace(/\s+/g, '-')}`;
    
    return (
        <div className="rounded-2xl bg-[#0a0b12] border border-slate-800/80 p-3 sm:p-5 relative overflow-hidden group shadow-sm transition-all hover:border-slate-700">
            {/* Top row: Icon, text, menu */}
            <div className="flex items-start justify-between mb-1 sm:mb-2">
                <div className="flex flex-col xl:flex-row gap-2 xl:gap-4 items-start xl:items-center">
                    {/* Icon container */}
                    <div className={`h-[42px] w-[42px] sm:h-[56px] sm:w-[56px] rounded-[14px] sm:rounded-[18px] flex items-center justify-center shrink-0 ${bgClass} shadow-[0_0_20px_rgba(0,0,0,0)] transition-shadow duration-500 group-hover:shadow-[0_0_25px_${glowColor}]`} style={{ boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.05)` }}>
                        {React.cloneElement(icon, { className: `${icon.props.className} w-5 h-5 sm:w-6 sm:h-6` })}
                    </div>
                    {/* Title & Value */}
                    <div className="min-w-0">
                        <div className="text-[11px] sm:text-[13px] text-slate-100 font-semibold mb-0.5 sm:mb-1 truncate leading-tight xl:whitespace-nowrap">{title}</div>
                        <div className="text-[22px] sm:text-[32px] font-bold text-white leading-none tracking-tight">{value}</div>
                    </div>
                </div>
                <div className="text-slate-400 cursor-pointer hover:text-white px-1 sm:px-2">⋮</div>
            </div>
            
            {/* Subtitle centered */}
            <div className={`text-center text-[10px] sm:text-[11px] font-bold tracking-wide mt-2 mb-1.5 sm:mt-3 sm:mb-2 ${subtitleColor} line-clamp-1`}>
                {subtitle}
            </div>
            
            {/* SVG Line Graph */}
            <div className="w-full h-[40px] relative mt-1">
                <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible preserve-3d">
                    <defs>
                        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={glowColor} stopOpacity="0.3" />
                            <stop offset="100%" stopColor={glowColor} stopOpacity="0" />
                        </linearGradient>
                        <filter id={filterId}>
                            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                            <feMerge>
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                    </defs>
                    {/* Fill */}
                    <polygon points={`0,30 ${svgPoints} 100,30`} fill={`url(#${gradId})`} />
                    {/* Line */}
                    <polyline 
                        points={svgPoints} 
                        fill="none" 
                        stroke={glowColor} 
                        strokeWidth="1.2" 
                        filter={`url(#${filterId})`}
                    />
                    {/* Dots */}
                    {svgPoints.split(' ').map((pt, i) => {
                        const [x, y] = pt.split(',');
                        return <circle key={i} cx={x} cy={y} r="1.5" fill={glowColor} />;
                    })}
                </svg>
            </div>
        </div>
    );
}

function QuickAccessBtn({ icon, label, sub, onClick, glowColor, bgClass }) {
    return (
        <button 
            onClick={onClick}
            className={`group flex flex-col items-center justify-center gap-1 sm:gap-1.5 rounded-[16px] sm:rounded-[20px] bg-[#0a0b12] border border-slate-800/80 p-2 sm:p-5 hover:border-slate-700 transition-all`}
        >
            <div 
                className={`h-10 w-10 sm:h-14 sm:w-14 rounded-[12px] sm:rounded-[16px] flex items-center justify-center mb-1 sm:mb-2 transition-shadow duration-500 group-hover:shadow-[0_0_20px_${glowColor}] ${bgClass}`}
                style={{ boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.05)` }}
            >
                {React.cloneElement(icon, { className: `${icon.props.className} w-5 h-5 sm:w-7 sm:h-7` })}
            </div>
            <div className="text-[10px] sm:text-[13px] font-bold text-white tracking-wide text-center leading-tight">{label}</div>
            <div className="text-[8px] sm:text-[11px] font-medium text-slate-400 line-clamp-1 text-center">{sub}</div>
        </button>
    );
}

function NoticeItem({ title, date, badge, badgeColor, dotColor }) {
    return (
        <div className="flex items-center justify-between group cursor-pointer hover:bg-slate-800/50 p-2 -mx-2 rounded-xl transition-colors">
            <div className="flex items-start gap-3">
                <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dotColor}`}></div>
                <div>
                    <div className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">{title}</div>
                    <div className="flex items-center gap-3 mt-1 text-[11px]">
                        <span className="text-slate-500">{date}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider ${badgeColor}`}>{badge}</span>
                    </div>
                </div>
            </div>
            <ChevronRight size={16} className="text-slate-600 group-hover:text-slate-400" />
        </div>
    );
}

function AmenityItem({ title, date, img }) {
    return (
        <div className="flex items-center justify-between group cursor-pointer hover:bg-white/5 p-2 -mx-2 rounded-xl transition-colors">
            <div className="flex items-center gap-3">
                <div className="relative w-12 h-10 rounded-lg overflow-hidden bg-slate-800">
                    <img 
                        src={img} 
                        alt={title} 
                        className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300" 
                        onLoad={(e) => e.target.classList.remove('opacity-0')} 
                    />
                </div>
                <div>
                    <div className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">{title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{date}</div>
                </div>
            </div>
            <button className="px-3 py-1 rounded-lg bg-slate-800 text-xs font-semibold text-fuchsia-400 group-hover:bg-slate-700 transition-colors border border-slate-700">
                Book
            </button>
        </div>
    );
}
