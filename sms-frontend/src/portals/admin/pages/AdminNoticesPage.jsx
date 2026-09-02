import React, { useState } from 'react';
import { useGetAllNoticesQuery } from '../../../store/api/societyAdminApi';
import { Bell, Plus, Search, Filter, Megaphone, FileText, CalendarClock, Archive, Eye, EyeOff, Send, CheckCircle2, AlertTriangle, AlertCircle, Clock, ChevronDown, MoreVertical } from 'lucide-react';
import PageHeader from '../../../components/ui/PageHeader';
import Alert from '../../../components/ui/Alert';
import EmptyState from '../../../components/ui/EmptyState';
import { Button } from '../../../components/ui/Button';
import CreateNoticeModal from '../components/notices/CreateNoticeModal';
import Pagination from '../../../components/ui/Pagination';
import { Link, useNavigate } from 'react-router-dom';

const STATUS_CONFIG = {
    PUBLISHED: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20', icon: Send },
    SCHEDULED: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20', icon: CalendarClock },
    DRAFT: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20', icon: FileText },
    ARCHIVED: { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/20', icon: Archive },
};

const PRIORITY_CONFIG = {
    URGENT: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20', dot: 'bg-red-500' },
    HIGH: { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/20', dot: 'bg-orange-500' },
    NORMAL: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20', dot: 'bg-blue-500' },
    LOW: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20', dot: 'bg-gray-400' },
};

const CATEGORY_ICONS = {
    GENERAL: { icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    MAINTENANCE: { icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    FINANCIAL: { icon: FileText, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    EMERGENCY: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
    EVENT: { icon: CalendarClock, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    LEGAL: { icon: FileText, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    PARKING: { icon: FileText, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    MEETING: { icon: FileText, color: 'text-pink-400', bg: 'bg-pink-500/10' },
};

export default function AdminNoticesPage() {
    const navigate = useNavigate();
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [page, setPage] = useState(1);
    
    const { data, isLoading, isError, refetch, isFetching } = useGetAllNoticesQuery({ 
        status: statusFilter || undefined,
        noticeType: typeFilter || undefined,
        page,
        limit: 10
    });
    
    const [showModal, setShowModal] = useState(false);
    
    const rawData = data?.data;
    const notices = Array.isArray(rawData?.data) ? rawData.data : (Array.isArray(rawData) ? rawData : []);
    const stats = rawData?.stats || { total: 0, published: 0, scheduled: 0, archived: 0, drafts: 0 };
    const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

    const StatCard = ({ title, value, subtitle, icon: Icon, colors, iconBg }) => (
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
                                <Icon className="w-5 h-5 text-white" />
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

    return (
        <div className="space-y-6">
            <PageHeader 
                title="Notice Management"
                subtitle="Create, publish and manage all society-wide notices"
                onRefresh={refetch}
                isFetching={isFetching}
                actions={
                    <Button onClick={() => setShowModal(true)} className="bg-[#6338f0] hover:bg-[#5b32e6] text-white shadow-[0_0_15px_rgba(99,56,240,0.3)] border-0">
                        <Plus className="h-4 w-4 mr-2" /> Create Notice
                    </Button>
                }
            />

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard title="Total Notices" value={stats.total} subtitle="All time" icon={FileText} colors="from-[#6338f0] to-[#805af5]" iconBg="bg-white/20" />
                <StatCard title="Published" value={stats.published} subtitle="Visible" icon={Send} colors="from-emerald-500 to-teal-600" iconBg="bg-white/20" />
                <StatCard title="Scheduled" value={stats.scheduled} subtitle="Upcoming" icon={CalendarClock} colors="from-blue-500 to-indigo-600" iconBg="bg-white/20" />
                <StatCard title="Archived" value={stats.archived} subtitle="Hidden" icon={Archive} colors="from-orange-500 to-amber-600" iconBg="bg-white/20" />
                <StatCard title="Drafts" value={stats.drafts} subtitle="Drafts" icon={FileText} colors="from-gray-600 to-slate-700" iconBg="bg-white/20" />
            </div>

            {/* Filters Row */}
            <div className="bg-[#151722] border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex-1 w-full relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                        type="text" 
                        placeholder="Search by title or content..." 
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-[13px] text-white font-bold placeholder-gray-500 focus:outline-none focus:border-[#6338f0]/50 shadow-sm"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <select 
                        value={statusFilter} 
                        onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[13px] font-bold text-white focus:outline-none focus:border-[#6338f0]/50 min-w-[140px] appearance-none cursor-pointer"
                    >
                        <option value="" className="bg-[#151722]">All Status</option>
                        {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s} className="bg-[#151722]">{s}</option>)}
                    </select>
                    <select 
                        value={typeFilter} 
                        onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[13px] font-bold text-white focus:outline-none focus:border-[#6338f0]/50 min-w-[140px] appearance-none cursor-pointer"
                    >
                        <option value="" className="bg-[#151722]">All Types</option>
                        {Object.keys(CATEGORY_ICONS).map(s => <option key={s} value={s} className="bg-[#151722]">{s}</option>)}
                    </select>
                    <button className="h-9 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-colors gap-2">
                        <Filter className="w-4 h-4" />
                        <span className="text-[13px] font-bold">Filters</span>
                    </button>
                </div>
            </div>

            {isError && <Alert type="error">Failed to load notices. <button onClick={refetch} className="underline ml-1">Retry</button></Alert>}

            {/* Table */}
            <div className="bg-[#151722] border border-white/5 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-16">#</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Notice Details</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Priority</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Published / Scheduled</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Audience</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-white/5 rounded w-8"></div></td>
                                        <td className="px-6 py-4"><div className="h-10 bg-white/5 rounded w-48"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 bg-white/5 rounded-full w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 bg-white/5 rounded-full w-20"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 bg-white/5 rounded-full w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-8 bg-white/5 rounded w-32"></div></td>
                                        <td className="px-6 py-4"><div className="h-8 bg-white/5 rounded w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-8 bg-white/5 rounded w-16 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : notices.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12">
                                        <EmptyState icon={Bell} title="No notices found" description="Create a notice to get started." />
                                    </td>
                                </tr>
                            ) : (
                                notices.map((notice, idx) => {
                                    const catConfig = CATEGORY_ICONS[notice.noticeType] || CATEGORY_ICONS.GENERAL;
                                    const CatIcon = catConfig.icon;
                                    const pConfig = PRIORITY_CONFIG[notice.priority] || PRIORITY_CONFIG.NORMAL;
                                    const sConfig = STATUS_CONFIG[notice.status] || STATUS_CONFIG.DRAFT;
                                    
                                    const numIndex = String((page - 1) * 10 + idx + 1).padStart(2, '0');

                                    return (
                                        <tr key={notice._id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer" onClick={() => navigate(`/admin/notices/${notice._id}`)}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-[13px] font-bold text-gray-500">{numIndex}</span>
                                            </td>
                                            <td className="px-6 py-4 min-w-[300px]">
                                                <div className="flex items-start gap-3">
                                                    <div className={`w-10 h-10 rounded-full ${catConfig.bg} flex items-center justify-center shrink-0`}>
                                                        <CatIcon className={`w-5 h-5 ${catConfig.color}`} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[14px] font-bold text-white group-hover:text-[#6338f0] transition-colors">{notice.title}</span>
                                                        <span className="text-[12px] font-bold text-gray-400 mt-0.5 line-clamp-1">{notice.content ? notice.content.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').substring(0, 60) : ''}...</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${catConfig.color.replace('text', 'border')}/30 ${catConfig.color}`}>{notice.noticeType}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${pConfig.dot}`} />
                                                    <span className={`text-[12px] font-bold ${pConfig.text}`}>{notice.priority}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${sConfig.border} ${sConfig.bg} ${sConfig.text}`}>{sConfig.text === 'DRAFT' ? 'DRAFT' : notice.status}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-1.5 text-gray-300">
                                                        <CalendarClock className="w-3.5 h-3.5 text-gray-500" />
                                                        <span className="text-[12px] font-bold">
                                                            {notice.status === 'PUBLISHED' ? new Date(notice.publishedAt).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) :
                                                             notice.status === 'SCHEDULED' ? new Date(notice.scheduledAt).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) :
                                                             '—'}
                                                        </span>
                                                    </div>
                                                    <span className="text-[11px] font-bold text-gray-500 mt-1 flex items-center gap-1">
                                                        <Plus className="w-3 h-3" /> by {notice.createdBy?.firstName} {notice.createdBy?.lastName}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-1.5 text-gray-300">
                                                        <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                                        <span className="text-[12px] font-bold">{notice.targetAudience?.type === 'ALL' ? 'All Residents' : notice.targetAudience?.type}</span>
                                                    </div>
                                                    <span className="text-[11px] font-bold text-indigo-400 mt-1">{notice.sentToCount || 0} Recipients</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                                                    <Link to={`/admin/notices/${notice._id}`} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors border border-white/10">
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    <button className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors border border-white/10">
                                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                                                    </button>
                                                    <button className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors border border-white/10">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                {notices.length > 0 && (
                    <div className="p-4 border-t border-white/5">
                        <Pagination
                            currentPage={page}
                            totalPages={pagination.totalPages}
                            onPageChange={setPage}
                            totalItems={pagination.total}
                            itemsPerPage={10}
                        />
                    </div>
                )}
            </div>

            {showModal && <CreateNoticeModal onClose={() => { setShowModal(false); refetch(); }} />}
        </div>
    );
}
