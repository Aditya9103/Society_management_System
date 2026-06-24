/**
 * DashboardPage.jsx — SuperAdmin platform overview dashboard.
 *
 * Shows real-time metrics across all tenants and societies.
 * Uses global components: Alert, PageHeader, Card, cn.
 */
import React from 'react';
import { Building2, Users, TrendingUp, Activity } from 'lucide-react';
import { useGetDashboardStatsQuery } from '../../../store/api/superAdminApi';
import PageHeader from '../../../components/ui/PageHeader';
import Alert from '../../../components/ui/Alert';
import StatCard from '../components/dashboard/StatCard';

// ── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
    const { data: stats, isLoading, isError, refetch, isFetching } = useGetDashboardStatsQuery();
    const s = stats?.data;

    const statCards = [
        { label: 'Total Tenants',    value: s?.totalTenants,    icon: Building2,   color: 'bg-indigo-500', subLabel: 'currently active', subValue: s?.activeTenants },
        { label: 'Active Tenants',   value: s?.activeTenants,   icon: TrendingUp,  color: 'bg-green-500',  subLabel: 'inactive',         subValue: s?.inactiveTenants },
        { label: 'Total Societies',  value: s?.totalSocieties,  icon: Users,       color: 'bg-violet-500', subLabel: 'currently active', subValue: s?.activeSocieties },
        { label: 'Active Societies', value: s?.activeSocieties, icon: Activity,    color: 'bg-amber-500',  subLabel: 'inactive',         subValue: s?.inactiveSocieties },
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Platform Overview"
                subtitle="Real-time metrics across all tenants and societies"
                onRefresh={refetch}
                isFetching={isFetching}
            />

            {isError && <Alert type="error">Failed to load dashboard stats.</Alert>}

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {isLoading
                    ? [...Array(4)].map((_, i) => (
                        <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-100" />
                    ))
                    : statCards.map((card) => <StatCard key={card.label} {...card} />)
                }
            </div>

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
