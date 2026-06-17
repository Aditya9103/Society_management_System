import React, { useState } from 'react';
import { Search, RefreshCw, Building2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import StatusBadge from '../components/StatusBadge';
import {
    useListSocietiesQuery,
    useToggleSocietyStatusMutation,
} from '../../../store/api/superAdminApi';

export default function SocietiesPage() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const { data, isLoading, isFetching, isError, refetch } = useListSocietiesQuery({
        page,
        limit: 15,
        search,
    });

    const [toggleStatus, { isLoading: isToggling }] = useToggleSocietyStatusMutation();

    const societies = data?.data ?? [];
    const pagination = data?.pagination;

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Societies</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        All housing societies registered on the platform.
                    </p>
                </div>
            </div>

            {/* Search + Refresh */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or city…"
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
                        Failed to load societies.
                    </div>
                ) : societies.length === 0 ? (
                    <div className="px-6 py-16 text-center">
                        <Building2 className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                        <p className="text-sm text-gray-500">No societies found.</p>
                    </div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-gray-100 bg-gray-50/70">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Society</th>
                                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Location</th>
                                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Units</th>
                                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {societies.map((s) => (
                                <tr key={s._id} className="transition-colors hover:bg-gray-50/50">
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-gray-900">{s.name}</p>
                                        {s.registrationNumber && (
                                            <p className="text-xs text-gray-400">Reg: {s.registrationNumber}</p>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-gray-700">{s.city}, {s.state}</p>
                                        <p className="text-xs text-gray-400">{s.pincode}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-medium text-gray-900">{s.totalUnits}</span>
                                        <span className="text-gray-400"> total</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge isActive={s.isActive} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <Button
                                            variant={s.isActive ? 'danger' : 'secondary'}
                                            size="sm"
                                            isLoading={isToggling}
                                            onClick={() => toggleStatus(s._id)}
                                        >
                                            {s.isActive ? 'Deactivate' : 'Activate'}
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
                        Showing {societies.length} of {pagination.total} societies
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
        </div>
    );
}
