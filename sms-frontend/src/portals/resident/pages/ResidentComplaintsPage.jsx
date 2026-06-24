import React, { useState } from 'react';
import { useGetMyComplaintsQuery } from '../../../store/api/residentApi';
import { MessageSquareWarning, Plus } from 'lucide-react';
import PageHeader from '../../../components/ui/PageHeader';
import Alert from '../../../components/ui/Alert';
import EmptyState from '../../../components/ui/EmptyState';
import { Button } from '../../../components/ui/Button';

import { RaiseComplaintModal } from '../components/complaints/RaiseComplaintModal';
import { ComplaintCard } from '../components/complaints/ComplaintCard';

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ResidentComplaintsPage() {
    const { data, isLoading, isError, refetch, isFetching } = useGetMyComplaintsQuery();
    const [showModal, setShowModal] = useState(false);

    const complaints = data?.data ?? [];

    return (
        <div className="space-y-5">
            <PageHeader
                title="My Complaints"
                subtitle="Track and manage your maintenance requests"
                onRefresh={refetch}
                isFetching={isFetching}
                actions={
                    <Button onClick={() => setShowModal(true)}>
                        <Plus className="mr-1.5 h-4 w-4" /> Raise Complaint
                    </Button>
                }
            />

            {isError && (
                <Alert type="error">
                    Failed to load complaints.{' '}
                    <button onClick={refetch} className="underline ml-1">Retry</button>
                </Alert>
            )}

            {isLoading ? (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-200" />)}
                </div>
            ) : !isError && complaints.length === 0 ? (
                <EmptyState
                    icon={MessageSquareWarning}
                    title="No complaints yet"
                    description="Raise a complaint if you have a maintenance issue."
                    action={
                        <Button onClick={() => setShowModal(true)}>
                            Raise Complaint
                        </Button>
                    }
                />
            ) : (
                <div className="space-y-3">
                    {complaints.map(c => <ComplaintCard key={c._id} complaint={c} />)}
                </div>
            )}

            {showModal && <RaiseComplaintModal onClose={() => { setShowModal(false); refetch(); }} />}
        </div>
    );
}
