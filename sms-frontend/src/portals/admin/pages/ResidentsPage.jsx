/**
 * ResidentsPage.jsx — View all society residents filtered by status.
 * Upgraded with premium aesthetics.
 */
import React, { useState } from 'react';
import { UserCheck, Mail, Phone, Users, Shield, RefreshCw } from 'lucide-react';
import { useListResidentsQuery } from '../../../store/api/societyAdminApi';
import Alert from '../../../components/ui/Alert';
import EmptyState from '../../../components/ui/EmptyState';
import StatusBadge from '../../../components/ui/StatusBadge';
import Pagination from '../../../components/ui/Pagination';
import SearchInput from '../../../components/ui/SearchInput';
import TabBar from '../../../components/ui/TabBar';
import Table from '../../../components/ui/Table';
import ResidentDetailsModal from '../components/residents/ResidentDetailsModal';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_TABS = [
    { value: 'APPROVED', label: 'Approved' },
    { value: 'PENDING_APPROVAL', label: 'Pending' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: '', label: 'All' },
];

export default function ResidentsPage() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('APPROVED');
    const [selectedResidentId, setSelectedResidentId] = useState(null);

    const { data, isLoading, isError, refetch, isFetching } = useListResidentsQuery({
        page, limit: 20, search,
        ...(statusFilter && { status: statusFilter }),
    });

    const residents = data?.data ?? [];
    const pagination = data?.pagination;

    return (
        <div className="space-y-8 pb-10">
            {/* Premium Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950 p-8 shadow-xl">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-purple-500/10 blur-2xl" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-purple-200 backdrop-blur-md">
                            <Shield className="h-4 w-4" />
                            Admin Directory
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                            Resident Management
                        </h1>
                        <p className="text-indigo-200 max-w-xl">
                            Manage approvals, view documents, and oversee all resident accounts in your society with ease.
                        </p>
                    </div>

                    <button
                        onClick={refetch}
                        disabled={isFetching}
                        className="group flex h-12 items-center gap-2 rounded-xl bg-white/10 px-6 font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-95 disabled:opacity-50"
                    >
                        <RefreshCw className={`h-5 w-5 ${isFetching ? 'animate-spin text-purple-300' : 'text-purple-200 group-hover:rotate-180 transition-transform duration-500'}`} />
                        {isFetching ? 'Refreshing...' : 'Refresh Data'}
                    </button>
                </div>
            </div>

            {isError && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <Alert type="error">Failed to load residents. Please check your connection and try again.</Alert>
                </motion.div>
            )}

            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                <div className="w-full sm:w-96">
                    <SearchInput
                        value={search}
                        onChange={(v) => { setSearch(v); setPage(1); }}
                        placeholder="Search by name, email, or phone..."
                        className="w-full bg-slate-50 border-transparent focus:bg-white transition-colors"
                    />
                </div>
                <div className="w-full sm:w-auto overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                    <TabBar
                        tabs={STATUS_TABS}
                        value={statusFilter}
                        onChange={(v) => { setStatusFilter(v); setPage(1); }}
                    />
                </div>
            </div>

            {/* Table Area */}
            <div className="relative">
                {!isError && residents.length === 0 && !isLoading ? (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                        <EmptyState
                            icon={Users}
                            title="No Residents Found"
                            description={`We couldn't find any ${statusFilter ? statusFilter.toLowerCase().replace(/_/g, ' ') : ''} residents matching your criteria.`}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-3xl bg-white shadow-xl shadow-slate-200/40 ring-1 ring-slate-100/60 overflow-hidden backdrop-blur-xl"
                    >
                        <Table className="border-0 shadow-none ring-0">
                            <Table.Head className="bg-slate-50/50">
                                <Table.HeadCell className="py-4">Resident Profile</Table.HeadCell>
                                <Table.HeadCell className="py-4 hidden sm:table-cell">Contact Info</Table.HeadCell>
                                <Table.HeadCell className="py-4">Status</Table.HeadCell>
                                <Table.HeadCell className="py-4 text-right pr-8 hidden md:table-cell">Joined</Table.HeadCell>
                            </Table.Head>

                            {isLoading ? (
                                <Table.Loader rows={6} cols={4} />
                            ) : (
                                <Table.Body>
                                    <AnimatePresence>
                                        {residents.map((r, idx) => {
                                            const initials = `${r.firstName?.[0] ?? ''}${r.lastName?.[0] ?? ''}`;
                                            return (
                                                <motion.tr
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    key={r._id}
                                                    onClick={() => setSelectedResidentId(r._id)}
                                                    className="group cursor-pointer border-b border-slate-50 transition-all hover:bg-indigo-50/40"
                                                >
                                                    <Table.Cell className="py-4 whitespace-normal min-w-[200px]">
                                                        <div className="flex items-center gap-4">
                                                            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white shadow-md shadow-indigo-200 group-hover:scale-110 transition-transform duration-300">
                                                                {initials}
                                                            </div>
                                                            <div>
                                                                <span className="block font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                                                    {r.firstName} {r.lastName}
                                                                </span>
                                                                <span className="block text-xs font-medium text-slate-400 mt-0.5">
                                                                    ID: {r._id.slice(-6).toUpperCase()}
                                                                </span>
                                                                {/* Mobile-only contact info */}
                                                                <div className="mt-2 flex flex-col gap-1 sm:hidden">
                                                                    <span className="flex items-center gap-1 text-[11px] text-slate-500"><Mail className="w-3 h-3" /> {r.email}</span>
                                                                    {r.phone && <span className="flex items-center gap-1 text-[11px] text-slate-500"><Phone className="w-3 h-3" /> {r.phone}</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Table.Cell>
                                                    <Table.Cell className="py-4 hidden sm:table-cell">
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center gap-2 text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                                                                <Mail className="h-4 w-4 text-indigo-400" />
                                                                {r.email}
                                                            </div>
                                                            {r.phone && (
                                                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                                                    <Phone className="h-4 w-4 text-indigo-300" />
                                                                    {r.phone}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </Table.Cell>
                                                    <Table.Cell className="py-4">
                                                        <StatusBadge status={r.registrationStatus} />
                                                    </Table.Cell>
                                                    <Table.Cell className="py-4 text-right pr-8 text-sm font-medium text-slate-400 hidden md:table-cell">
                                                        {new Date(r.createdAt).toLocaleDateString('en-IN', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </Table.Cell>
                                                </motion.tr>
                                            );
                                        })}
                                    </AnimatePresence>
                                </Table.Body>
                            )}
                        </Table>
                    </motion.div>
                )}
            </div>

            <div className="flex justify-end pt-4">
                <Pagination pagination={pagination} page={page} onPageChange={setPage} />
            </div>

            <ResidentDetailsModal residentId={selectedResidentId} onClose={() => setSelectedResidentId(null)} />
        </div>
    );
}
