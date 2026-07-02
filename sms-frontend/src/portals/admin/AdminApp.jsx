/**
 * AdminApp.jsx — Society Admin portal shell.
 * Uses the shared PortalLayout + PortalSidebar.
 */
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Grid3X3, Users, UserCheck,
  Settings, ShieldCheck, MessageSquareWarning, Bell, Receipt, ShieldAlert, Car, MapPin, ClipboardList, BarChart2
} from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import DashboardPage from './pages/DashboardPage';
import SocietyProfilePage from './pages/SocietyProfilePage';
import TowersPage from './pages/TowersPage';
import UnitsPage from './pages/UnitsPage';
import StaffPage from './pages/StaffPage';
import ResidentsPage from './pages/ResidentsPage';
import PendingApprovalsPage from './pages/PendingApprovalsPage';
import AdminComplaintsPage from './pages/AdminComplaintsPage';
import AdminNoticesPage from './pages/AdminNoticesPage';
import AdminInvoicesPage from './pages/AdminInvoicesPage';
import AdminEmergencyPage from './pages/AdminEmergencyPage';
import AdminVehiclePage from './pages/AdminVehiclePage';
import AdminParkingPage from './pages/AdminParkingPage';
import AdminPollsPage from './pages/AdminPollsPage';
import AdminDocumentsPage from './pages/AdminDocumentsPage';
import AdminAmenitiesPage from './pages/AdminAmenitiesPage';
import { FileText } from 'lucide-react';

const SIDEBAR_CONFIG = {
  brand: { title: 'Society Admin', subtitle: 'Management Portal', Icon: ShieldCheck },
  accentFrom: 'from-violet-600',
  accentTo: 'to-indigo-600',
  navItems: [
    { to: '/admin', label: 'Dashboard', Icon: LayoutDashboard, end: true },
    { to: '/admin/profile', label: 'Society Profile', Icon: Settings },
    { to: '/admin/towers', label: 'Towers & Floors', Icon: Building2 },
    { to: '/admin/units', label: 'Units', Icon: Grid3X3 },
    { to: '/admin/staff', label: 'Staff', Icon: Users },
    { to: '/admin/residents', label: 'Residents', Icon: UserCheck },
    { to: '/admin/pending', label: 'Pending Approvals', Icon: ClipboardList },
    { to: '/admin/complaints', label: 'Complaints', Icon: MessageSquareWarning },
    { to: '/admin/emergencies', label: 'Emergencies', Icon: ShieldAlert },
    { to: '/admin/notices', label: 'Notices', Icon: Bell },
    { to: '/admin/invoices', label: 'Invoices', Icon: Receipt },
    { to: '/admin/vehicles', label: 'Vehicles', Icon: Car },
    { to: '/admin/parking', label: 'Parking', Icon: MapPin },
    { to: '/admin/polls', label: 'Polls & Voting', Icon: BarChart2 },
    { to: '/admin/documents', label: 'Documents', Icon: FileText },
    { to: '/admin/amenities', label: 'Amenities', Icon: Building2 },
  ],
  bottomNavRoutes: ['/admin', '/admin/residents', '/admin/complaints', '/admin/emergencies', '/admin/notices', '/admin/amenities', '/admin/polls', '/admin/documents', '/admin/invoices'],
};

export default function AdminApp() {
  return (
    <PortalLayout sidebarConfig={SIDEBAR_CONFIG}>
      <Routes>
        <Route index element={<DashboardPage />} />
        <Route path="profile" element={<SocietyProfilePage />} />
        <Route path="towers" element={<TowersPage />} />
        <Route path="units" element={<UnitsPage />} />
        <Route path="staff" element={<StaffPage />} />
        <Route path="residents" element={<ResidentsPage />} />
        <Route path="pending" element={<PendingApprovalsPage />} />
        <Route path="complaints" element={<AdminComplaintsPage />} />
        <Route path="emergencies" element={<AdminEmergencyPage />} />
        <Route path="notices" element={<AdminNoticesPage />} />
        <Route path="invoices" element={<AdminInvoicesPage />} />
        <Route path="vehicles" element={<AdminVehiclePage />} />
        <Route path="parking" element={<AdminParkingPage />} />
        <Route path="polls" element={<AdminPollsPage />} />
        <Route path="documents" element={<AdminDocumentsPage />} />
        <Route path="amenities" element={<AdminAmenitiesPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </PortalLayout>
  );
}
