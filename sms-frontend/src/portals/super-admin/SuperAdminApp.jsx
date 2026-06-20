/**
 * SuperAdminApp.jsx — Super Admin portal shell.
 * Uses the shared PortalLayout + PortalSidebar.
 */
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users2, Crown,
} from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import DashboardPage from './pages/DashboardPage';
import TenantsPage from './pages/TenantsPage';
import SocietiesPage from './pages/SocietiesPage';

const SIDEBAR_CONFIG = {
  brand: { title: 'Super Admin', subtitle: 'Platform Control', Icon: Crown },
  accentFrom: 'from-rose-600',
  accentTo: 'to-pink-600',
  navItems: [
    { to: '/super-admin', label: 'Dashboard', Icon: LayoutDashboard, end: true },
    { to: '/super-admin/tenants', label: 'Tenants', Icon: Users2 },
    { to: '/super-admin/societies', label: 'Societies', Icon: Building2 },
  ],
};

export default function SuperAdminApp() {
  return (
    <PortalLayout sidebarConfig={SIDEBAR_CONFIG}>
      <Routes>
        <Route index element={<DashboardPage />} />
        <Route path="tenants" element={<TenantsPage />} />
        <Route path="societies" element={<SocietiesPage />} />
        <Route path="*" element={<Navigate to="/super-admin" replace />} />
      </Routes>
    </PortalLayout>
  );
}
