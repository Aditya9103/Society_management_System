import React, { useState } from 'react';
import { useGetAllNoticesQuery } from '../../../store/api/societyAdminApi';
import { Bell, Plus } from 'lucide-react';
import PageHeader from '../../../components/ui/PageHeader';
import Alert from '../../../components/ui/Alert';
import EmptyState from '../../../components/ui/EmptyState';
import { Button } from '../../../components/ui/Button';
import CreateNoticeModal from '../components/notices/CreateNoticeModal';
import NoticeAdminCard from '../components/notices/NoticeAdminCard';

const STATUS_STYLES = {
    DRAFT: 'Draft',
    PUBLISHED: 'Published',
    ARCHIVED: 'Archived',
    SCHEDULED: 'Scheduled',
};

export default function AdminNoticesPage() {
    const [statusFilter, setStatusFilter] = useState('');
    const { data, isLoading, isError, refetch, isFetching } = useGetAllNoticesQuery({ status: statusFilter || undefined });
    const [showModal, setShowModal] = useState(false);
    const rawData = data?.data;
    const notices = Array.isArray(rawData?.data) ? rawData.data : (Array.isArray(rawData) ? rawData : []);

    return (
        <div className="space-y-5">
            <PageHeader 
                title="Notice Management"
                subtitle="Create and publish society-wide notices"
                onRefresh={refetch}
                isFetching={isFetching}
                actions={
                    <div className="flex items-center gap-3">
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                            <option value="">All Statuses</option>
                            {Object.keys(STATUS_STYLES).map(s => <option key={s} value={s}>{STATUS_STYLES[s]}</option>)}
                        </select>
                        <Button onClick={() => setShowModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            <Plus className="h-4 w-4 mr-2" /> Create Notice
                        </Button>
                    </div>
                }
            />

            {isError && <Alert type="error">Failed to load notices. <button onClick={refetch} className="underline ml-1">Retry</button></Alert>}

            {isLoading ? (
                <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200" />)}</div>
            ) : notices.length === 0 ? (
                <EmptyState 
                    icon={Bell} 
                    title="No notices yet" 
                />
            ) : (
                <div className="space-y-3">{notices.map(n => <NoticeAdminCard key={n._id} notice={n} />)}</div>
            )}

            {showModal && <CreateNoticeModal onClose={() => { setShowModal(false); refetch(); }} />}
        </div>
    );
}
