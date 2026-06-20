/**
 * StaffResidentsPage.jsx — Read-only resident directory for staff.
 * Uses global components: SearchInput, Table, PageHeader, Alert, EmptyState, Pagination.
 */
import React, { useState } from 'react';
import { Users, Mail, Phone } from 'lucide-react';
import { useGetStaffResidentsQuery } from '../../../store/api/staffApi';
import PageHeader from '../../../components/ui/PageHeader';
import Alert from '../../../components/ui/Alert';
import EmptyState from '../../../components/ui/EmptyState';
import Pagination from '../../../components/ui/Pagination';
import SearchInput from '../../../components/ui/SearchInput';
import Table from '../../../components/ui/Table';

export default function StaffResidentsPage() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const { data, isLoading, isError, refetch, isFetching } = useGetStaffResidentsQuery({ page, limit: 20, search });
    const residents = data?.data ?? [];
    const pagination = data?.pagination;

    return (
        <div className="space-y-5">
            <PageHeader
                title="Residents Directory"
                subtitle="All approved residents in your society"
                onRefresh={refetch}
                isFetching={isFetching}
            />

            {isError && (
                <Alert type="error">
                    Failed to load residents.{' '}
                    <button onClick={refetch} className="underline">Retry</button>
                </Alert>
            )}

            <SearchInput
                value={search}
                onChange={(v) => { setSearch(v); setPage(1); }}
                placeholder="Search by name or email…"
                className="max-w-xs"
            />

            {!isError && residents.length === 0 && !isLoading ? (
                <EmptyState
                    icon={Users}
                    title="No residents found"
                    description={search ? 'Try clearing your search.' : 'No approved residents yet.'}
                />
            ) : (
                <Table>
                    <Table.Head>
                        <Table.HeadCell>Resident</Table.HeadCell>
                        <Table.HeadCell>Email</Table.HeadCell>
                        <Table.HeadCell>Phone</Table.HeadCell>
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
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-rose-500 text-xs font-bold text-white">
                                                    {initials}
                                                </div>
                                                <span className="font-medium text-slate-900">{r.firstName} {r.lastName}</span>
                                            </div>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                <Mail className="h-3.5 w-3.5 shrink-0" />{r.email}
                                            </div>
                                        </Table.Cell>
                                        <Table.Cell className="text-xs text-slate-500">
                                            {r.phone ? (
                                                <div className="flex items-center gap-1.5">
                                                    <Phone className="h-3.5 w-3.5 shrink-0" />{r.phone}
                                                </div>
                                            ) : '—'}
                                        </Table.Cell>
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
