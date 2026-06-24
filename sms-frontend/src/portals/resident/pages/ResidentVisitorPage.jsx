import React, { useState } from 'react';
import {
    useGetMyVisitorsQuery,
} from '../../../store/api/residentApi';
import { UserCheck, Plus } from 'lucide-react';

import PageHeader from '../../../components/ui/PageHeader';
import Alert from '../../../components/ui/Alert';
import EmptyState from '../../../components/ui/EmptyState';
import { Button } from '../../../components/ui/Button';

import { AddVisitorModal } from '../components/visitors/AddVisitorModal';
import { VisitorCard } from '../components/visitors/VisitorCard';

export default function ResidentVisitorPage() {
    const { data, isLoading, isError, refetch, isFetching } = useGetMyVisitorsQuery();
    const [showModal, setShowModal] = useState(false);
    const visitors = data?.data ?? [];

    return (
        <div className="space-y-5">
            <PageHeader
                title="Visitor Passes"
                subtitle="Manage your guest and visitor access"
                onRefresh={refetch}
                isFetching={isFetching}
                actions={
                    <Button onClick={() => setShowModal(true)}>
                        <Plus className="mr-1.5 h-4 w-4" /> Invite Visitor
                    </Button>
                }
            />

            {isError && (
                <Alert type="error">
                    Failed to load visitors.{' '}
                    <button onClick={refetch} className="underline ml-1">Retry</button>
                </Alert>
            )}

            {isLoading ? (
                <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-200" />)}</div>
            ) : !isError && visitors.length === 0 ? (
                <EmptyState
                    icon={UserCheck}
                    title="No visitor passes yet"
                    description="Create a pass to pre-approve a visitor."
                    action={
                        <Button onClick={() => setShowModal(true)}>
                            Invite Visitor
                        </Button>
                    }
                />
            ) : (
                <div className="space-y-3">{visitors.map(v => <VisitorCard key={v._id} visitor={v} />)}</div>
            )}

            {showModal && <AddVisitorModal onClose={() => { setShowModal(false); refetch(); }} />}
        </div>
    );
}
