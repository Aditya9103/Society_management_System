import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RefreshCw, Search, List, Grid, Filter, MessageSquareWarning, AlertCircle, Clock, CheckCircle, Archive, Plus } from 'lucide-react';
import { useGetStaffComplaintsQuery } from '../../../store/api/staffApi';
import Alert from '../../../components/ui/Alert';
import EmptyState from '../../../components/ui/EmptyState';
import ComplaintCard from '../../../components/ui/ComplaintCard';
import Pagination from '../../../components/ui/Pagination';
import RaiseComplaintModal from '../components/complaints/RaiseComplaintModal';

const STATUS_OPTIONS = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'ESCALATED', 'REJECTED', 'REOPENED'];
const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const CATEGORY_OPTIONS = [
    'ELECTRICAL', 'PLUMBING', 'SECURITY', 'HOUSEKEEPING', 'LIFT_ELEVATOR', 
    'PARKING', 'GARDEN_LANDSCAPE', 'STRUCTURAL', 'NOISE_NUISANCE', 'AMENITY', 'ADMINISTRATIVE', 'OTHER'
];

function StatCard({ title, value, subtitle, icon, colors, iconBg }) {
    return (
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colors} p-5 border border-white/5 shadow-lg`}>
            <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none">
                <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 80C30 50 60 80 120 20L120 80H0Z" fill="currentColor" className="text-white" />
                    <path d="M20 80C50 40 80 70 120 0L120 80H20Z" fill="currentColor" className="text-white opacity-50" />
                </svg>
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center backdrop-blur-md`}>
                                {icon}
                            </div>
                            <h3 className="text-white font-bold text-[13px] tracking-wide">{title}</h3>
                        </div>
                    </div>
                    <div className="text-white text-3xl font-black mb-1 tracking-tight">{value}</div>
                </div>
                <div className="text-white font-bold text-[12px] opacity-90">{subtitle}</div>
            </div>
        </div>
    );
}

