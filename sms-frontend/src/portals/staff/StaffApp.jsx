/**
 * StaffApp.jsx — Staff portal shell (Committee, Accountant, FM, Help Desk, Security).
 * Uses the shared PortalLayout + PortalSidebar.
 * Nav items are role-aware via ROLE_NAV map, aligned to constants.js permissions.
 */
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard, Users, Grid3X3, Building2, User, Briefcase,
  MessageSquareWarning, Bell,
} from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import StaffDashboardPage from './pages/StaffDashboardPage';
import StaffResidentsPage from './pages/StaffResidentsPage';
import StaffUnitsPage from './pages/StaffUnitsPage';
import StaffSocietyPage from './pages/StaffSocietyPage';
import StaffProfilePage from './pages/StaffProfilePage';
import StaffComplaintsPage from './pages/StaffComplaintsPage';
import StaffNoticesPage from './pages/StaffNoticesPage';

// ── Role → nav items (aligned to permission matrix) ──────────────────────────
const ROLE_NAV = {
  COMMITTEE_MEMBER: [
    { to: '/staff',            label: 'Dashboard',  Icon: LayoutDashboard, end: true },
    { to: '/staff/residents',  label: 'Residents',  Icon: Users },
    { to: '/staff/units',      label: 'Units',      Icon: Grid3X3 },
    { to: '/staff/complaints', label: 'Complaints', Icon: MessageSquareWarning },
    { to: '/staff/notices',    label: 'Notices',    Icon: Bell },
    { to: '/staff/society',    label: 'Society Info', Icon: Building2 },
    { to: '/staff/profile',    label: 'My Profile', Icon: User },
  ],
  ACCOUNTANT: [
    { to: '/staff',            label: 'Dashboard',  Icon: LayoutDashboard, end: true },
    { to: '/staff/units',      label: 'Units',      Icon: Grid3X3 },
    { to: '/staff/complaints', label: 'Complaints', Icon: MessageSquareWarning },
    { to: '/staff/society',    label: 'Society Info', Icon: Building2 },
    { to: '/staff/profile',    label: 'My Profile', Icon: User },
  ],
  FACILITY_MANAGER: [
    { to: '/staff',            label: 'Dashboard',  Icon: LayoutDashboard, end: true },
    { to: '/staff/units',      label: 'Units',      Icon: Grid3X3 },
    { to: '/staff/complaints', label: 'Complaints', Icon: MessageSquareWarning },
    { to: '/staff/society',    label: 'Society Info', Icon: Building2 },
    { to: '/staff/profile',    label: 'My Profile', Icon: User },
  ],
  HELP_DESK: [
    { to: '/staff',            label: 'Dashboard',  Icon: LayoutDashboard, end: true },
    { to: '/staff/residents',  label: 'Residents',  Icon: Users },
    { to: '/staff/complaints', label: 'Complaints', Icon: MessageSquareWarning },
    { to: '/staff/notices',    label: 'Notices',    Icon: Bell },
    { to: '/staff/society',    label: 'Society Info', Icon: Building2 },
    { to: '/staff/profile',    label: 'My Profile', Icon: User },
  ],
  SECURITY_GUARD: [
    { to: '/staff',           label: 'Dashboard',   Icon: LayoutDashboard, end: true },
    { to: '/staff/residents', label: 'Residents',   Icon: Users },
    { to: '/staff/society',   label: 'Society Info', Icon: Building2 },
    { to: '/staff/profile',   label: 'My Profile',  Icon: User },
  ],
};

// ── Role → accent colors ──────────────────────────────────────────────────────
const ROLE_ACCENT = {
  COMMITTEE_MEMBER: { accentFrom: 'from-violet-600', accentTo: 'to-indigo-600',  subtitle: 'Committee Member' },
  ACCOUNTANT:       { accentFrom: 'from-blue-600',   accentTo: 'to-cyan-600',    subtitle: 'Accountant' },
  FACILITY_MANAGER: { accentFrom: 'from-emerald-600',accentTo: 'to-teal-600',    subtitle: 'Facility Manager' },
  HELP_DESK:        { accentFrom: 'from-orange-500', accentTo: 'to-amber-600',   subtitle: 'Help Desk' },
  SECURITY_GUARD:   { accentFrom: 'from-slate-600',  accentTo: 'to-slate-800',   subtitle: 'Security Guard' },
};

export default function StaffApp() {
  const { user } = useSelector((s) => s.auth);
  const role = user?.role ?? 'COMMITTEE_MEMBER';
  const nav = ROLE_NAV[role] ?? ROLE_NAV.COMMITTEE_MEMBER;
  const accent = ROLE_ACCENT[role] ?? ROLE_ACCENT.COMMITTEE_MEMBER;

  const sidebarConfig = {
    brand: {
      title: 'Staff Portal',
      subtitle: accent.subtitle,
      Icon: Briefcase,
    },
    accentFrom: accent.accentFrom,
    accentTo: accent.accentTo,
    navItems: nav,
  };

  const canSeeComplaints = ['COMMITTEE_MEMBER', 'ACCOUNTANT', 'FACILITY_MANAGER', 'HELP_DESK'].includes(role);
  const canSeeNotices    = ['COMMITTEE_MEMBER', 'HELP_DESK'].includes(role);

  return (
    <PortalLayout sidebarConfig={sidebarConfig}>
      <Routes>
        <Route index element={<StaffDashboardPage />} />
        <Route path="residents"  element={<StaffResidentsPage />} />
        <Route path="units"      element={<StaffUnitsPage />} />
        <Route path="society"    element={<StaffSocietyPage />} />
        <Route path="profile"    element={<StaffProfilePage />} />
        {canSeeComplaints && <Route path="complaints" element={<StaffComplaintsPage />} />}
        {canSeeNotices    && <Route path="notices"    element={<StaffNoticesPage />} />}
        <Route path="dashboard"  element={<Navigate to="/staff" replace />} />
        <Route path="*"          element={<Navigate to="/staff" replace />} />
      </Routes>
    </PortalLayout>
  );
}
