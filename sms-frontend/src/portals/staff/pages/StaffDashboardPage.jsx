import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useGetStaffDashboardQuery } from '../../../store/api/staffApi';
import { Users, Grid3X3, Building2, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';
import Alert from '../../../components/ui/Alert';
import StatCard from '../components/dashboard/StatCard';

const ROLE_META = {
    COMMITTEE_MEMBER: {
        title: 'Committee Member Dashboard',
        subtitle: 'Society overview — residents, units, and pending approvals',
        gradient: 'from-violet-600 to-indigo-600',
    },
    ACCOUNTANT: {
        title: 'Accountant Dashboard',
        subtitle: 'Financial & occupancy overview for your society',
        gradient: 'from-blue-600 to-cyan-600',
    },
    FACILITY_MANAGER: {
        title: 'Facility Manager Dashboard',
        subtitle: 'Building & unit management at a glance',
        gradient: 'from-emerald-600 to-teal-600',
    },
    SECURITY_GUARD: {
        title: 'Security Dashboard',
        subtitle: 'Society resident & access overview',
        gradient: 'from-amber-500 to-orange-500',
    },
};

const QUICK_LINK_META = {
    residents: { label: 'View Residents', to: 'residents', icon: <Users className="h-4 w-4" /> },
    units: { label: 'Browse Units', to: 'units', icon: <Grid3X3 className="h-4 w-4" /> },
    society: { label: 'Society Info', to: 'society', icon: <Building2 className="h-4 w-4" /> },
    complaints: { label: 'Complaints', to: 'complaints', icon: <AlertCircle className="h-4 w-4" /> },
    notices: { label: 'Notice Board', to: 'notices', icon: <AlertCircle className="h-4 w-4" /> },
};

function SkeletonCard() {
    return (
        <div className="h-28 animate-pulse rounded-2xl bg-slate-200" />
    );
}

export default function StaffDashboardPage() {
    const { user } = useSelector((s) => s.auth);
    const { data, isLoading, isError, refetch, isFetching } = useGetStaffDashboardQuery();

    const role = user?.role ?? 'COMMITTEE_MEMBER';
    const meta = ROLE_META[role] ?? ROLE_META.COMMITTEE_MEMBER;
    const dashboard = data?.data;
    const cards = dashboard?.cards ?? [];
    const quickLinks = dashboard?.quickLinks ?? [];

    return (
        <div className="space-y-6">
            <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${meta.gradient} p-6 text-white shadow-lg`}>
                <div className="relative z-10">
                    <p className="text-sm font-medium text-white/70">Welcome back,</p>
                    <h1 className="mt-0.5 text-2xl font-bold">
                        {user?.firstName} {user?.lastName}
                    </h1>
                    <p className="mt-1 text-sm text-white/70">
                        {dashboard?.societyName ?? '…'} · {meta.subtitle}
                    </p>
                </div>
                <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/10" />
                <div className="absolute right-8 bottom-0 h-20 w-20 rounded-full bg-white/5" />
                <button
                    onClick={refetch}
                    title="Refresh"
                    className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-white/20"
                >
                    <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {isError && (
                <Alert type="error">
                    Failed to load dashboard data. <button onClick={refetch} className="underline ml-1">Retry</button>
                </Alert>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {isLoading
                    ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
                    : cards.map((card, i) => <StatCard key={i} card={card} />)
                }
            </div>

            {!isLoading && quickLinks.length > 0 && (
                <div>
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">Quick Access</h2>
                    <div className="flex flex-wrap gap-3">
                        {quickLinks.map((key) => {
                            const ql = QUICK_LINK_META[key];
                            if (!ql) return null;
                            return (
                                <Link
                                    key={key}
                                    to={ql.to}
                                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
                                >
                                    {ql.icon} {ql.label}
                                    <ArrowRight className="ml-1 h-3.5 w-3.5 text-slate-300" />
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
