/**
 * GuardResidentsPage.jsx — Resident lookup for Security Guards.
 *
 * Guards can look up residents to verify identity at the gate.
 * Search by name to find unit and contact info.
 * Only fetches when ≥2 characters are typed (skip optimization).
 *
 * Uses global components: SearchInput, Alert, EmptyState, Card.
 */
import React, { useState } from 'react';
import { Users, Phone, Search } from 'lucide-react';
import { useGetStaffResidentsQuery } from '../../../store/api/staffApi';
import SearchInput from '../../../components/ui/SearchInput';
import Alert from '../../../components/ui/Alert';
import EmptyState from '../../../components/ui/EmptyState';
import StatusBadge from '../../../components/ui/StatusBadge';
import PageHeader from '../../../components/ui/PageHeader';

export default function GuardResidentsPage() {
    const [search, setSearch] = useState('');

    const { data, isLoading, isError, refetch } = useGetStaffResidentsQuery(
        { page: 1, limit: 50, search },
        { skip: search.length < 2 }
    );

    const residents = data?.data ?? [];

    return (
        <div className="space-y-5">
            <PageHeader
                title="Resident Lookup"
                subtitle="Search for a resident to verify identity. Type at least 2 characters."
            />

            <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search by resident name or email…"
                className="max-w-md"
            />

            {isError && (
                <Alert type="error">
                    Failed to search. <button onClick={refetch} className="underline">Retry</button>
                </Alert>
            )}

            {search.length < 2 ? (
                <EmptyState
                    icon={Search}
                    title="Type to search residents"
                    description="Enter at least 2 characters to begin"
                />
            ) : isLoading ? (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
                    ))}
                </div>
            ) : residents.length === 0 ? (
                <EmptyState
                    icon={Users}
                    title="No resident found"
                    description="Try a different name or email"
                />
            ) : (
                <div className="space-y-3">
                    {residents.map((r) => {
                        const initials = `${r.firstName?.[0] ?? ''}${r.lastName?.[0] ?? ''}`;
                        return (
                            <div key={r._id} className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-bold text-white">
                                    {initials}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-gray-900">{r.firstName} {r.lastName}</p>
                                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
                                        {r.phone && (
                                            <span className="flex items-center gap-1">
                                                <Phone className="h-3 w-3" /> {r.phone}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <StatusBadge status="RESIDENT" />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
