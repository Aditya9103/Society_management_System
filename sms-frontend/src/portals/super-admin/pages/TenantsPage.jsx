import React, { useState } from 'react';
import { Plus, Building2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import SearchInput from '../../../components/ui/SearchInput';
import StatusBadge from '../../../components/ui/StatusBadge';
import PageHeader from '../../../components/ui/PageHeader';
import Alert from '../../../components/ui/Alert';
import EmptyState from '../../../components/ui/EmptyState';
import Pagination from '../../../components/ui/Pagination';
import CreateTenantModal from '../components/CreateTenantModal';
import CreateSocietyAdminModal from '../components/CreateSocietyAdminModal';
import TenantsTable from '../components/tenants/TenantsTable';
import {
    useListTenantsQuery,
    useToggleTenantStatusMutation,
} from '../../../store/api/superAdminApi';

export default function TenantsPage() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isAssignAdminOpen, setIsAssignAdminOpen] = useState(false);

    const { data, isLoading, isFetching, isError, refetch } = useListTenantsQuery({
        page,
        limit: 15,
        search,
    });

    const [toggleStatus, { isLoading: isToggling }] = useToggleTenantStatusMutation();

    const tenants = data?.data ?? [];
    const pagination = data?.pagination;

    return (
        <div className="space-y-5">
            <PageHeader
                title="Tenants"
                subtitle="Manage all tenant organisations on the platform"
                onRefresh={refetch}
                isFetching={isFetching}
                actions={
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto mt-3 sm:mt-0">
                        <Button
                            variant="secondary"
                            onClick={() => setIsAssignAdminOpen(true)}
                            className="w-full sm:w-auto"
                        >
                            Assign Society Admin
                        </Button>
                        <Button onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto">
                            <Plus className="mr-1.5 h-4 w-4" /> New Tenant
                        </Button>
                    </div>
                }
            />

            {isError && <Alert type="error">Failed to load tenants. Please refresh.</Alert>}

            <SearchInput
                value={search}
                onChange={(v) => { setSearch(v); setPage(1); }}
                placeholder="Search by name, email or slug…"
                className="max-w-sm"
            />

            {!isError && tenants.length === 0 && !isLoading ? (
                <EmptyState icon={Building2} title="No tenants found" />
            ) : (
                <TenantsTable
                    tenants={tenants}
                    isLoading={isLoading}
                    isToggling={isToggling}
                    onToggleStatus={toggleStatus}
                />
            )}

            <Pagination pagination={pagination} page={page} onPageChange={setPage} />

            <CreateTenantModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
            <CreateSocietyAdminModal isOpen={isAssignAdminOpen} onClose={() => setIsAssignAdminOpen(false)} />
        </div>
    );
}
