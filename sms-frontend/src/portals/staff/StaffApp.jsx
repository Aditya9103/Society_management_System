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
  MessageSquareWarning, Bell, ShieldAlert
} from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import StaffDashboardPage from './pages/StaffDashboardPage';
import StaffResidentsPage from './pages/StaffResidentsPage';
import StaffUnitsPage from './pages/StaffUnitsPage';
import StaffSocietyPage from './pages/StaffSocietyPage';
import StaffProfilePage from './pages/StaffProfilePage';
import StaffComplaintsPage from './pages/StaffComplaintsPage';
import StaffNoticesPage from './pages/StaffNoticesPage';
import AdminEmergencyPage from '../admin/pages/AdminEmergencyPage';
import AdminAmenitiesPage from '../admin/pages/AdminAmenitiesPage';
import AdminPollsPage from '../admin/pages/AdminPollsPage';
import AdminDocumentsPage from '../admin/pages/AdminDocumentsPage';
import AdminInvoicesPage from '../admin/pages/AdminInvoicesPage';
import AdminResidentsPage from '../admin/pages/ResidentsPage';
import { BarChart2, FileText, Receipt } from 'lucide-react';

// ── Role → nav items (aligned to permission matrix) ──────────────────────────
const ROLE_NAV = {
  COMMITTEE_MEMBER: [
    { to: '/staff',            label: 'Dashboard',  Icon: LayoutDashboard, end: true },
    { to: '/staff/residents',  label: 'Residents',  Icon: Users },
    { to: '/staff/units',      label: 'Units',      Icon: Grid3X3 },
    { to: '/staff/complaints', label: 'Complaints', Icon: MessageSquareWarning },
    { to: '/staff/emergencies', label: 'Emergencies', Icon: ShieldAlert },
    { to: '/staff/polls',      label: 'Polls & Voting', Icon: BarChart2 },
    { to: '/staff/notices',    label: 'Notices',    Icon: Bell },
    { to: '/staff/society',    label: 'Society Info', Icon: Building2 },
    { to: '/staff/profile',    label: 'My Profile', Icon: User },
  ],
  ACCOUNTANT: [
    { to: '/staff',            label: 'Dashboard',  Icon: LayoutDashboard, end: true },
    { to: '/staff/units',      label: 'Units',      Icon: Grid3X3 },
    { to: '/staff/complaints', label: 'Complaints', Icon: MessageSquareWarning },
    { to: '/staff/documents',  label: 'Documents',  Icon: FileText },
    { to: '/staff/invoices',   label: 'Invoices',   Icon: Receipt },
    { to: '/staff/society',    label: 'Society Info', Icon: Building2 },
    { to: '/staff/profile',    label: 'My Profile', Icon: User },
  ],
  FACILITY_MANAGER: [
    { to: '/staff',            label: 'Dashboard',  Icon: LayoutDashboard, end: true },
    { to: '/staff/units',      label: 'Units',      Icon: Grid3X3 },
    { to: '/staff/emergencies', label: 'Emergencies', Icon: ShieldAlert },
    { to: '/staff/amenities',  label: 'Amenities', Icon: Building2 },
    { to: '/staff/complaints', label: 'Complaints', Icon: MessageSquareWarning },
    { to: '/staff/society',    label: 'Society Info', Icon: Building2 },
    { to: '/staff/profile',    label: 'My Profile', Icon: User },
  ],
  HELP_DESK: [
    { to: '/staff',            label: 'Dashboard',  Icon: LayoutDashboard, end: true },
    { to: '/staff/residents',  label: 'Residents',  Icon: Users },
    { to: '/staff/emergencies', label: 'Emergencies', Icon: ShieldAlert },
    { to: '/staff/complaints', label: 'Complaints', Icon: MessageSquareWarning },
    { to: '/staff/notices',    label: 'Notices',    Icon: Bell },
    { to: '/staff/society',    label: 'Society Info', Icon: Building2 },
    { to: '/staff/profile',    label: 'My Profile', Icon: User },
  ],
  SECURITY_GUARD: [
    { to: '/staff',           label: 'Dashboard',   Icon: LayoutDashboard, end: true },
    { to: '/staff/emergencies', label: 'Emergencies', Icon: ShieldAlert },
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
    bottomNavRoutes: ['/staff', '/staff/residents', '/staff/complaints', '/staff/emergencies', '/staff/notices', '/staff/amenities', '/staff/polls', '/staff/documents', '/staff/invoices'],
  };

  const canSeeComplaints = ['COMMITTEE_MEMBER', 'ACCOUNTANT', 'FACILITY_MANAGER', 'HELP_DESK'].includes(role);
  const canSeeEmergencies = ['COMMITTEE_MEMBER', 'FACILITY_MANAGER', 'SECURITY_GUARD', 'HELP_DESK'].includes(role);
  const canSeeNotices    = ['COMMITTEE_MEMBER', 'HELP_DESK'].includes(role);
  const canSeeAmenities  = ['FACILITY_MANAGER'].includes(role);
  const canSeePolls      = ['COMMITTEE_MEMBER'].includes(role);
  const canSeeDocs       = ['ACCOUNTANT'].includes(role);
  const canSeeInvoices   = ['ACCOUNTANT'].includes(role);

  return (
    <PortalLayout sidebarConfig={sidebarConfig}>
      <Routes>
        <Route index element={<StaffDashboardPage />} />
        <Route path="residents"  element={role === 'HELP_DESK' ? <AdminResidentsPage /> : <StaffResidentsPage />} />
        <Route path="units"      element={<StaffUnitsPage />} />
        <Route path="society"    element={<StaffSocietyPage />} />
        <Route path="profile"    element={<StaffProfilePage />} />
        {canSeeComplaints && <Route path="complaints" element={<StaffComplaintsPage />} />}
        {canSeeEmergencies && <Route path="emergencies" element={<AdminEmergencyPage />} />}
        {canSeeNotices    && <Route path="notices"    element={<StaffNoticesPage />} />}
        {canSeeAmenities  && <Route path="amenities"  element={<AdminAmenitiesPage />} />}
        {canSeePolls      && <Route path="polls"      element={<AdminPollsPage />} />}
        {canSeeDocs       && <Route path="documents"  element={<AdminDocumentsPage />} />}
        {canSeeInvoices   && <Route path="invoices"   element={<AdminInvoicesPage />} />}
        <Route path="dashboard"  element={<Navigate to="/staff" replace />} />
        <Route path="*"          element={<Navigate to="/staff" replace />} />
      </Routes>
    </PortalLayout>
  );
}
