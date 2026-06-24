import React from 'react';
import { useGetMyNoticesQuery } from '../../../store/api/residentApi';
import { Bell } from 'lucide-react';
import PageHeader from '../../../components/ui/PageHeader';
import Alert from '../../../components/ui/Alert';
import EmptyState from '../../../components/ui/EmptyState';
import { NoticeCard } from '../components/notices/NoticeCard';

export default function ResidentNoticesPage() {
    const { data, isLoading, isError, refetch, isFetching } = useGetMyNoticesQuery();
    const rawData = data?.data;
    const notices = Array.isArray(rawData?.data) ? rawData.data : (Array.isArray(rawData) ? rawData : []);
    const pinned = notices.filter(n => n.isPinned);
    const regular = notices.filter(n => !n.isPinned);

    return (
        <div className="space-y-5">
            <PageHeader
                title="Notice Board"
                subtitle="Society announcements and updates"
                onRefresh={refetch}
                isFetching={isFetching}
            />

            {isError && (
                <Alert type="error">
                    Failed to load notices.{' '}
                    <button onClick={refetch} className="underline ml-1">Retry</button>
                </Alert>
            )}

            {isLoading ? (
                <div className="space-y-3">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200" />)}
                </div>
            ) : !isError && notices.length === 0 ? (
                <EmptyState
                    icon={Bell}
                    title="No notices yet"
                    description="Society notices will appear here."
                />
            ) : (
                <>
                    {pinned.length > 0 && (
                        <div>
                            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-indigo-500">📌 Pinned</p>
                            <div className="space-y-3">{pinned.map(n => <NoticeCard key={n._id} notice={n} />)}</div>
                        </div>
                    )}
                    {regular.length > 0 && (
                        <div>
                            {pinned.length > 0 && <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Recent</p>}
                            <div className="space-y-3">{regular.map(n => <NoticeCard key={n._id} notice={n} />)}</div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
