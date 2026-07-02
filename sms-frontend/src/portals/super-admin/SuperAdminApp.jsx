/**
 * SuperAdminApp.jsx — Super Admin portal shell.
 * Uses the shared PortalLayout + PortalSidebar.
 */
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users2, Crown, Activity
} from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import DashboardPage from './pages/DashboardPage';
import TenantsPage from './pages/TenantsPage';
import SocietiesPage from './pages/SocietiesPage';
import AuditLogsPage from './pages/AuditLogsPage';

const SIDEBAR_CONFIG = {
  brand: { title: 'Super Admin', subtitle: 'Platform Control', Icon: Crown },
  accentFrom: 'from-rose-600',
  accentTo: 'to-pink-600',
  navItems: [
    { to: '/super-admin', label: 'Dashboard', Icon: LayoutDashboard, end: true },
    { to: '/super-admin/tenants', label: 'Tenants', Icon: Users2 },
    { to: '/super-admin/societies', label: 'Societies', Icon: Building2 },
    { to: '/super-admin/audit-logs', label: 'Audit Logs', Icon: Activity },
  ],
  bottomNavRoutes: ['/super-admin', '/super-admin/tenants', '/super-admin/societies', '/super-admin/audit-logs'],
};

export default function SuperAdminApp() {
  return (
    <PortalLayout sidebarConfig={SIDEBAR_CONFIG}>
      <Routes>
        <Route index element={<DashboardPage />} />
        <Route path="tenants" element={<TenantsPage />} />
        <Route path="societies" element={<SocietiesPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
        <Route path="*" element={<Navigate to="/super-admin" replace />} />
      </Routes>
    </PortalLayout>
  );
}
