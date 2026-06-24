import React, { useState } from 'react';
import { useGetAllComplaintsQuery, useListStaffQuery } from '../../../store/api/societyAdminApi';
import { MessageSquareWarning } from 'lucide-react';
import Select from '../../../components/ui/Select';
import PageHeader from '../../../components/ui/PageHeader';
import Alert from '../../../components/ui/Alert';
import EmptyState from '../../../components/ui/EmptyState';
import ComplaintRow from '../components/complaints/ComplaintRow';

const STATUS_STYLES = {
    OPEN: 'Open',
    ASSIGNED: 'Assigned',
    IN_PROGRESS: 'In Progress',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed',
    ESCALATED: 'Escalated',
    REJECTED: 'Rejected',
    REOPENED: 'Reopened',
};

export default function AdminComplaintsPage() {
    const [statusFilter, setStatusFilter] = useState('');
    const { data, isLoading, isError, refetch, isFetching } = useGetAllComplaintsQuery({ status: statusFilter || undefined });
    const { data: staffData } = useListStaffQuery();
    
    const complaints = data?.data ?? [];
    const staff = staffData?.data ?? [];

    return (
        <div className="space-y-5">
            <PageHeader 
                title="Complaint Management"
                subtitle="Review, assign, and resolve all society complaints"
                onRefresh={refetch}
                isFetching={isFetching}
                actions={
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                        <option value="">All Statuses</option>
                        {Object.keys(STATUS_STYLES).map(s => <option key={s} value={s}>{STATUS_STYLES[s]}</option>)}
                    </select>
                }
            />

            {isError && <Alert type="error">Failed to load complaints. <button onClick={refetch} className="underline ml-1">Retry</button></Alert>}

            {isLoading ? (
                <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200" />)}</div>
            ) : complaints.length === 0 ? (
                <EmptyState 
                    icon={MessageSquareWarning} 
                    title="No complaints found" 
                    description="There are currently no active complaints matching your criteria." 
                />
            ) : (
                <div className="space-y-3">{complaints.map(c => <ComplaintRow key={c._id} complaint={c} staff={staff} />)}</div>
            )}
        </div>
    );
}
