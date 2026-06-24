import React, { useState } from 'react';
import { Users, Search } from 'lucide-react';
import { useGetStaffResidentsQuery } from '../../../store/api/staffApi';
import SearchInput from '../../../components/ui/SearchInput';
import Alert from '../../../components/ui/Alert';
import EmptyState from '../../../components/ui/EmptyState';
import PageHeader from '../../../components/ui/PageHeader';
import GuardResidentCard from '../components/residents/GuardResidentCard';

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
                    {residents.map((r) => (
                        <GuardResidentCard key={r._id} resident={r} />
                    ))}
                </div>
            )}
        </div>
    );
}
