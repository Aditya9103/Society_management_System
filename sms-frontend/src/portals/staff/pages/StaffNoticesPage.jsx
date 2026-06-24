import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useGetStaffNoticesQuery } from '../../../store/api/staffApi';
import { Bell, Plus } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import Alert from '../../../components/ui/Alert';
import EmptyState from '../../../components/ui/EmptyState';
import PageHeader from '../../../components/ui/PageHeader';
import NoticeCard from '../components/notices/NoticeCard';
import CreateNoticeModal from '../components/notices/CreateNoticeModal';

export default function StaffNoticesPage() {
    const { user } = useSelector(s => s.auth);
    const role = user?.role;
    const { data, isLoading, isError, refetch, isFetching } = useGetStaffNoticesQuery();
    const [showModal, setShowModal] = useState(false);
    const notices = data?.data ?? [];
    const canPublish = role === 'COMMITTEE_MEMBER';

    return (
        <div className="space-y-5">
            <PageHeader 
                title="Notice Board" 
                subtitle="Society announcements and communications"
                onRefresh={refetch}
                isFetching={isFetching}
                action={canPublish && (
                    <Button onClick={() => setShowModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        <Plus className="h-4 w-4 mr-2" /> Create Notice
                    </Button>
                )}
            />

            {isError && <Alert type="error">Failed to load notices.</Alert>}

            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-100" />)}
                </div>
            ) : notices.length === 0 ? (
                <EmptyState 
                    icon={Bell} 
                    title="No notices yet" 
                    description="There are currently no announcements." 
                />
            ) : (
                <div className="space-y-4">
                    {notices.map(n => <NoticeCard key={n._id} notice={n} canPublish={canPublish} />)}
                </div>
            )}

            <CreateNoticeModal isOpen={showModal} onClose={() => { setShowModal(false); refetch(); }} />
        </div>
    );
}
