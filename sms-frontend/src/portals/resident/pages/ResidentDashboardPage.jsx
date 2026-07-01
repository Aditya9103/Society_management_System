/**
 * ResidentDashboardPage.jsx — Resident dashboard showing approval status and profile info.
 *
 * States handled:
 *  1. INCOMPLETE_PROFILE  → guide them to complete profile (they missed step 3?)
 *  2. PENDING_APPROVAL    → waiting for admin to approve
 *  3. APPROVED            → show full profile & unit info
 *  4. REJECTED            → show rejection reason + re-register link
 */
import React from 'react';
import { useSelector } from 'react-redux';
import { useGetMyProfileQuery } from '../../../store/api/residentApi';
import { AlertCircle, RefreshCw } from 'lucide-react';
import EmptyState from '../../../components/ui/EmptyState';
import { RejectedScreen } from '../components/dashboard/RejectedScreen';
import { ApprovedDashboard } from '../components/dashboard/ApprovedDashboard';
import { PendingApprovalScreen } from '../components/dashboard/PendingApprovalScreen';

// ── Main component ────────────────────────────────────────────────────────────
export default function ResidentDashboardPage() {
    const { user } = useSelector((state) => state.auth);
    const { data, isLoading, isError, refetch } = useGetMyProfileQuery();
    const profile = data?.data?.profile;
    const status = user?.registrationStatus;

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <RefreshCw className="h-7 w-7 animate-spin text-indigo-400" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <AlertCircle className="h-8 w-8 text-red-400" />
                <p className="text-slate-500">Failed to load your profile.</p>
                <button onClick={refetch} className="text-sm text-indigo-600 hover:underline">Try again</button>
            </div>
        );
    }

    // Route to the correct screen based on registrationStatus
    if (status === 'APPROVED') {
        return <ApprovedDashboard profile={profile} user={user} />;
    }

    if (status === 'REJECTED') {
        return <RejectedScreen reason={profile?.rejectionReason} />;
    }

    // PENDING_APPROVAL or INCOMPLETE_PROFILE
    return <PendingApprovalScreen />;
}
