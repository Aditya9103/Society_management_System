import React, { useState } from 'react';
import { Users, Search, Filter, LayoutGrid, List as ListIcon, RefreshCw, UserCheck, Briefcase, Plus, UserPlus } from 'lucide-react';
import { useListStaffQuery, useDeactivateStaffMutation, useDeleteStaffMutation } from '../../../store/api/societyAdminApi';
import Pagination from '../../../components/ui/Pagination';
import CreateStaffModal from '../components/CreateStaffModal';
import StaffCard from '../components/staff/StaffCard';
import StaffTable from '../components/staff/StaffTable';

export default function StaffPage() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
    
    const { data, isLoading, isError, refetch, isFetching } = useListStaffQuery({ 
        page, 
        limit: 15, 
        search,
        ...(statusFilter && { status: statusFilter }),
        ...(roleFilter && { role: roleFilter })
    });
    
    const [deactivateStaff, { isLoading: isDeactivating }] = useDeactivateStaffMutation();
    const [deleteStaff, { isLoading: isDeleting }] = useDeleteStaffMutation();

    const staff = data?.data ?? [];
    const pagination = data?.pagination;
    const stats = data?.stats ?? { totalStaff: 0, activeStaff: 0, departments: 0, thisMonthJoined: 0 };

    const handleDeactivate = async (member) => {
        const name = `${member.firstName} ${member.lastName}`;
        if (!window.confirm(`Deactivate ${name}? They will lose portal access immediately.`)) return;
        try {
            await deactivateStaff(member._id).unwrap();
            alert(`${name} has been deactivated.`);
        } catch (err) {
            alert(err?.data?.message ?? 'Failed to deactivate. Please try again.');
        }
    };

    const handleDelete = async (member) => {
        const name = `${member.firstName} ${member.lastName}`;
        if (!window.confirm(`PERMANENTLY delete ${name}? This action cannot be undone.`)) return;
        try {
            await deleteStaff(member._id).unwrap();
            alert(`${name} has been permanently deleted.`);
        } catch (err) {
            alert(err?.data?.message ?? 'Failed to delete. Please try again.');
        }
    };

    return (
        <div className="space-y-6 pb-10 font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Staff Management</h1>
                    <p className="text-white font-bold font-bold text-sm mt-1">
                        Manage your society's staff team and their access
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={refetch} className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#151722] text-white font-bold border border-white/5 hover:bg-white/5 transition-colors">
                        <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                    </button>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6338f0] text-white text-sm font-bold shadow-[0_0_20px_rgba(99,56,240,0.4)] hover:bg-[#5229db] transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Add New Staff
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <StatCard
                    title="Total Staff"
                    value={stats.totalStaff}
                    subtitle="All team members"
                    icon={<Users className="w-5 h-5 text-white" />}
                    colors="from-indigo-600 to-purple-700"
                    iconBg="bg-white/20"
                    onClick={() => { setStatusFilter(''); setRoleFilter(''); setPage(1); }}
                />
                <StatCard
                    title="Active Staff"
                    value={stats.activeStaff}
                    subtitle="Currently active"
                    icon={<UserCheck className="w-5 h-5 text-white" />}
                    colors="from-blue-500 to-cyan-600"
                    iconBg="bg-white/20"
                    onClick={() => { setStatusFilter('active'); setPage(1); }}
                    pill={stats.activeStaff > 0 ? <span className="px-2 py-1 rounded bg-white/20 text-white text-[10px] font-bold shadow-sm">+{stats.activeStaff} Active</span> : null}
                />
                <StatCard
                    title="Departments"
                    value={stats.departments}
                    subtitle="Different roles"
                    icon={<Briefcase className="w-5 h-5 text-white" />}
                    colors="from-orange-500 to-amber-600"
                    iconBg="bg-white/20"
                    onClick={() => { setStatusFilter(''); setPage(1); }}
                />
                <StatCard
                    title="This Month Joined"
                    value={stats.thisMonthJoined}
                    subtitle="New team members"
                    icon={<UserPlus className="w-5 h-5 text-white" />}
                    colors="from-emerald-500 to-teal-600"
                    iconBg="bg-white/20"
                    pill={stats.thisMonthJoined > 0 ? <span className="px-2 py-1 rounded bg-white/20 text-white text-[10px] font-bold shadow-sm">+{stats.thisMonthJoined} New</span> : null}
                />
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="relative w-full lg:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-200 font-bold" />
                    <input
                        type="text"
                        placeholder="Search by name, email, phone or role..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full bg-[#151722] text-sm text-white placeholder-gray-300 font-bold rounded-xl pl-11 pr-4 py-3 border border-white/5 focus:outline-none focus:border-[#6338f0]/50"
                    />
                </div>
                
                <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 w-full lg:w-auto">
                    <select
                        value={roleFilter}
                        onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                        className="bg-[#151722] text-sm text-white font-bold rounded-xl px-4 py-3 border border-white/5 focus:outline-none focus:border-[#6338f0]/50 appearance-none flex-1 lg:w-40 bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[position:right_12px_center] bg-[length:16px]"
                    >
                        <option value="">All Roles</option>
                        <option value="COMMITTEE_MEMBER">Committee</option>
                        <option value="ACCOUNTANT">Accountant</option>
                        <option value="FACILITY_MANAGER">Facility Manager</option>
                        <option value="HELP_DESK">Help Desk</option>
                        <option value="SECURITY_GUARD">Security Guard</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className="bg-[#151722] text-sm text-white font-bold rounded-xl px-4 py-3 border border-white/5 focus:outline-none focus:border-[#6338f0]/50 appearance-none flex-1 lg:w-40 bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[position:right_12px_center] bg-[length:16px]"
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>

                    <button className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#151722] text-white font-bold text-sm font-semibold border border-white/5 hover:bg-white/5 transition-colors">
                        <Filter className="w-4 h-4" /> Filters
                    </button>

                    <div className="flex bg-[#151722] rounded-xl p-1 border border-white/5 ml-auto">
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[#6338f0] text-white' : 'text-gray-200 font-bold hover:text-white font-bold'}`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[#6338f0] text-white' : 'text-gray-200 font-bold hover:text-white font-bold'}`}
                        >
                            <ListIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Data View */}
            {isLoading ? (
                viewMode === 'grid' ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-40 animate-pulse rounded-2xl bg-white/5" />
                        ))}
                    </div>
                ) : (
                    <div className="h-96 animate-pulse rounded-2xl bg-white/5" />
                )
            ) : !isError && staff.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-[#151722] rounded-2xl border border-white/5">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                        <Users className="w-8 h-8 text-gray-200 font-bold" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Staff Members</h3>
                    <p className="text-white font-bold text-sm mb-6 max-w-sm text-center">
                        There are currently no staff members matching your filters. Add a new staff member or clear filters.
                    </p>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="px-6 py-2.5 rounded-xl bg-[#6338f0] text-white text-sm font-bold shadow-[0_0_20px_rgba(99,56,240,0.4)] hover:bg-[#5229db] transition-colors"
                    >
                        Add Staff Member
                    </button>
                </div>
            ) : (
                viewMode === 'list' ? (
                    <StaffTable 
                        staff={staff} 
                        onDeactivate={handleDeactivate} 
                        isDeactivating={isDeactivating} 
                        onDelete={handleDelete} 
                        isDeleting={isDeleting} 
                    />
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {staff.map((member) => (
                            <StaffCard 
                                key={member._id} 
                                member={member} 
                                onDeactivate={handleDeactivate} 
                                isDeactivating={isDeactivating} 
                                onDelete={handleDelete} 
                                isDeleting={isDeleting} 
                            />
                        ))}
                    </div>
                )
            )}

            <div className="flex justify-between items-center bg-[#151722] p-4 rounded-xl border border-white/5">
                <span className="text-sm text-white font-bold">
                    Showing {(page - 1) * 15 + 1} to {Math.min(page * 15, pagination?.total || 0)} of {pagination?.total || 0} staff members
                </span>
                <Pagination pagination={pagination} page={page} onPageChange={setPage} />
            </div>

            <CreateStaffModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    refetch();
                }}
            />
        </div>
    );
}

function StatCard({ title, value, subtitle, icon, colors, iconBg, onClick, pill }) {
    return (
        <div onClick={onClick} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colors} p-5 border border-white/5 shadow-lg ${onClick ? 'cursor-pointer hover:scale-[1.02] transition-transform' : ''}`}>
            {/* Abstract Background Waves (CSS based) */}
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
                            <h3 className="text-white font-bold text-[13px] font-bold tracking-wide">{title}</h3>
                        </div>
                        {pill && (
                            <div className="flex-shrink-0 mt-1">
                                {pill}
                            </div>
                        )}
                    </div>
                    <div className="text-white text-3xl font-black mb-1 tracking-tight">{value}</div>
                </div>
                <div className="text-white font-bold text-[12px] font-bold">{subtitle}</div>
            </div>
        </div>
    );
}
