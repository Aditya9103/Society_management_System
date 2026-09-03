import React, { useState } from 'react';
import { useGetViolationsQuery, useGetViolationStatsQuery, useUpdateViolationStatusMutation } from '../../../store/api/societyAdminApi';
import { ShieldAlert, Search, Filter, Plus, FileText, CheckCircle2, XCircle, AlertCircle, IndianRupee } from 'lucide-react';
import PageHeader from '../../../components/ui/PageHeader';
import Alert from '../../../components/ui/Alert';
import CreateViolationModal from '../components/violations/CreateViolationModal';
import StatCard from '../components/dashboard/StatCard';

const STATUS_COLORS = {
    PENDING: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    PAID: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    APPEALED: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    DISMISSED: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
};

const TYPE_LABELS = {
    WRONG_PARKING: 'Wrong Parking',
    SPEEDING: 'Speeding',
    OVERNIGHT_PARKING: 'Overnight Parking',
    NO_STICKER: 'No Sticker',
    NOISE: 'Noise Complaint',
    LITTERING: 'Littering',
    DAMAGE: 'Property Damage',
    PET_ISSUE: 'Pet Issue',
    UNAUTHORIZED_MODIFICATION: 'Unauthorized Modification',
    OTHER: 'Other'
};

export default function AdminViolationsPage() {
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { data: statsData } = useGetViolationStatsQuery();
    const { data: violationsData, isLoading, isError } = useGetViolationsQuery(
        statusFilter !== 'ALL' ? { status: statusFilter } : {}
    );
    const [updateStatus, { isLoading: isUpdating }] = useUpdateViolationStatusMutation();

    const stats = statsData?.data?.stats || {
        totalViolations: 0,
        pendingAmount: 0,
        paidAmount: 0,
        pendingCount: 0
    };

    const violations = violationsData?.data?.violations || [];

    const filteredViolations = violations.filter(v => {
        if (!searchQuery) return true;
        const residentName = `${v.residentId?.userId?.firstName || ''} ${v.residentId?.userId?.lastName || ''}`.toLowerCase();
        const flat = `${v.residentId?.tower}-${v.residentId?.flatNumber}`.toLowerCase();
        const type = (TYPE_LABELS[v.type] || v.type).toLowerCase();
        const q = searchQuery.toLowerCase();
        return residentName.includes(q) || flat.includes(q) || type.includes(q);
    });

    const handleStatusChange = async (id, newStatus) => {
        try {
            await updateStatus({ id, status: newStatus }).unwrap();
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader 
                title="Violation Tracking" 
                subtitle="Manage and track society rule violations"
                icon={ShieldAlert}
                action={
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#6338f0] text-white rounded-[12px] font-semibold hover:bg-[#5b32dd] transition-colors shadow-lg shadow-[#6338f0]/20"
                    >
                        <Plus className="w-5 h-5" />
                        Log Violation
                    </button>
                }
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                    label="Total Violations" 
                    value={stats.totalViolations} 
                    icon={ShieldAlert} 
                    gradient="bg-gradient-to-br from-indigo-500 to-purple-600" 
                />
                
                <StatCard 
                    label="Pending Fines" 
                    value={`₹${stats.pendingAmount}`} 
                    subLabel="Unpaid incidents"
                    subValue={stats.pendingCount}
                    icon={AlertCircle} 
                    gradient="bg-gradient-to-br from-amber-500 to-orange-600" 
                />

                <StatCard 
                    label="Collected Fines" 
                    value={`₹${stats.paidAmount}`} 
                    subLabel="Resolved incidents"
                    subValue={stats.paidCount}
                    icon={CheckCircle2} 
                    gradient="bg-gradient-to-br from-emerald-500 to-teal-600" 
                />

                <StatCard 
                    label="Appealed" 
                    value={stats.appealedCount} 
                    icon={ShieldAlert} 
                    gradient="bg-gradient-to-br from-blue-500 to-cyan-600" 
                />
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by resident name, flat, or type..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#1a1c29]/50 border border-slate-700/50 rounded-[14px] pl-12 pr-4 py-3.5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#6338f0] focus:ring-1 focus:ring-[#6338f0] transition-all"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                    {['ALL', 'PENDING', 'PAID', 'APPEALED', 'DISMISSED'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-3 rounded-[12px] font-semibold text-sm whitespace-nowrap transition-all flex items-center gap-2
                                ${statusFilter === status 
                                    ? 'bg-[#6338f0] text-white shadow-lg shadow-[#6338f0]/20 border border-[#6338f0]' 
                                    : 'bg-[#1a1c29]/50 text-slate-400 border border-slate-700/50 hover:bg-slate-800'
                                }`}
                        >
                            <Filter className="w-4 h-4" />
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Violations List */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6338f0]"></div>
                </div>
            ) : isError ? (
                <Alert type="error">Failed to load violations</Alert>
            ) : filteredViolations.length === 0 ? (
                <div className="text-center py-12 bg-[#1a1c29]/50 rounded-[20px] border border-slate-700/50">
                    <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4 border border-slate-700/50">
                        <FileText className="w-8 h-8 text-slate-500" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-300 mb-1">No violations found</h3>
                    <p className="text-slate-500 text-sm">Everything looks good!</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredViolations.map((violation) => (
                        <div key={violation._id} className="bg-[#1a1c29]/80 backdrop-blur-xl border border-slate-700/50 rounded-[20px] p-5 hover:border-[#6338f0]/50 transition-all shadow-lg group">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Left: Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider ${STATUS_COLORS[violation.status]}`}>
                                            {violation.status}
                                        </span>
                                        <span className="text-xs font-semibold text-slate-400">
                                            {new Date(violation.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    
                                    <h3 className="text-lg font-bold text-white mb-1">
                                        {TYPE_LABELS[violation.type] || violation.type}
                                    </h3>
                                    
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-400 mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 overflow-hidden">
                                                {violation.residentId?.userId?.avatar ? (
                                                    <img src={violation.residentId.userId.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-[10px] font-bold text-slate-300">
                                                        {violation.residentId?.userId?.firstName?.charAt(0)}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="font-semibold text-slate-300">
                                                {violation.residentId?.userId?.firstName} {violation.residentId?.userId?.lastName}
                                            </span>
                                            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-bold border border-slate-700">
                                                {violation.residentId?.tower}-{violation.residentId?.flatNumber}
                                            </span>
                                        </div>
                                    </div>

                                    {violation.description && (
                                        <p className="text-sm text-slate-400 leading-relaxed mb-4 line-clamp-2">
                                            {violation.description}
                                        </p>
                                    )}

                                    {violation.reportedBy && (
                                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                            <ShieldAlert className="w-3.5 h-3.5" />
                                            Reported by {violation.reportedBy.firstName} ({violation.reportedBy.role})
                                        </div>
                                    )}
                                </div>

                                {/* Right: Actions & Fine */}
                                <div className="flex flex-col items-start md:items-end justify-between border-t md:border-t-0 md:border-l border-slate-700/50 pt-4 md:pt-0 md:pl-6 min-w-[200px]">
                                    <div className="text-left md:text-right w-full mb-4 md:mb-0">
                                        <div className="text-xs font-bold text-slate-500 uppercase mb-1">Fine Amount</div>
                                        <div className="text-2xl font-bold text-white">₹{violation.fineAmount || 0}</div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 w-full justify-start md:justify-end">
                                        {violation.status === 'PENDING' && (
                                            <>
                                                <button
                                                    onClick={() => handleStatusChange(violation._id, 'PAID')}
                                                    disabled={isUpdating}
                                                    className="px-4 py-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-[10px] text-xs font-bold transition-colors"
                                                >
                                                    Mark Paid
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(violation._id, 'DISMISSED')}
                                                    disabled={isUpdating}
                                                    className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 rounded-[10px] text-xs font-bold transition-colors"
                                                >
                                                    Dismiss
                                                </button>
                                            </>
                                        )}
                                        {violation.status === 'APPEALED' && (
                                            <>
                                                <button
                                                    onClick={() => handleStatusChange(violation._id, 'DISMISSED')}
                                                    disabled={isUpdating}
                                                    className="px-4 py-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-[10px] text-xs font-bold transition-colors flex-1 md:flex-none text-center"
                                                >
                                                    Approve Appeal (Dismiss)
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(violation._id, 'PENDING')}
                                                    disabled={isUpdating}
                                                    className="px-4 py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20 rounded-[10px] text-xs font-bold transition-colors flex-1 md:flex-none text-center"
                                                >
                                                    Reject Appeal
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            <CreateViolationModal 
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    );
}
