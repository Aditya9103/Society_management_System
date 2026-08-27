import React from 'react';
import { useGetAdminDashboardQuery } from '../../../store/api/societyAdminApi';
import { useSelector } from 'react-redux';
import AdminHeader from '../components/dashboard/AdminHeader';
import AdminStatCards from '../components/dashboard/AdminStatCards';
import PaymentOverview from '../components/dashboard/PaymentOverview';
import RecentNoticesList from '../components/dashboard/RecentNoticesList';
import PendingApprovalsList from '../components/dashboard/PendingApprovalsList';
import ComplaintsOverviewChart from '../components/dashboard/ComplaintsOverviewChart';
import QuickActionsGrid from '../components/dashboard/QuickActionsGrid';
import TodaySnapshotList from '../components/dashboard/TodaySnapshotList';

export default function DashboardPage() {
    const { data, isLoading, isError } = useGetAdminDashboardQuery();
    const s = data?.data || {};
    const { user } = useSelector(state => state.auth);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0b0c10]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0b0c10] text-red-500">
                Failed to load dashboard data. Please try again.
            </div>
        );
    }

    return (
        <div className="text-gray-100 space-y-4 lg:space-y-6 font-sans relative">
            <AdminHeader user={user} societyName={s.societyName} />
            
            <AdminStatCards stats={s} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <PaymentOverview payment={s.payment} />
                <RecentNoticesList notices={s.recentNotices} />
                <PendingApprovalsList approvals={s.pendingApprovalsList} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ComplaintsOverviewChart complaints={s.complaints} totalComplaints={
                    (s.complaints?.open || 0) + (s.complaints?.inProgress || 0) + (s.complaints?.resolved || 0) + (s.complaints?.closed || 0)
                } />
                <QuickActionsGrid />
                <TodaySnapshotList snapshot={s.snapshot} />
            </div>
        </div>
    );
}
