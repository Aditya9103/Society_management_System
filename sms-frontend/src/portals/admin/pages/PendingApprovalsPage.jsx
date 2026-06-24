import React, { useState } from 'react';
import { UserCheck } from 'lucide-react';
import {
    useListResidentProfilesQuery,
    useApproveResidentMutation,
} from '../../../store/api/societyAdminApi';
import PageHeader from '../../../components/ui/PageHeader';
import Alert from '../../../components/ui/Alert';
import EmptyState from '../../../components/ui/EmptyState';
import Pagination from '../../../components/ui/Pagination';
import RejectResidentModal from '../components/RejectResidentModal';
import ApprovalCard from '../components/approvals/ApprovalCard';

// ── Page ─────────────────────────────────────────────────────────────────────
export default function PendingApprovalsPage() {
    const [page, setPage] = useState(1);
    const [alertMsg, setAlertMsg] = useState({ type: '', msg: '' });
    const [rejectModal, setRejectModal] = useState({ open: false, userId: '', name: '' });

    const { data, isLoading, isError, refetch, isFetching } = useListResidentProfilesQuery({
        page,
        limit: 20,
        approvalStatus: 'PENDING',
    });

    const [approveResident, { isLoading: isApproving }] = useApproveResidentMutation();

    const residents = data?.data ?? [];
    const pagination = data?.pagination;

    const showAlert = (type, msg) => {
        setAlertMsg({ type, msg });
        setTimeout(() => setAlertMsg({ type: '', msg: '' }), 5000);
    };

    const handleApprove = async (resident) => {
        const userId = resident.userId?._id;
        const name = `${resident.userId?.firstName} ${resident.userId?.lastName}`;
        if (!userId) return;
        try {
            await approveResident({ id: userId }).unwrap();
            showAlert('success', `${name} has been approved and notified via email.`);
        } catch (err) {
            showAlert('error', err?.data?.message ?? 'Failed to approve. Please try again.');
        }
    };

    const handleOpenReject = (userId, name) => {
        setRejectModal({ open: true, userId, name });
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Pending Approvals"
                subtitle="Review incoming resident registration requests"
                onRefresh={refetch}
                isFetching={isFetching}
                actions={
                    pagination?.total > 0 && (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
                            {pagination.total} pending
                        </span>
                    )
                }
            />

            {alertMsg.msg && <Alert type={alertMsg.type}>{alertMsg.msg}</Alert>}
            {isError && <Alert type="error">Failed to load pending approvals. Please refresh.</Alert>}

            {/* Card list */}
            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-36 animate-pulse rounded-2xl bg-slate-200" />
                    ))}
                </div>
            ) : !isError && residents.length === 0 ? (
                <EmptyState
                    icon={UserCheck}
                    title="All caught up!"
                    description="There are no pending resident approvals at this time."
                />
            ) : (
                <div className="space-y-4">
                    {residents.map((resident) => (
                        <ApprovalCard
                            key={resident._id}
                            resident={resident}
                            onApprove={handleApprove}
                            onReject={handleOpenReject}
                            isApproving={isApproving}
                        />
                    ))}
                </div>
            )}

            <Pagination pagination={pagination} page={page} onPageChange={setPage} />

            <RejectResidentModal
                isOpen={rejectModal.open}
                onClose={() => setRejectModal({ open: false, userId: '', name: '' })}
                residentUserId={rejectModal.userId}
                residentName={rejectModal.name}
                onSuccess={(msg) => showAlert('success', msg)}
            />
        </div>
    );
}
