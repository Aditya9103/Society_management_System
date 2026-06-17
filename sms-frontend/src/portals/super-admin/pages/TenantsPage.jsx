import React, { useState } from 'react';
import { Plus, Search, RefreshCw, Building2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import StatusBadge from '../components/StatusBadge';
import CreateTenantModal from '../components/CreateTenantModal';
import CreateSocietyAdminModal from '../components/CreateSocietyAdminModal';
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

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const PLAN_COLORS = {
        BASIC: 'bg-gray-100 text-gray-600',
        STANDARD: 'bg-blue-100 text-blue-700',
        ENTERPRISE: 'bg-violet-100 text-violet-700',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage all tenant organisations on the platform.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsAssignAdminOpen(true)}
                    >
                        Assign Society Admin
                    </Button>
                    <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                        <Plus className="mr-1.5 h-4 w-4" />
                        New Tenant
                    </Button>
                </div>
            </div>

            {/* Search + Refresh */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email or slug…"
                        value={search}
                        onChange={handleSearchChange}
                        className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <button
                    onClick={refetch}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
                >
                    <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
                {isLoading ? (
                    <div className="space-y-0 divide-y divide-gray-50">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-16 animate-pulse bg-gray-50/60" />
                        ))}
                    </div>
                ) : isError ? (
                    <div className="px-6 py-10 text-center text-sm text-red-500">
                        Failed to load tenants.
                    </div>
                ) : tenants.length === 0 ? (
                    <div className="px-6 py-16 text-center">
                        <Building2 className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                        <p className="text-sm text-gray-500">No tenants found.</p>
                    </div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-gray-100 bg-gray-50/70">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Organisation</th>
                                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Slug</th>
                                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Plan</th>
                                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Contact</th>
                                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {tenants.map((t) => (
                                <tr key={t._id} className="transition-colors hover:bg-gray-50/50">
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-gray-900">{t.name}</p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(t.createdAt).toLocaleDateString('en-IN')}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="rounded-md bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-600">
                                            {t.slug}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${PLAN_COLORS[t.plan] || 'bg-gray-100 text-gray-600'}`}>
                                            {t.plan}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-gray-700">{t.contactName}</p>
                                        <p className="text-xs text-gray-400">{t.contactEmail}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge isActive={t.isActive} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <Button
                                            variant={t.isActive ? 'danger' : 'secondary'}
                                            size="sm"
                                            isLoading={isToggling}
                                            onClick={() => toggleStatus(t._id)}
                                        >
                                            {t.isActive ? 'Deactivate' : 'Activate'}
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between text-sm text-gray-500">
                    <p>
                        Showing {tenants.length} of {pagination.total} tenants
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            disabled={page <= 1}
                            onClick={() => setPage((p) => p - 1)}
                        >
                            Previous
                        </Button>
                        <span className="px-2">
                            Page {pagination.page} of {pagination.totalPages}
                        </span>
                        <Button
                            variant="secondary"
                            size="sm"
                            disabled={page >= pagination.totalPages}
                            onClick={() => setPage((p) => p + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            {/* Modals */}
            <CreateTenantModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
            <CreateSocietyAdminModal isOpen={isAssignAdminOpen} onClose={() => setIsAssignAdminOpen(false)} />
        </div>
    );
}
