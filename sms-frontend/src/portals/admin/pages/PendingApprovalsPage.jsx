/**
 * PendingApprovalsPage.jsx — Review and approve/reject resident registrations.
 * Uses extracted components following the super-admin portal architecture.
 */
import React, { useState } from 'react';
import { UserCheck, Check, Mail, Phone, Home, X } from 'lucide-react';
import {
    useListResidentProfilesQuery,
    useApproveResidentMutation,
} from '../../../store/api/societyAdminApi';
import { Button } from '../../../components/ui/Button';
import PageHeader from '../../../components/ui/PageHeader';
import Alert from '../../../components/ui/Alert';
import EmptyState from '../../../components/ui/EmptyState';
import StatusBadge from '../../../components/ui/StatusBadge';
import Pagination from '../../../components/ui/Pagination';
import RejectResidentModal from '../components/RejectResidentModal';

// ── Resident Approval Card ───────────────────────────────────────────────────
function ApprovalCard({ resident, onApprove, onReject, isApproving }) {
    const user = resident.userId;
    if (!user) return null;

    const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`;
    const unit = resident.unitId;

    return (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition-all hover:shadow-md">
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                {/* Left — Identity */}
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-bold text-white shadow">
                        {initials}
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-slate-900">
                                {user.firstName} {user.lastName}
                            </p>
                            <StatusBadge status="PENDING" label="PENDING REVIEW" />
                        </div>

                        {/* Contact + Unit details */}
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" /> {user.email}
                            </span>
                            {user.phone && (
                                <span className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" /> {user.phone}
                                </span>
                            )}
                            {unit && (
                                <span className="flex items-center gap-1">
                                    <Home className="h-3 w-3" />
                                    Unit {unit.unitNumber}
                                    {unit.bhkType && ` · ${unit.bhkType}`}
                                </span>
                            )}
                        </div>

                        {/* Meta */}
                        <div className="mt-2 flex flex-wrap gap-3 text-xs">
                            <span className="text-slate-400">
                                Ownership: <span className="font-medium text-slate-600">{resident.ownershipType}</span>
                            </span>
                            <span className="text-slate-400">
                                Applied: <span className="font-medium text-slate-600">
                                    {new Date(resident.createdAt).toLocaleDateString('en-IN')}
                                </span>
                            </span>
                            {resident.uploadedDocuments?.length > 0 && (
                                <span className="text-slate-400">
                                    Docs: <span className="font-medium text-emerald-600">{resident.uploadedDocuments.length} uploaded</span>
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right — Actions */}
                <div className="flex shrink-0 items-center gap-2 self-end sm:self-start">
                    <Button
                        size="sm"
                        variant="danger"
                        onClick={() => onReject(user._id, `${user.firstName} ${user.lastName}`)}
                    >
                        <X className="mr-1 h-3.5 w-3.5" /> Reject
                    </Button>
                    <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                        isLoading={isApproving}
                        onClick={() => onApprove(resident)}
                    >
                        <Check className="mr-1 h-3.5 w-3.5" /> Approve
                    </Button>
                </div>
            </div>
        </div>
    );
}

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
