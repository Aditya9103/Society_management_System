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
import { useLazyGetDocumentsQuery } from '../../../store/api/documentApi';
import Modal from '../../../components/ui/Modal';
import { FileText, Download } from 'lucide-react';

function ViewDocsModal({ isOpen, onClose, userId }) {
    const [trigger, { data, isFetching }] = useLazyGetDocumentsQuery();

    React.useEffect(() => {
        if (isOpen && userId) {
            trigger({ ownerId: userId, ownerType: 'RESIDENT' });
        }
    }, [isOpen, userId, trigger]);

    const docs = data?.data?.documents || [];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Resident Documents">
            <div className="p-4 space-y-4">
                {isFetching ? (
                    <div className="text-center py-4 text-slate-500">Loading documents...</div>
                ) : docs.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">No documents found.</div>
                ) : (
                    <div className="space-y-3">
                        {docs.map(doc => (
                            <div key={doc._id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-8 w-8 text-indigo-500" />
                                    <div>
                                        <p className="font-semibold text-slate-800">{doc.title}</p>
                                        <p className="text-xs text-slate-500">{doc.documentType.replace(/_/g, ' ')}</p>
                                    </div>
                                </div>
                                <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="p-2 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100">
                                    <Download className="h-4 w-4" />
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Modal>
    );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function PendingApprovalsPage() {
    const [page, setPage] = useState(1);
    const [alertMsg, setAlertMsg] = useState({ type: '', msg: '' });
    const [rejectModal, setRejectModal] = useState({ open: false, userId: '', name: '' });
    const [docsModal, setDocsModal] = useState({ open: false, userId: '' });

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
                            onViewDocs={(id) => setDocsModal({ open: true, userId: id })}
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

            <ViewDocsModal
                isOpen={docsModal.open}
                onClose={() => setDocsModal({ open: false, userId: '' })}
                userId={docsModal.userId}
            />
        </div>
    );
}
