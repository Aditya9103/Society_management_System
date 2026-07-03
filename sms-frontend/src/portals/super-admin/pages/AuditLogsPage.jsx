import React, { useState } from 'react';
import { Activity } from 'lucide-react';
import PageHeader from '../../../components/ui/PageHeader';
import SearchInput from '../../../components/ui/SearchInput';
import Alert from '../../../components/ui/Alert';
import EmptyState from '../../../components/ui/EmptyState';
import Pagination from '../../../components/ui/Pagination';
import AuditLogsTable from '../components/audit-logs/AuditLogsTable';
import { useListAuditLogsQuery } from '../../../store/api/superAdminApi';

export default function AuditLogsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);

    const { data, isLoading, isFetching, isError, refetch } = useListAuditLogsQuery({
        page,
        limit: 20,
        search: searchTerm || undefined
    });

    const logs = data?.data ?? [];
    const pagination = data?.pagination;

    return (
        <div className="space-y-5">
            <PageHeader
                title="System Audit Logs"
                subtitle="Track platform-wide events and actions"
                onRefresh={refetch}
                isFetching={isFetching}
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
        </div>
    );
}
