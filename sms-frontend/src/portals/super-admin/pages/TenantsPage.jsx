import React, { useState } from 'react';
import { Plus, Building2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import SearchInput from '../../../components/ui/SearchInput';
import StatusBadge from '../../../components/ui/StatusBadge';
import PageHeader from '../../../components/ui/PageHeader';
import Alert from '../../../components/ui/Alert';
import EmptyState from '../../../components/ui/EmptyState';
import Pagination from '../../../components/ui/Pagination';
import Table from '../../../components/ui/Table';
import CreateTenantModal from '../components/CreateTenantModal';
import CreateSocietyAdminModal from '../components/CreateSocietyAdminModal';
import {
    useListTenantsQuery,
    useToggleTenantStatusMutation,
} from '../../../store/api/superAdminApi';

const PLAN_COLORS = {
    BASIC: 'bg-gray-100 text-gray-600',
    STANDARD: 'bg-blue-100 text-blue-700',
    ENTERPRISE: 'bg-violet-100 text-violet-700',
};

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
                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            onClick={() => setIsAssignAdminOpen(true)}
                        >
                            Assign Society Admin
                        </Button>
                        <Button onClick={() => setIsCreateOpen(true)}>
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
                <Table>
                    <Table.Head>
                        <Table.HeadCell>Organisation</Table.HeadCell>
                        <Table.HeadCell>Slug</Table.HeadCell>
                        <Table.HeadCell>Plan</Table.HeadCell>
                        <Table.HeadCell>Contact</Table.HeadCell>
                        <Table.HeadCell>Status</Table.HeadCell>
                        <Table.HeadCell>Actions</Table.HeadCell>
                    </Table.Head>
                    {isLoading ? (
                        <Table.Loader rows={6} cols={6} />
                    ) : (
                        <Table.Body>
                            {tenants.map((t) => (
                                <Table.Row key={t._id}>
                                    <Table.Cell>
                                        <p className="font-medium text-slate-900">{t.name}</p>
                                        <p className="text-xs text-slate-400">
                                            {new Date(t.createdAt).toLocaleDateString('en-IN')}
                                        </p>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">
                                            {t.slug}
                                        </span>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${PLAN_COLORS[t.plan] || 'bg-slate-100 text-slate-600'}`}>
                                            {t.plan}
                                        </span>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <p className="text-slate-700">{t.contactName}</p>
                                        <p className="text-xs text-slate-400">{t.contactEmail}</p>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <StatusBadge status={t.isActive ? 'ACTIVE' : 'INACTIVE'} />
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Button
                                            variant={t.isActive ? 'danger' : 'secondary'}
                                            size="sm"
                                            isLoading={isToggling}
                                            onClick={() => toggleStatus(t._id)}
                                        >
                                            {t.isActive ? 'Deactivate' : 'Activate'}
                                        </Button>
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    )}
                </Table>
            )}

            <Pagination pagination={pagination} page={page} onPageChange={setPage} />

            <CreateTenantModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
            <CreateSocietyAdminModal isOpen={isAssignAdminOpen} onClose={() => setIsAssignAdminOpen(false)} />
        </div>
    );
}
