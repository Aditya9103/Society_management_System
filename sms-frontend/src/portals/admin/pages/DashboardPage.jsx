/**
 * DashboardPage.jsx — Society Admin overview dashboard.
 *
 * Shows key metrics: towers, units, residents, staff, pending approvals.
 * Stat cards link directly to the relevant section.
 * Quick Actions provide one-click shortcuts to common tasks.
 *
 * Uses global components: Alert, cn.
 */
import React from 'react';
import { Building2, Grid3X3, Users, ClipboardList, UserCheck, TrendingUp, Home } from 'lucide-react';
import { useGetAdminDashboardQuery } from '../../../store/api/societyAdminApi';
import { Link } from 'react-router-dom';
import Alert from '../../../components/ui/Alert';
import { cn } from '../../../components/ui/Button';

function StatCard({ label, value, icon: Icon, gradient, subLabel, subValue, to }) {
    const content = (
        <div className={cn('relative overflow-hidden rounded-2xl p-6 text-white shadow-lg transition-transform hover:-translate-y-0.5 hover:shadow-xl', gradient)}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-white/75">{label}</p>
                    <p className="mt-1 text-4xl font-bold tracking-tight">
                        {value ?? <span className="text-white/40">—</span>}
                    </p>
                    {subLabel && (
                        <p className="mt-2 text-xs text-white/65">
                            <span className="font-semibold text-white/90">{subValue}</span> {subLabel}
                        </p>
                    )}
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                    <Icon className="h-6 w-6 text-white" />
                </div>
            </div>
            {/* Decorative blob */}
            <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-white/10" />
        </div>
    );

    return to ? <Link to={to}>{content}</Link> : content;
}

function SkeletonCard() {
    return <div className="h-36 animate-pulse rounded-2xl bg-slate-200" />;
}

export default function DashboardPage() {
    const { data, isLoading, isError } = useGetAdminDashboardQuery();
    const s = data?.data;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        {s?.societyName ?? 'Society Dashboard'}
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Overview of your society's current status
                    </p>
                </div>
                <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                    Society Admin
                </span>
            </div>

            {isError && <Alert type="error">Failed to load dashboard stats. Please refresh.</Alert>}

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {isLoading ? (
                    [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
                ) : (
                    <>
                        <StatCard
                            label="Total Towers"
                            value={s?.totalTowers}
                            icon={Building2}
                            gradient="bg-gradient-to-br from-violet-600 to-indigo-700"
                            to="/admin/towers"
                        />
                        <StatCard
                            label="Total Units"
                            value={s?.totalUnits}
                            icon={Grid3X3}
                            gradient="bg-gradient-to-br from-blue-500 to-cyan-600"
                            subLabel="occupied"
                            subValue={s?.occupiedUnits}
                            to="/admin/units"
                        />
                        <StatCard
                            label="Vacant Units"
                            value={s?.vacantUnits}
                            icon={Home}
                            gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
                            to="/admin/units"
                        />
                        <StatCard
                            label="Pending Approvals"
                            value={s?.pendingResidents}
                            icon={ClipboardList}
                            gradient={cn(
                                s?.pendingResidents > 0
                                    ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                                    : 'bg-gradient-to-br from-gray-500 to-gray-600'
                            )}
                            to="/admin/pending"
                        />
                        <StatCard
                            label="Active Residents"
                            value={s?.totalResidents}
                            icon={UserCheck}
                            gradient="bg-gradient-to-br from-pink-500 to-rose-600"
                            to="/admin/residents"
                        />
                        <StatCard
                            label="Total Staff"
                            value={s?.totalStaff}
                            icon={Users}
                            gradient="bg-gradient-to-br from-orange-500 to-red-500"
                            to="/admin/staff"
                        />
                    </>
                )}
            </div>

            {/* Quick Actions */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-base font-semibold text-gray-800">Quick Actions</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                        { label: 'Review Pending Approvals', to: '/admin/pending',  icon: ClipboardList, color: 'text-amber-600 bg-amber-50' },
                        { label: 'Add New Staff Member',     to: '/admin/staff',    icon: Users,         color: 'text-indigo-600 bg-indigo-50' },
                        { label: 'Create a Tower',           to: '/admin/towers',   icon: Building2,     color: 'text-blue-600 bg-blue-50' },
                        { label: 'Add Units',                to: '/admin/units',    icon: Grid3X3,       color: 'text-cyan-600 bg-cyan-50' },
                        { label: 'View Residents',           to: '/admin/residents',icon: UserCheck,     color: 'text-green-600 bg-green-50' },
                        { label: 'Update Society Profile',   to: '/admin/profile',  icon: TrendingUp,    color: 'text-pink-600 bg-pink-50' },
                    ].map(({ label, to, icon: Icon, color }) => (
                        <Link
                            key={to}
                            to={to}
                            className="flex items-center gap-3 rounded-xl border border-gray-100 p-4 transition-all hover:bg-gray-50 hover:shadow-sm"
                        >
                            <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', color)}>
                                <Icon className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">{label}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
