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
import SocietiesTable from '../components/societies/SocietiesTable';
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
                <SocietiesTable
                    societies={societies}
                    isLoading={isLoading}
                    isToggling={isToggling}
                    onToggleStatus={toggleStatus}
                />
            )}

            <Pagination pagination={pagination} page={page} onPageChange={setPage} />
        </div>
    );
}
