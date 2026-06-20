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
import {
    CheckCircle2,
    Clock,
    XCircle,
    Home,
    Building2,
    User,
    Phone,
    Mail,
    AlertCircle,
    RefreshCw,
} from 'lucide-react';

// ── Status screens ────────────────────────────────────────────────────────────
function PendingApprovalScreen() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
                <Clock className="h-10 w-10 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Pending Approval</h2>
            <p className="mt-3 max-w-md text-sm text-slate-500 leading-relaxed">
                Your registration has been submitted successfully. The Society Admin is reviewing your
                documents. You'll receive an email once you're approved — this typically takes 1–2 business days.
            </p>
            <div className="mt-6 rounded-xl bg-amber-50 px-5 py-3 ring-1 ring-amber-200">
                <p className="text-sm font-medium text-amber-700">Nothing to do here — sit tight! 🎉</p>
            </div>
        </div>
    );
}

function RejectedScreen({ reason }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Registration Rejected</h2>
            <p className="mt-3 max-w-md text-sm text-slate-500 leading-relaxed">
                Unfortunately, your registration was rejected by the Society Admin.
            </p>
            {reason && (
                <div className="mt-4 rounded-xl bg-red-50 px-5 py-3 ring-1 ring-red-200 max-w-sm text-left">
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-500">Reason</p>
                    <p className="mt-1 text-sm text-red-700">{reason}</p>
                </div>
            )}
            <a
                href="/auth/register"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
                Re-register
            </a>
        </div>
    );
}

function ApprovedDashboard({ profile, user }) {
    const unit = profile?.unitId;
    const society = profile?.societyId;

    return (
        <div className="space-y-6">
            {/* Welcome banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white shadow-lg">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 text-indigo-200 text-sm mb-1">
                        <CheckCircle2 className="h-4 w-4" /> Verified Resident
                    </div>
                    <h1 className="text-2xl font-bold">
                        Welcome, {user?.firstName}! 👋
                    </h1>
                    {society && (
                        <p className="mt-1 text-indigo-200 text-sm">
                            {society.name} · {society.city}
                        </p>
                    )}
                </div>
                {/* Decorative blob */}
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
                <div className="absolute -right-4 bottom-0 h-20 w-20 rounded-full bg-white/5" />
            </div>

            {/* Info cards */}
            <div className="grid gap-4 sm:grid-cols-3">
                {/* Unit */}
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
                            <Home className="h-5 w-5 text-violet-600" />
                        </div>
                        <p className="font-semibold text-slate-800">My Unit</p>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{unit?.unitNumber ?? '—'}</p>
                    {unit?.bhkType && <p className="text-sm text-slate-500">{unit.bhkType}</p>}
                    <span className="mt-2 inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                        {profile?.ownershipType}
                    </span>
                </div>

                {/* Society */}
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                            <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <p className="font-semibold text-slate-800">Society</p>
                    </div>
                    <p className="text-base font-semibold text-slate-900">{society?.name ?? '—'}</p>
                    <p className="text-sm text-slate-500">{society?.city}, {society?.state}</p>
                </div>

                {/* Resident code */}
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                            <User className="h-5 w-5 text-emerald-600" />
                        </div>
                        <p className="font-semibold text-slate-800">Resident ID</p>
                    </div>
                    <p className="font-mono text-base font-bold text-slate-900 break-all">
                        {profile?.residentCode ?? '—'}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">Use this for maintenance requests</p>
                </div>
            </div>

            {/* Profile details */}
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                <h3 className="mb-4 font-semibold text-slate-800">My Details</h3>
                <div className="grid gap-3 sm:grid-cols-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                        {user?.email}
                    </div>
                    {user?.phone && (
                        <div className="flex items-center gap-2 text-slate-600">
                            <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                            {user.phone}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

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
