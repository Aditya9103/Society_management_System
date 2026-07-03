import React, { useState } from 'react';
import { Activity, Trash2, AlertTriangle } from 'lucide-react';
import PageHeader from '../../../components/ui/PageHeader';
import SearchInput from '../../../components/ui/SearchInput';
import Alert from '../../../components/ui/Alert';
import EmptyState from '../../../components/ui/EmptyState';
import Pagination from '../../../components/ui/Pagination';
import AuditLogsTable from '../components/audit-logs/AuditLogsTable';
import { Button } from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Select from '../../../components/ui/Select';
import { toast } from 'react-hot-toast';
import { useListAuditLogsQuery, useDeleteAuditLogsMutation } from '../../../store/api/superAdminApi';

export default function AuditLogsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);

    const { data, isLoading, isFetching, isError, refetch } = useListAuditLogsQuery({
        page,
        limit: 20,
        search: searchTerm || undefined
    });

    const [deleteLogs, { isLoading: isDeleting }] = useDeleteAuditLogsMutation();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteInterval, setDeleteInterval] = useState('730');

    const handleDeleteLogs = async () => {
        try {
            const res = await deleteLogs(parseInt(deleteInterval)).unwrap();
            toast.success(res.message || 'Audit logs deleted successfully');
            setIsDeleteModalOpen(false);
        } catch (error) {
            toast.error(error.data?.message || 'Failed to delete audit logs');
        }
    };

    const logs = data?.data ?? [];
    const pagination = data?.pagination;

    return (
        <div className="space-y-5">
            <PageHeader
                title="System Audit Logs"
                subtitle="Track platform-wide events and actions"
                onRefresh={refetch}
                isFetching={isFetching}
                actions={
                    <Button
                        variant="danger"
                        size="sm"
                        icon={Trash2}
                        onClick={() => setIsDeleteModalOpen(true)}
                    >
                        Delete Logs
                    </Button>
                }
            />

            {isError && <Alert type="error">Failed to load audit logs.</Alert>}

            <div className="flex flex-col sm:flex-row gap-4">
                <SearchInput
                    value={searchTerm}
                    onChange={(v) => { setSearchTerm(v); setPage(1); }}
                    placeholder="Search logs by action or resource name..."
                    className="max-w-sm"
                />
            </div>

            {!isError && logs.length === 0 && !isLoading ? (
                <EmptyState icon={Activity} title="No audit logs found" />
            ) : (
                <AuditLogsTable logs={logs} isLoading={isLoading} />
            )}

            <Pagination pagination={pagination} page={page} onPageChange={setPage} />

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Audit Logs"
                size="sm"
            >
                <div className="space-y-4">
                    <Alert type="warning" icon={AlertTriangle}>
                        This action is permanent and cannot be undone. Make sure you comply with your organization's data retention policies.
                    </Alert>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Time Interval
                        </label>
                        <Select
                            value={deleteInterval}
                            onChange={(e) => setDeleteInterval(e.target.value)}
                            className="w-full"
                        >
                            <option value="30">Older than 30 Days</option>
                            <option value="90">Older than 3 Months</option>
                            <option value="180">Older than 6 Months</option>
                            <option value="365">Older than 1 Year</option>
                            <option value="730">Older than 2 Years</option>
                            <option value="1825">Older than 5 Years</option>
                            <option value="0">All Time (Delete Everything)</option>
                        </Select>
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <Button
                        variant="secondary"
                        onClick={() => setIsDeleteModalOpen(false)}
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleDeleteLogs}
                        isLoading={isDeleting}
                    >
                        Delete Permanently
                    </Button>
                </div>
            </Modal>
        </div>
    );
}
