import React from 'react';
import { Building2, Users, TrendingUp, Activity } from 'lucide-react';
import { useGetDashboardStatsQuery } from '../../../store/api/superAdminApi';

function StatCard({ label, value, icon: Icon, color, subLabel, subValue }) {
    return (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{label}</p>
                    <p className="mt-1 text-3xl font-bold text-gray-900">
                        {value ?? <span className="text-gray-300">—</span>}
                    </p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
            </div>
            {subLabel && (
                <p className="mt-3 text-xs text-gray-400">
                    <span className="font-medium text-emerald-600">{subValue}</span> {subLabel}
                </p>
            )}
        </div>
    );
}

export default function DashboardPage() {
    const { data: stats, isLoading, isError } = useGetDashboardStatsQuery();

    const s = stats?.data;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Real-time metrics across all tenants and societies.
                </p>
            </div>

            {/* Stats Grid */}
            {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-32 animate-pulse rounded-2xl bg-gray-100" />
                    ))}
                </div>
            ) : isError ? (
                <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 ring-1 ring-red-200">
                    Failed to load dashboard stats.
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        label="Total Tenants"
                        value={s?.totalTenants}
                        icon={Building2}
                        color="bg-indigo-500"
                        subLabel="currently active"
                        subValue={s?.activeTenants}
                    />
                    <StatCard
                        label="Active Tenants"
                        value={s?.activeTenants}
                        icon={TrendingUp}
                        color="bg-emerald-500"
                        subLabel="inactive"
                        subValue={s?.inactiveTenants}
                    />
                    <StatCard
                        label="Total Societies"
                        value={s?.totalSocieties}
                        icon={Users}
                        color="bg-violet-500"
                        subLabel="currently active"
                        subValue={s?.activeSocieties}
                    />
                    <StatCard
                        label="Active Societies"
                        value={s?.activeSocieties}
                        icon={Activity}
                        color="bg-amber-500"
                        subLabel="inactive"
                        subValue={s?.inactiveSocieties}
                    />
                </div>
            )}

            {/* Welcome banner */}
            <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white shadow-lg">
                <h2 className="text-xl font-bold">Welcome to the SuperAdmin Console</h2>
                <p className="mt-2 text-sm text-indigo-200">
                    From here you can provision new tenants, manage societies, and assign society admins.
                    Use the sidebar to navigate between sections.
                </p>
            </div>
        </div>
    );
}
