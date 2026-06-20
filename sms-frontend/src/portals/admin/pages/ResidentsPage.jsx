/**
 * ResidentsPage.jsx — View all society residents filtered by status.
 */
import React, { useState } from 'react';
import { UserCheck, Mail, Phone } from 'lucide-react';
import { useListResidentsQuery } from '../../../store/api/societyAdminApi';
import PageHeader from '../../../components/ui/PageHeader';
import Alert from '../../../components/ui/Alert';
import EmptyState from '../../../components/ui/EmptyState';
import StatusBadge from '../../../components/ui/StatusBadge';
import Pagination from '../../../components/ui/Pagination';
import SearchInput from '../../../components/ui/SearchInput';
import TabBar from '../../../components/ui/TabBar';
import Table from '../../../components/ui/Table';

const STATUS_TABS = [
    { value: 'APPROVED',        label: 'Approved' },
    { value: 'PENDING_APPROVAL', label: 'Pending' },
    { value: 'REJECTED',        label: 'Rejected' },
    { value: '',                label: 'All' },
];

export default function ResidentsPage() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('APPROVED');

    const { data, isLoading, isError, refetch, isFetching } = useListResidentsQuery({
        page, limit: 20, search,
        ...(statusFilter && { status: statusFilter }),
    });

    const residents = data?.data ?? [];
    const pagination = data?.pagination;

    return (
        <div className="space-y-5">
            <PageHeader
                title="Residents"
                subtitle="All registered residents in your society"
                onRefresh={refetch}
                isFetching={isFetching}
            />

            {isError && <Alert type="error">Failed to load residents. Please refresh.</Alert>}

            {/* Filter bar */}
            <div className="flex flex-wrap items-center gap-3">
                <SearchInput
                    value={search}
                    onChange={(v) => { setSearch(v); setPage(1); }}
                    placeholder="Search by name or email…"
                    className="w-full max-w-xs"
                />
                <TabBar
                    tabs={STATUS_TABS}
                    value={statusFilter}
                    onChange={(v) => { setStatusFilter(v); setPage(1); }}
                />
            </div>

            {/* Table */}
            {!isError && residents.length === 0 && !isLoading ? (
                <EmptyState
                    icon={UserCheck}
                    title="No residents found"
                    description={`No ${statusFilter ? statusFilter.toLowerCase().replace(/_/g, ' ') : ''} residents match your search.`}
                />
            ) : (
                <Table>
                    <Table.Head>
                        <Table.HeadCell>Resident</Table.HeadCell>
                        <Table.HeadCell>Contact</Table.HeadCell>
                        <Table.HeadCell>Status</Table.HeadCell>
                        <Table.HeadCell>Registered</Table.HeadCell>
                    </Table.Head>
                    {isLoading ? (
                        <Table.Loader rows={8} cols={4} />
                    ) : (
                        <Table.Body>
                            {residents.map((r) => {
                                const initials = `${r.firstName?.[0] ?? ''}${r.lastName?.[0] ?? ''}`;
                                return (
                                    <Table.Row key={r._id}>
                                        <Table.Cell>
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-xs font-bold text-white">
                                                    {initials}
                                                </div>
                                                <span className="font-medium text-slate-900">{r.firstName} {r.lastName}</span>
                                            </div>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                <Mail className="h-3.5 w-3.5 shrink-0" />{r.email}
                                            </div>
                                            {r.phone && (
                                                <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                                                    <Phone className="h-3.5 w-3.5 shrink-0" />{r.phone}
                                                </div>
                                            )}
                                        </Table.Cell>
                                        <Table.Cell><StatusBadge status={r.registrationStatus} /></Table.Cell>
                                        <Table.Cell className="text-xs text-slate-400">
                                            {new Date(r.createdAt).toLocaleDateString('en-IN')}
                                        </Table.Cell>
                                    </Table.Row>
                                );
                            })}
                        </Table.Body>
                    )}
                </Table>
            )}

            <Pagination pagination={pagination} page={page} onPageChange={setPage} />
        </div>
    );
}
