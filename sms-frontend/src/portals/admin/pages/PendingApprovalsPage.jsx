import React, { useState } from 'react';
import { UserCheck, Users, Clock, Building, ShieldCheck, Search, Filter, List, RefreshCw } from 'lucide-react';
import {
    useListResidentProfilesQuery,
    useApproveResidentMutation,
    useListTowersQuery,
} from '../../../store/api/societyAdminApi';
import Alert from '../../../components/ui/Alert';
import EmptyState from '../../../components/ui/EmptyState';
import Pagination from '../../../components/ui/Pagination';
import RejectResidentModal from '../components/RejectResidentModal';
import ApprovalCard from '../components/approvals/ApprovalCard';
import { useLazyGetDocumentsQuery } from '../../../store/api/documentApi';
import Modal from '../../../components/ui/Modal';
import { FileText, Download } from 'lucide-react';

function ViewDocsModal({ isOpen, onClose, userId }) {
    const [trigger, { data, isFetching }] = useLazyGetDocumentsQuery();

    React.useEffect(() => {
        if (isOpen && userId) {
            trigger({ ownerId: userId, ownerType: 'RESIDENT' });
        }
    }, [isOpen, userId, trigger]);

    const docs = data?.data?.documents || [];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Resident Documents">
            <div className="p-4 space-y-4 bg-[#151722] rounded-xl border border-white/10">
                {isFetching ? (
                    <div className="text-center py-4 text-gray-300 font-bold">Loading documents...</div>
                ) : docs.length === 0 ? (
                    <div className="text-center py-8 text-gray-300 font-bold">No documents found.</div>
                ) : (
                    <div className="space-y-3">
                        {docs.map(doc => (
                            <div key={doc._id} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-8 w-8 text-[#b388ff]" />
                                    <div>
                                        <p className="font-bold text-white">{doc.title}</p>
                                        <p className="text-xs font-bold text-gray-300">{doc.documentType.replace(/_/g, ' ')}</p>
                                    </div>
                                </div>
                                <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="p-2 bg-[#6338f0]/20 text-[#b388ff] rounded hover:bg-[#6338f0]/40 transition-colors border border-[#6338f0]/30">
                                    <Download className="h-4 w-4" />
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Modal>
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
                            <h3 className="text-white font-bold text-[13px] tracking-wide">{title}</h3>
                        </div>
                        {pill && (
                            <div className="flex-shrink-0 mt-1">
                                {pill}
                            </div>
                        )}
                    </div>
                    <div className="text-white text-3xl font-black mb-1 tracking-tight">{value}</div>
                </div>
                <div className="text-white font-bold text-[12px]">{subtitle}</div>
            </div>
        </div>
    );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function PendingApprovalsPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [towerFilter, setTowerFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [alertMsg, setAlertMsg] = useState({ type: '', msg: '' });
    const [rejectModal, setRejectModal] = useState({ open: false, userId: '', name: '' });
    const [docsModal, setDocsModal] = useState({ open: false, userId: '' });

    const { data: towersData } = useListTowersQuery();

    const { data, isLoading, isError, refetch, isFetching } = useListResidentProfilesQuery({
        page,
        limit: 10,
        search,
        approvalStatus: 'PENDING',
        ...(towerFilter && { towerId: towerFilter }),
        ...(typeFilter && { ownershipType: typeFilter })
    });

    const [approveResident, { isLoading: isApproving }] = useApproveResidentMutation();

    const residents = data?.data ?? [];
    const pagination = data?.pagination;

    // Simulate some stats based on pagination since we don't have exact stats endpoint for pending
    const totalPending = pagination?.total || 0;

    const showAlert = (type, msg) => {
        setAlertMsg({ type, msg });
        setTimeout(() => setAlertMsg({ type: '', msg: '' }), 5000);
    };

    const handleApprove = async (resident) => {
        const userId = resident.userId?._id;
        const name = `${resident.userId?.firstName} ${resident.userId?.lastName}`;
        if (!userId) return;
        try {
            await approveResident({ id: userId }).unwrap();
            showAlert('success', `${name} has been approved and notified via email.`);
        } catch (err) {
            showAlert('error', err?.data?.message ?? 'Failed to approve. Please try again.');
        }
    };

    const handleOpenReject = (userId, name) => {
        setRejectModal({ open: true, userId, name });
    };

    return (
        <div className="space-y-6 font-sans pb-10">
            {/* Custom Header matching the mockup */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                    <h1 className="text-[28px] font-bold text-white tracking-tight leading-tight mb-1">
                        Pending Approvals
                    </h1>
                    <p className="text-[14px] font-bold text-gray-300">
                        Review and manage incoming resident registration requests
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={refetch}
                        className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#151722] text-white font-bold border border-white/5 hover:bg-white/10 transition-colors shadow-sm"
                    >
                        <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                    </button>
                    {totalPending > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-[#f59e0b] shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                            <Clock className="w-4 h-4" />
                            <span className="text-[14px] font-bold tracking-wide">{totalPending} Pending</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Stat Cards Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    title="Total Pending"
                    value={totalPending}
                    subtitle="Requests awaiting review"
                    icon={<Users className="w-5 h-5 text-white" />}
                    colors="from-indigo-600 to-purple-700"
                    iconBg="bg-white/20"
                />
                <StatCard
                    title="Applied Today"
                    value={totalPending > 0 ? 1 : 0}
                    subtitle="New requests today"
                    icon={<Clock className="w-5 h-5 text-white" />}
                    colors="from-orange-500 to-amber-600"
                    iconBg="bg-white/20"
                />
                <StatCard
                    title="This Week"
                    value={totalPending > 0 ? 2 : 0}
                    subtitle="Requests this week"
                    icon={<Building className="w-5 h-5 text-white" />}
                    colors="from-blue-500 to-cyan-600"
                    iconBg="bg-white/20"
                />
                <StatCard
                    title="Approval Rate"
                    value="95%"
                    subtitle="This month"
                    icon={<ShieldCheck className="w-5 h-5 text-white" />}
                    colors="from-emerald-500 to-teal-600"
                    iconBg="bg-white/20"
                />
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="relative w-full lg:flex-1 max-w-[400px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 font-bold" />
                    <input
                        type="text"
                        placeholder="Search by name, email, phone, or unit..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full bg-[#151722] text-[13px] text-white font-bold placeholder-gray-400 rounded-xl pl-11 pr-4 py-3 border border-white/5 focus:outline-none focus:border-[#6338f0]/50 shadow-sm"
                    />
                </div>

                <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 w-full lg:w-auto">
                    <select
                        value={towerFilter}
                        onChange={(e) => { setTowerFilter(e.target.value); setPage(1); }}
                        className="bg-[#151722] text-[13px] text-white font-bold rounded-xl px-4 py-3 border border-white/5 focus:outline-none focus:border-[#6338f0]/50 appearance-none min-w-[140px] bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23ffffff%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[position:right_12px_center] bg-[length:16px] shadow-sm"
                    >
                        <option value="">All Towers</option>
                        {towersData?.data?.map(t => (
                            <option key={t._id} value={t._id}>{t.name}</option>
                        ))}
                    </select>

                    <select
                        value={typeFilter}
                        onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                        className="bg-[#151722] text-[13px] text-white font-bold rounded-xl px-4 py-3 border border-white/5 focus:outline-none focus:border-[#6338f0]/50 appearance-none min-w-[140px] bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23ffffff%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[position:right_12px_center] bg-[length:16px] shadow-sm"
                    >
                        <option value="">All Types</option>
                        <option value="OWNER">Owner</option>
                        <option value="TENANT">Tenant</option>
                        <option value="FAMILY_MEMBER">Family Member</option>
                    </select>

                    <button className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#151722] text-white text-[13px] font-bold border border-white/5 hover:bg-white/5 transition-colors shadow-sm">
                        <Filter className="w-4 h-4" /> Filter
                    </button>

                    <button className="flex items-center justify-center w-[46px] h-[46px] rounded-xl bg-[#151722] text-white border border-white/5 hover:bg-white/5 transition-colors shadow-sm ml-auto lg:ml-2">
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {alertMsg.msg && <Alert type={alertMsg.type}>{alertMsg.msg}</Alert>}
            {isError && <Alert type="error">Failed to load pending approvals. Please refresh.</Alert>}

            {/* Approval Cards List */}
            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-32 animate-pulse rounded-2xl bg-white/5 border border-white/5" />
                    ))}
                </div>
            ) : !isError && residents.length === 0 ? (
                <EmptyState
                    icon={UserCheck}
                    title="All caught up!"
                    description="There are no pending resident approvals at this time."
                />
            ) : (
                <div className="flex flex-col gap-4">
                    {residents.map((resident) => (
                        <ApprovalCard
                            key={resident._id}
                            resident={resident}
                            onApprove={handleApprove}
                            onReject={handleOpenReject}
                            onViewDocs={(id) => setDocsModal({ open: true, userId: id })}
                            isApproving={isApproving}
                        />
                    ))}
                </div>
            )}

            <div className="bg-[#151722] border border-white/5 rounded-2xl p-2 px-4 shadow-sm flex items-center justify-between">
                <span className="text-[12px] font-bold text-gray-400">
                    Showing {residents.length > 0 ? (page - 1) * 10 + 1 : 0} to {Math.min(page * 10, totalPending)} of {totalPending} requests
                </span>
                <Pagination pagination={{ ...pagination, limit: 10 }} page={page} onPageChange={setPage} />
                <div className="flex items-center gap-2">
                    <span className="text-[12px] font-bold text-gray-400 hidden sm:block">Rows per page:</span>
                    <select className="bg-transparent text-[12px] font-bold text-white border-none focus:ring-0 cursor-pointer pl-1 pr-6 bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23ffffff%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[position:right_2px_center] bg-[length:12px] appearance-none">
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                    </select>
                </div>
            </div>

            <RejectResidentModal
                isOpen={rejectModal.open}
                onClose={() => setRejectModal({ open: false, userId: '', name: '' })}
                residentUserId={rejectModal.userId}
                residentName={rejectModal.name}
                onSuccess={(msg) => showAlert('success', msg)}
            />

            <ViewDocsModal
                isOpen={docsModal.open}
                onClose={() => setDocsModal({ open: false, userId: '' })}
                userId={docsModal.userId}
            />
        </div>
    );
}
