/**
 * SocietiesPage.jsx — All housing societies (Super Admin).
 * Standard layout: PageHeader, SearchInput, Table, Pagination.
 */
import React, { useState } from 'react';
import { Building2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import SearchInput from '../../../components/ui/SearchInput';
import StatusBadge from '../../../components/ui/StatusBadge';
import PageHeader from '../../../components/ui/PageHeader';
import Alert from '../../../components/ui/Alert';
import EmptyState from '../../../components/ui/EmptyState';
import Pagination from '../../../components/ui/Pagination';
import Table from '../../../components/ui/Table';
import {
    useListSocietiesQuery,
    useToggleSocietyStatusMutation,
} from '../../../store/api/superAdminApi';

export default function SocietiesPage() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const { data, isLoading, isFetching, isError, refetch } = useListSocietiesQuery({ page, limit: 15, search });
    const [toggleStatus, { isLoading: isToggling }] = useToggleSocietyStatusMutation();

    const societies = data?.data ?? [];
    const pagination = data?.pagination;

    return (
        <div className="space-y-5">
            <PageHeader
                title="Societies"
                subtitle="All housing societies registered on the platform"
                onRefresh={refetch}
                isFetching={isFetching}
            />

            {isError && <Alert type="error">Failed to load societies.</Alert>}

            <SearchInput
                value={search}
                onChange={(v) => { setSearch(v); setPage(1); }}
                placeholder="Search by name or city…"
                className="max-w-sm"
            />

            {!isError && societies.length === 0 && !isLoading ? (
                <EmptyState icon={Building2} title="No societies found" />
            ) : (
                <Table>
                    <Table.Head>
                        <Table.HeadCell>Society</Table.HeadCell>
                        <Table.HeadCell>Location</Table.HeadCell>
                        <Table.HeadCell>Units</Table.HeadCell>
                        <Table.HeadCell>Status</Table.HeadCell>
                        <Table.HeadCell>Actions</Table.HeadCell>
                    </Table.Head>
                    {isLoading ? (
                        <Table.Loader rows={6} cols={5} />
                    ) : (
                        <Table.Body>
                            {societies.map((s) => (
                                <Table.Row key={s._id}>
                                    <Table.Cell>
                                        <p className="font-medium text-slate-900">{s.name}</p>
                                        {s.registrationNumber && (
                                            <p className="text-xs text-slate-400">Reg: {s.registrationNumber}</p>
                                        )}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <p>{s.city}, {s.state}</p>
                                        <p className="text-xs text-slate-400">{s.pincode}</p>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <span className="font-medium">{s.totalUnits}</span>
                                        <span className="text-slate-400"> total</span>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <StatusBadge status={s.isActive ? 'ACTIVE' : 'INACTIVE'} />
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Button
                                            variant={s.isActive ? 'danger' : 'secondary'}
                                            size="sm"
                                            isLoading={isToggling}
                                            onClick={() => toggleStatus(s._id)}
                                        >
                                            {s.isActive ? 'Deactivate' : 'Activate'}
                                        </Button>
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    )}
                </Table>
            )}

            <Pagination pagination={pagination} page={page} onPageChange={setPage} />
        </div>
    );
}
