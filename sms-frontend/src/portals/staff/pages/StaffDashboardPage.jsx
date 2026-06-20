/**
 * StaffDashboardPage.jsx — Role-aware dashboard for all 4 staff roles.
 *
 * Shows stat cards dynamically based on what the backend returns for the
 * logged-in user's role. Each role gets different cards and quick-action links.
 */
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useGetStaffDashboardQuery } from '../../../store/api/staffApi';
import {
    Users, Grid3X3, Home, Building2, Clock, AlertCircle, RefreshCw, ArrowRight
} from 'lucide-react';

// ── Icon map ─────────────────────────────────────────────────────────────────
const ICONS = {
    Users: <Users className="h-6 w-6" />,
    Grid3X3: <Grid3X3 className="h-6 w-6" />,
    Home: <Home className="h-6 w-6" />,
    HomeIcon: <Home className="h-6 w-6" />,
    Building2: <Building2 className="h-6 w-6" />,
    Clock: <Clock className="h-6 w-6" />,
};

// ── Color map ─────────────────────────────────────────────────────────────────
const CARD_COLORS = {
    emerald: 'bg-emerald-500 shadow-emerald-200',
    blue: 'bg-blue-500 shadow-blue-200',
    violet: 'bg-violet-500 shadow-violet-200',
    amber: 'bg-amber-500 shadow-amber-200',
    indigo: 'bg-indigo-500 shadow-indigo-200',
    slate: 'bg-slate-500 shadow-slate-200',
};

// ── Role-specific descriptions ────────────────────────────────────────────────
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

// ── Quick link labels ─────────────────────────────────────────────────────────
const QUICK_LINK_META = {
    residents: { label: 'View Residents', to: 'residents', icon: <Users className="h-4 w-4" /> },
    units: { label: 'Browse Units', to: 'units', icon: <Grid3X3 className="h-4 w-4" /> },
    society: { label: 'Society Info', to: 'society', icon: <Building2 className="h-4 w-4" /> },
    complaints: { label: 'Complaints', to: 'complaints', icon: <AlertCircle className="h-4 w-4" /> },
    notices: { label: 'Notice Board', to: 'notices', icon: <AlertCircle className="h-4 w-4" /> },
};


// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ card }) {
    const colorClass = CARD_COLORS[card.color] ?? CARD_COLORS.slate;
    return (
        <div className="overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{card.label}</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">{card.value ?? 0}</p>
                </div>
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-lg ${colorClass}`}>
                    {ICONS[card.icon] ?? ICONS.Building2}
                </div>
            </div>
        </div>
    );
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
    return (
        <div className="h-28 animate-pulse rounded-2xl bg-slate-200" />
    );
}

// ── Page ─────────────────────────────────────────────────────────────────────
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
            {/* Welcome banner */}
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
                {/* Decorative bubbles */}
                <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/10" />
                <div className="absolute right-8 bottom-0 h-20 w-20 rounded-full bg-white/5" />
                {/* Refresh button */}
                <button
                    onClick={refetch}
                    title="Refresh"
                    className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-white/20"
                >
                    <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Error */}
            {isError && (
                <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-600 ring-1 ring-red-200">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <span>Failed to load dashboard data. <button onClick={refetch} className="underline">Retry</button></span>
                </div>
            )}

            {/* Stat cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {isLoading
                    ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
                    : cards.map((card, i) => <StatCard key={i} card={card} />)
                }
            </div>

            {/* Quick links */}
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
