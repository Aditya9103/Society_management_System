import React, { useState, useMemo } from 'react';
import { Search, Download, Plus, Filter, RefreshCw, Eye, Edit2, Trash2, MoreVertical, Mail, Phone, ShieldCheck, Clock, XCircle, Users } from 'lucide-react';
import { useListResidentProfilesQuery, useListTowersQuery } from '../../../store/api/societyAdminApi';
import ResidentDetailsModal from '../components/residents/ResidentDetailsModal';

export default function ResidentsPage() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [statusFilter, setStatusFilter] = useState('');
    const [towerFilter, setTowerFilter] = useState('');
    const [selectedResidentId, setSelectedResidentId] = useState(null);

    const { data: towersData } = useListTowersQuery();

    const { data, isLoading, isError, refetch, isFetching } = useListResidentProfilesQuery({
        page, limit, search,
        ...(statusFilter && { approvalStatus: statusFilter }),
        ...(towerFilter && { towerId: towerFilter }),
    });

    const residents = data?.data ?? [];
    const pagination = data?.pagination;
    const stats = data?.stats ?? { total: 0, approved: 0, pending: 0, rejected: 0, familyMembers: 0 };

    const getPercentage = (count) => {
        if (!stats.total) return '0%';
        return ((count / stats.total) * 100).toFixed(1) + '%';
    };

    return (
        <div className="space-y-6 pb-10 font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-white tracking-tight">Residents</h1>
                        <span className="px-3 py-1 rounded-full bg-[#1c1439] text-[#b388ff] text-xs font-bold border border-[#b388ff]/20">
                            {stats.total} Total
                        </span>
                    </div>
                    <p className="text-[#8c94a6] text-sm mt-1">
                        Manage all residents, view profiles and account status
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#151722] text-[#8c94a6] text-sm font-semibold border border-white/5 hover:bg-white/5 hover:text-white transition-colors">
                        <Download className="w-4 h-4" /> Export
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6338f0] text-white text-sm font-bold shadow-[0_0_20px_rgba(99,56,240,0.4)] hover:bg-[#5229db] transition-colors">
                        <Plus className="w-4 h-4" /> Add Resident
                    </button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
                <div className="col-span-2 md:col-span-1">
                    <StatCard 
                        title="Total Residents" 
                        value={stats.total} 
                        subtitle="Across all towers" 
                        icon={<Users className="w-5 h-5 text-[#b388ff]" />} 
                        colors="from-[#2e1d5e]/80 to-[#1c1439]"
                        iconBg="bg-[#3e248a]/50"
                        onClick={() => { setStatusFilter(''); setPage(1); }}
                    />
                </div>
                <StatCard 
                    title="Approved" 
                    value={stats.approved} 
                    subtitle={`${getPercentage(stats.approved)} of total`} 
                    icon={<ShieldCheck className="w-5 h-5 text-[#4ade80]" />} 
                    colors="from-[#123625]/80 to-[#0a1f15]"
                    iconBg="bg-[#1a4d35]/50"
                    onClick={() => { setStatusFilter('APPROVED'); setPage(1); }}
                />
                <StatCard 
                    title="Pending" 
                    value={stats.pending} 
                    subtitle={`${getPercentage(stats.pending)} of total`} 
                    icon={<Clock className="w-5 h-5 text-[#f59e0b]" />} 
                    colors="from-[#4a3212]/80 to-[#261909]"
                    iconBg="bg-[#6b4819]/50"
                    onClick={() => { setStatusFilter('PENDING'); setPage(1); }}
                />
                <StatCard 
                    title="Rejected" 
                    value={stats.rejected} 
                    subtitle={`${getPercentage(stats.rejected)} of total`} 
                    icon={<XCircle className="w-5 h-5 text-[#ef4444]" />} 
                    colors="from-[#4a1216]/80 to-[#2b0a0d]"
                    iconBg="bg-[#701c22]/50"
                    onClick={() => { setStatusFilter('REJECTED'); setPage(1); }}
                />
                <StatCard 
                    title="Family" 
                    value={stats.familyMembers} 
                    subtitle="Linked profiles" 
                    icon={<Users className="w-5 h-5 text-[#3b82f6]" />} 
                    colors="from-[#143261]/80 to-[#0b1c36]"
                    iconBg="bg-[#1d488c]/50"
                />
            </div>

            {/* Filters */}
            <div className="flex flex-col lg:flex-row gap-4 items-center bg-[#11131c] p-3 rounded-2xl border border-white/5">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                        type="text" 
                        placeholder="Search by name, email, phone or unit..." 
                        value={search}
                        onChange={(e) => {setSearch(e.target.value); setPage(1);}}
                        className="w-full bg-[#151722] text-sm text-white placeholder-gray-500 rounded-xl pl-11 pr-4 py-3 border border-white/5 focus:outline-none focus:border-[#6338f0]/50"
                    />
                </div>
                <div className="flex gap-3 w-full lg:w-auto">
                    <select 
                        value={towerFilter}
                        onChange={(e) => {setTowerFilter(e.target.value); setPage(1);}}
                        className="bg-[#151722] text-sm text-gray-300 rounded-xl px-4 py-3 border border-white/5 focus:outline-none focus:border-[#6338f0]/50 appearance-none flex-1 lg:w-40 bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[position:right_12px_center] bg-[length:16px]">
                        <option value="">All Towers</option>
                        {towersData?.data?.map(t => (
                            <option key={t._id} value={t._id}>{t.name}</option>
                        ))}
                    </select>
                    <select 
                        value={statusFilter}
                        onChange={(e) => {setStatusFilter(e.target.value); setPage(1);}}
                        className="bg-[#151722] text-sm text-gray-300 rounded-xl px-4 py-3 border border-white/5 focus:outline-none focus:border-[#6338f0]/50 appearance-none flex-1 lg:w-40 bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[position:right_12px_center] bg-[length:16px]">
                        <option value="">All Status</option>
                        <option value="APPROVED">Approved</option>
                        <option value="PENDING">Pending</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                    <button onClick={refetch} className="flex items-center justify-center w-11 h-11 rounded-xl bg-[#151722] text-gray-300 border border-white/5 hover:bg-white/5 transition-colors">
                        <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Mobile List View */}
            <div className="md:hidden space-y-4">
                {isLoading ? (
                    <div className="py-8 text-center text-gray-500">Loading...</div>
                ) : residents.length === 0 ? (
                    <div className="py-8 text-center text-gray-500">No residents found.</div>
                ) : residents.map(r => (
                    <div key={r._id} onClick={() => setSelectedResidentId(r.userId?._id)} className="bg-[#11131c] rounded-2xl border border-white/5 p-4 flex flex-col gap-3 active:scale-[0.99] transition-transform">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#6338f0] flex items-center justify-center text-white font-bold text-sm shrink-0">
                                    {r.userId?.firstName?.[0] || ''}{r.userId?.lastName?.[0] || ''}
                                </div>
                                <div>
                                    <div className="text-white text-[14px] font-bold">{r.userId?.firstName} {r.userId?.lastName}</div>
                                    <div className="text-gray-400 text-[11px] font-medium mt-0.5">{r.userId?.phone || 'No phone'}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                {r.approvalStatus === 'APPROVED' ? (
                                    <span className="px-2 py-0.5 rounded-md bg-[#052e16] border border-[#166534] text-[#4ade80] text-[10px] font-bold tracking-wide">APPROVED</span>
                                ) : r.approvalStatus === 'PENDING' ? (
                                    <span className="px-2 py-0.5 rounded-md bg-[#422006] border border-[#713f12] text-[#fbbf24] text-[10px] font-bold tracking-wide">PENDING</span>
                                ) : (
                                    <span className="px-2 py-0.5 rounded-md bg-[#4c0519] border border-[#881337] text-[#f87171] text-[10px] font-bold tracking-wide">REJECTED</span>
                                )}
                                <div className="text-gray-500 text-[10px] mt-1">{new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between bg-[#151722] rounded-xl p-3 border border-white/5">
                            <div>
                                <div className="text-gray-400 text-[10px] font-semibold uppercase mb-0.5">Unit</div>
                                <div className="text-white text-xs font-bold">{r.unitId?.unitNumber || 'N/A'} (Tower {r.unitId?.towerId})</div>
                            </div>
                            <div className="text-right">
                                <div className="text-gray-400 text-[10px] font-semibold uppercase mb-0.5">Role</div>
                                <div className="text-[#b388ff] text-xs font-bold">{r.ownershipType === 'OWNER' ? 'Owner' : 'Tenant'}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-[#11131c] rounded-2xl border border-white/5 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr className="border-b border-white/5">
                            <th className="py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Resident</th>
                            <th className="py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Unit Details</th>
                            <th className="py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Contact</th>
                            <th className="py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Status</th>
                            <th className="py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Joined On</th>
                            <th className="py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {isLoading ? (
                            <tr><td colSpan="6" className="py-8 text-center text-gray-500">Loading...</td></tr>
                        ) : residents.length === 0 ? (
                            <tr><td colSpan="6" className="py-8 text-center text-gray-500">No residents found.</td></tr>
                        ) : residents.map(r => (
                            <tr key={r._id} onClick={() => setSelectedResidentId(r.userId?._id)} className="hover:bg-[#151722]/50 transition-colors cursor-pointer group">
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[#6338f0] flex items-center justify-center text-white font-bold text-sm shrink-0">
                                            {r.userId?.firstName?.[0] || ''}{r.userId?.lastName?.[0] || ''}
                                        </div>
                                        <div>
                                            <div className="text-white text-[13px] font-bold">{r.userId?.firstName} {r.userId?.lastName}</div>
                                            <div className="text-gray-500 text-[11px] font-medium mt-0.5">ID: {r.residentCode || r._id.slice(-6).toUpperCase()}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="text-white text-[13px] font-bold">{r.unitId?.unitNumber || 'N/A'}</div>
                                    <div className="text-gray-500 text-[11px] font-medium mt-0.5">Tower {r.unitId?.towerId} • {r.unitId?.bhkType || 'N/A'}</div>
                                    <div className="mt-1.5 inline-block px-2 py-0.5 rounded-[4px] bg-[#6338f0]/10 text-[#b388ff] text-[10px] font-bold">
                                        {r.ownershipType === 'OWNER' ? 'Owner' : 'Tenant'}
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-2 text-gray-400 text-[12px] font-medium">
                                        <Mail className="w-3.5 h-3.5 text-[#b388ff]" />
                                        {r.userId?.email}
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400 text-[12px] font-medium mt-1">
                                        <Phone className="w-3.5 h-3.5 text-[#b388ff]" />
                                        {r.userId?.phone || 'N/A'}
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    {r.approvalStatus === 'APPROVED' ? (
                                        <span className="px-2.5 py-1 rounded-md bg-[#052e16] border border-[#166534] text-[#4ade80] text-[10px] font-bold tracking-wide">APPROVED</span>
                                    ) : r.approvalStatus === 'PENDING' ? (
                                        <span className="px-2.5 py-1 rounded-md bg-[#422006] border border-[#713f12] text-[#fbbf24] text-[10px] font-bold tracking-wide">PENDING</span>
                                    ) : (
                                        <span className="px-2.5 py-1 rounded-md bg-[#4c0519] border border-[#881337] text-[#f87171] text-[10px] font-bold tracking-wide">REJECTED</span>
                                    )}
                                </td>
                                <td className="py-4 px-6 text-gray-400 text-[12px] font-medium whitespace-nowrap">
                                    {new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setSelectedResidentId(r.userId?._id); }}
                                            className="w-8 h-8 rounded-lg bg-[#2e1d5e]/30 text-[#b388ff] flex items-center justify-center hover:bg-[#2e1d5e]/60 transition-colors"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button onClick={(e) => e.stopPropagation()} className="w-8 h-8 rounded-lg bg-[#143261]/30 text-[#60a5fa] flex items-center justify-center hover:bg-[#143261]/60 transition-colors">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={(e) => e.stopPropagation()} className="w-8 h-8 rounded-lg bg-[#4a1216]/30 text-[#f87171] flex items-center justify-center hover:bg-[#4a1216]/60 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            {/* Pagination Footer */}
            <div className="px-6 py-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#11131c] rounded-2xl md:rounded-t-none md:rounded-b-2xl border border-white/5 md:border-t-0 mt-4 md:mt-0">
                <div className="text-gray-500 text-[12px] font-medium">
                        Showing {residents.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, stats.total || 0)} of {stats.total || 0} residents
                    </div>
                    
                    {pagination?.totalPages > 1 && (
                        <div className="flex items-center gap-1">
                            <button 
                                onClick={() => setPage(1)} disabled={page === 1}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-white/5 hover:text-white disabled:opacity-50"
                            >
                                &laquo;
                            </button>
                            <button 
                                onClick={() => setPage(p => p - 1)} disabled={page === 1}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-white/5 hover:text-white disabled:opacity-50"
                            >
                                &lsaquo;
                            </button>
                            
                            {[...Array(pagination.totalPages)].map((_, i) => {
                                const p = i + 1;
                                // Simple pagination logic for display
                                if (p === 1 || p === pagination.totalPages || (p >= page - 1 && p <= page + 1)) {
                                    return (
                                        <button 
                                            key={p} 
                                            onClick={() => setPage(p)}
                                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold ${page === p ? 'bg-[#6338f0] text-white' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}
                                        >
                                            {p}
                                        </button>
                                    );
                                }
                                if (p === page - 2 || p === page + 2) return <span key={p} className="text-gray-600 px-1">...</span>;
                                return null;
                            })}

                            <button 
                                onClick={() => setPage(p => p + 1)} disabled={page === pagination.totalPages}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-white/5 hover:text-white disabled:opacity-50"
                            >
                                &rsaquo;
                            </button>
                            <button 
                                onClick={() => setPage(pagination.totalPages)} disabled={page === pagination.totalPages}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-white/5 hover:text-white disabled:opacity-50"
                            >
                                &raquo;
                            </button>
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-[12px] text-gray-500 font-medium">
                        Rows per page: 
                        <select 
                            value={limit} 
                            onChange={e => {setLimit(Number(e.target.value)); setPage(1);}}
                            className="bg-transparent border-none text-white focus:outline-none focus:ring-0 cursor-pointer"
                        >
                            <option value="10" className="bg-[#11131c]">10</option>
                            <option value="20" className="bg-[#11131c]">20</option>
                            <option value="50" className="bg-[#11131c]">50</option>
                        </select>
                    </div>
                </div>
            </div>

            {selectedResidentId && <ResidentDetailsModal residentId={selectedResidentId} onClose={() => setSelectedResidentId(null)} />}
        </div>
    );
}

function StatCard({ title, value, subtitle, icon, colors, iconBg, onClick }) {
    return (
        <div onClick={onClick} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colors} p-5 border border-white/5 shadow-lg ${onClick ? 'cursor-pointer hover:scale-[1.02] transition-transform' : ''}`}>
            {/* Abstract Background Waves (CSS based) */}
            <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none">
                <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 80C30 50 60 80 120 20L120 80H0Z" fill="currentColor" className="text-white" />
                    <path d="M20 80C50 40 80 70 120 0L120 80H20Z" fill="currentColor" className="text-white opacity-50" />
                </svg>
            </div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center backdrop-blur-md`}>
                        {icon}
                    </div>
                    <h3 className="text-gray-300 text-[13px] font-bold tracking-wide">{title}</h3>
                </div>
                <div className="text-white text-3xl font-black mb-1 tracking-tight">{value}</div>
                <div className="text-gray-400 text-[11px] font-medium">{subtitle}</div>
            </div>
        </div>
    );
}