export default function StaffComplaintsPage() {
    const { user } = useSelector(state => state.auth);
    const role = user?.role;
    
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [showModal, setShowModal] = useState(false);

    const canRaise = ['COMMITTEE_MEMBER','ACCOUNTANT','FACILITY_MANAGER','HELP_DESK'].includes(role);

    const { data, isLoading, isError, refetch, isFetching } = useGetStaffComplaintsQuery({
        page, limit, search,
        ...(statusFilter && { status: statusFilter }),
        ...(categoryFilter && { category: categoryFilter }),
        ...(priorityFilter && { priority: priorityFilter }),
    });

    const complaints = data?.data?.data ?? [];
    const pagination = data?.pagination ?? { total: 0 };
    const stats = data?.data?.stats ?? { total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0 };

    return (
        <div className="space-y-6 font-sans pb-10">
            {/* Custom Header matching the mockup */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                    <h1 className="text-[28px] font-bold text-white tracking-tight leading-tight mb-1">
                        Complaints
                    </h1>
                    <p className="text-[14px] font-bold text-gray-300">
                        Society-wide maintenance and issue tracking
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={refetch}
                        className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#151722] text-white font-bold border border-white/5 hover:bg-white/10 transition-colors shadow-sm"
                    >
                        <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                    </button>
                    {canRaise && (
                        <button 
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6338f0] hover:bg-[#5b32e6] text-white font-bold transition-all shadow-[0_0_15px_rgba(99,56,240,0.3)]"
                        >
                            <Plus className="w-5 h-5" />
                            Raise Complaint
                        </button>
                    )}
                </div>
            </div>

            {/* Stat Cards Row */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard
                    title="Total Complaints"
                    value={stats.total}
                    subtitle="All time"
                    icon={<MessageSquareWarning className="w-5 h-5 text-white" />}
                    colors="from-[#6338f0] to-[#805af5]"
                    iconBg="bg-white/20"
                />
                <StatCard
                    title="Open"
                    value={stats.open}
                    subtitle="Awaiting action"
                    icon={<AlertCircle className="w-5 h-5 text-white" />}
                    colors="from-red-500 to-rose-600"
                    iconBg="bg-white/20"
                />
                <StatCard
                    title="In Progress"
                    value={stats.inProgress}
                    subtitle="Assigned"
                    icon={<Clock className="w-5 h-5 text-white" />}
                    colors="from-blue-500 to-indigo-600"
                    iconBg="bg-white/20"
                />
                <StatCard
                    title="Resolved"
                    value={stats.resolved}
                    subtitle="Successfully closed"
                    icon={<CheckCircle className="w-5 h-5 text-white" />}
                    colors="from-emerald-500 to-teal-600"
                    iconBg="bg-white/20"
                />
                <StatCard
                    title="Closed"
                    value={stats.closed}
                    subtitle="Archived"
                    icon={<Archive className="w-5 h-5 text-white" />}
                    colors="from-gray-600 to-slate-700"
                    iconBg="bg-white/20"
                />
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="relative w-full lg:flex-1 max-w-[400px]">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by title, ID, or resident name..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full pl-11 pr-4 py-3 bg-[#151722] border border-white/5 rounded-xl text-[14px] text-white font-bold placeholder-gray-500 focus:outline-none focus:border-[#6338f0]/50 focus:bg-white/[0.02] transition-colors shadow-sm"
                    />
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 hide-scrollbar">
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className="bg-[#151722] text-[13px] text-white font-bold rounded-xl px-4 py-3 border border-white/5 focus:outline-none focus:border-[#6338f0]/50 appearance-none min-w-[140px] bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23ffffff%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[position:right_12px_center] bg-[length:16px] shadow-sm"
                    >
                        <option value="">All Statuses</option>
                        {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s}>{s.replace('_', ' ')}</option>
                        ))}
                    </select>

                    <select
                        value={categoryFilter}
                        onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                        className="bg-[#151722] text-[13px] text-white font-bold rounded-xl px-4 py-3 border border-white/5 focus:outline-none focus:border-[#6338f0]/50 appearance-none min-w-[140px] bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23ffffff%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[position:right_12px_center] bg-[length:16px] shadow-sm"
                    >
                        <option value="">All Categories</option>
                        {CATEGORY_OPTIONS.map(c => (
                            <option key={c} value={c}>{c.replace('_', ' ')}</option>
                        ))}
                    </select>

                    <select
                        value={priorityFilter}
                        onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
                        className="bg-[#151722] text-[13px] text-white font-bold rounded-xl px-4 py-3 border border-white/5 focus:outline-none focus:border-[#6338f0]/50 appearance-none min-w-[140px] bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23ffffff%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[position:right_12px_center] bg-[length:16px] shadow-sm"
                    >
                        <option value="">All Priorities</option>
                        {PRIORITY_OPTIONS.map(p => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>

                    <button className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#151722] text-white text-[13px] font-bold border border-white/5 hover:bg-white/5 transition-colors shadow-sm">
                        <Filter className="w-4 h-4" /> Filters
                    </button>

                    <div className="flex items-center p-1 rounded-xl bg-[#151722] border border-white/5 ml-auto">
                        <button className="p-2 rounded-lg bg-white/10 text-white shadow-sm">
                            <List className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg text-gray-500 hover:text-white transition-colors">
                            <Grid className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Error & Loading States */}
            {isError && (
                <Alert type="error" className="bg-red-500/10 border-red-500/30 text-red-400">
                    Failed to load complaints. <button onClick={refetch} className="underline ml-1 font-bold">Retry</button>
                </Alert>
            )}

            {/* List */}
            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 bg-[#151722] border border-white/5 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : complaints.length === 0 ? (
                <EmptyState 
                    icon={MessageSquareWarning} 
                    title="No complaints found" 
                    description="There are currently no complaints matching your criteria." 
                />
            ) : (
                <div className="space-y-4">
                    {complaints.map(complaint => (
                        <ComplaintCard 
                            key={complaint._id} 
                            complaint={complaint} 
                            linkPrefix="/staff/complaints"
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {complaints.length > 0 && (
                <div className="bg-[#151722] border border-white/5 rounded-2xl p-2 px-4 shadow-sm flex items-center justify-between mt-4">
                    <span className="text-[12px] font-bold text-gray-400">
                        Showing {(page - 1) * limit + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} complaints
                    </span>
                    <Pagination pagination={{ ...pagination, limit }} page={page} onPageChange={setPage} />
                    <div className="flex items-center gap-2">
                        <span className="text-[12px] font-bold text-gray-400 hidden sm:block">Rows per page:</span>
                        <select 
                            value={limit}
                            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                            className="bg-transparent text-[12px] font-bold text-white border-none focus:ring-0 cursor-pointer pl-1 pr-6 bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23ffffff%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[position:right_2px_center] bg-[length:12px] appearance-none"
                        >
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                        </select>
                    </div>
                </div>
            )}

            <RaiseComplaintModal isOpen={showModal} onClose={() => { setShowModal(false); refetch(); }} />
        </div>
    );
}
