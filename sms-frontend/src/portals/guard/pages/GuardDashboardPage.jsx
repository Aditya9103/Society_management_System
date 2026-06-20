/**
 * GuardDashboardPage.jsx — Security Guard dashboard.
 *
 * Primary function: Resident lookup and visitor management.
 * Guards can:
 *   - View resident directory (limited — who lives here)
 *   - Log/approve visitor entry
 *   - Trigger emergency alerts
 *   - View society emergency contacts
 *
 * Uses global components: Alert, cn.
 */
import React from 'react';
import { useSelector } from 'react-redux';
import { useGetStaffDashboardQuery } from '../../../store/api/staffApi';
import { Users, Grid3X3, Building2, ShieldCheck, RefreshCw } from 'lucide-react';
import Alert from '../../../components/ui/Alert';
import { cn } from '../../../components/ui/Button';

// ── Stat card ─────────────────────────────────────────────────────────────────
const COLOR_MAP = {
    emerald: 'bg-emerald-500',
    blue:    'bg-blue-500',
    violet:  'bg-violet-500',
    amber:   'bg-amber-500',
};

function StatCard({ label, value, icon: Icon, color }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{value ?? 0}</p>
                </div>
                <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-lg', COLOR_MAP[color] ?? 'bg-gray-500')}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
        </div>
    );
}

const ICON_MAP = { Users, Grid3X3, Building2, ShieldCheck };

// ── Page ─────────────────────────────────────────────────────────────────────
export default function GuardDashboardPage() {
    const { user } = useSelector((s) => s.auth);
    const { data, isLoading, isError, refetch, isFetching } = useGetStaffDashboardQuery();
    const dashboard = data?.data;
    const cards = dashboard?.cards ?? [];

    return (
        <div className="space-y-6">
            {/* Welcome banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-6 text-white shadow-lg">
                <div className="relative z-10">
                    <div className="mb-1 flex items-center gap-2 text-sm text-amber-200">
                        <ShieldCheck className="h-4 w-4" /> Security Post
                    </div>
                    <h1 className="text-2xl font-bold">Welcome, {user?.firstName}!</h1>
                    <p className="mt-1 text-sm text-amber-200">
                        {dashboard?.societyName ?? '…'} · Security Guard Dashboard
                    </p>
                </div>
                <button
                    onClick={refetch}
                    className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20"
                >
                    <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
                </button>
                {/* Decorative circles */}
                <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/10" />
                <div className="absolute bottom-0 right-8 h-20 w-20 rounded-full bg-white/5" />
            </div>

            {isError && (
                <Alert type="error">
                    Failed to load dashboard.{' '}
                    <button onClick={refetch} className="underline">Retry</button>
                </Alert>
            )}

            {/* Stat cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {isLoading
                    ? [...Array(4)].map((_, i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-gray-100" />)
                    : cards.map((c, i) => {
                        const Icon = ICON_MAP[c.icon] ?? ShieldCheck;
                        return <StatCard key={i} label={c.label} value={c.value} icon={Icon} color={c.color} />;
                    })
                }
            </div>

            {/* Guard duties reminder */}
            <Alert type="warning">
                <div>
                    <p className="font-semibold">Guard Duties</p>
                    <ul className="mt-2 space-y-1 text-sm">
                        <li>• Verify resident identity before granting access</li>
                        <li>• Log all visitor entries in the visitor register</li>
                        <li>• Report any suspicious activity immediately</li>
                        <li>• Check the Residents directory for unit lookups</li>
                    </ul>
                </div>
            </Alert>
        </div>
    );
}
