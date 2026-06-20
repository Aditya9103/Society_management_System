/**
 * StaffUnitsPage.jsx — Read-only units directory for staff.
 * Accessible to: COMMITTEE_MEMBER, ACCOUNTANT, FACILITY_MANAGER, HELPDESK.
 *
 * Uses global components: PageHeader, Alert, EmptyState, Pagination,
 * Table, StatusBadge, Card.
 */
import React, { useState } from 'react';
import { Grid3X3 } from 'lucide-react';
import { useGetStaffUnitsQuery } from '../../../store/api/staffApi';
import PageHeader from '../../../components/ui/PageHeader';
import Alert from '../../../components/ui/Alert';
import EmptyState from '../../../components/ui/EmptyState';
import Pagination from '../../../components/ui/Pagination';
import Table from '../../../components/ui/Table';
import StatusBadge from '../../../components/ui/StatusBadge';
import { cn } from '../../../components/ui/Button';

export default function StaffUnitsPage() {
    const [page, setPage] = useState(1);

    const { data, isLoading, isError, refetch, isFetching } = useGetStaffUnitsQuery({ page, limit: 25 });
    const units = data?.data ?? [];
    const pagination = data?.pagination;

    const total = pagination?.total ?? 0;
    const vacant = units.filter((u) => u.ownershipStatus === 'VACANT').length;
    const occupied = units.filter((u) => u.ownershipStatus !== 'VACANT').length;

    const pills = [
        { label: 'Total Units',  value: total,    cls: 'bg-blue-50 text-blue-700 ring-blue-100' },
        { label: 'Occupied',     value: occupied,  cls: 'bg-green-50 text-green-700 ring-green-100' },
        { label: 'Vacant',       value: vacant,    cls: 'bg-amber-50 text-amber-700 ring-amber-100' },
    ];

    return (
        <div className="space-y-5">
            <PageHeader
                title="Units Directory"
                subtitle="All units in your society buildings"
                onRefresh={refetch}
                isFetching={isFetching}
            />

            {isError && (
                <Alert type="error">
                    Failed to load units.{' '}
                    <button onClick={refetch} className="underline">Retry</button>
                </Alert>
            )}

            {/* Summary pills */}
            {!isLoading && total > 0 && (
                <div className="flex flex-wrap gap-3">
                    {pills.map(({ label, value, cls }) => (
                        <div key={label} className={cn('rounded-lg px-4 py-2 text-sm font-semibold ring-1', cls)}>
                            {label}: <span className="font-bold">{value}</span>
                        </div>
                    ))}
                </div>
            )}

            {!isError && units.length === 0 && !isLoading ? (
                <EmptyState icon={Grid3X3} title="No units found" />
            ) : (
                <Table>
                    <Table.Head>
                        <Table.HeadCell>Unit</Table.HeadCell>
                        <Table.HeadCell>Tower</Table.HeadCell>
                        <Table.HeadCell>Floor</Table.HeadCell>
                        <Table.HeadCell>Type</Table.HeadCell>
                        <Table.HeadCell>Area</Table.HeadCell>
                        <Table.HeadCell>Status</Table.HeadCell>
                    </Table.Head>
                    {isLoading ? (
                        <Table.Loader rows={8} cols={6} />
                    ) : (
                        <Table.Body>
                            {units.map((u) => (
                                <Table.Row key={u._id}>
                                    <Table.Cell>
                                        <p className="font-semibold text-gray-900">{u.unitNumber}</p>
                                        {u.bhkType && <p className="text-xs text-gray-400">{u.bhkType}</p>}
                                    </Table.Cell>
                                    <Table.Cell>{u.towerId?.name ?? '—'}</Table.Cell>
                                    <Table.Cell>{u.floorId?.floorName ?? '—'}</Table.Cell>
                                    <Table.Cell>
                                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                                            {u.unitType}
                                        </span>
                                    </Table.Cell>
                                    <Table.Cell>
                                        {u.carpetAreaSqft > 0 ? `${u.carpetAreaSqft} sqft` : '—'}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <StatusBadge status={u.ownershipStatus} />
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
