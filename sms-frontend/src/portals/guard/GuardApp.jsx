/**
 * GuardApp.jsx — Dedicated Security Guard portal.
 * Uses the shared PortalLayout + PortalSidebar.
 * Amber/orange theme distinct from staff portal.
 */
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ShieldCheck, Users, Building2, User } from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import GuardDashboardPage from './pages/GuardDashboardPage';
import GuardResidentsPage from './pages/GuardResidentsPage';
import GuardSocietyPage from './pages/GuardSocietyPage';
import GuardVisitorsPage from './pages/GuardVisitorsPage';
import GuardVehiclePage from './pages/GuardVehiclePage';
import StaffProfilePage from '../staff/pages/StaffProfilePage';
import AdminEmergencyPage from '../admin/pages/AdminEmergencyPage';
import VerifyIdCardPage from './pages/VerifyIdCardPage';
import { QrCode, ShieldAlert, Car, ScanLine } from 'lucide-react';

const SIDEBAR_CONFIG = {
  brand: { title: 'Guard Portal', subtitle: 'Security Guard', Icon: ShieldCheck },
  accentFrom: 'from-amber-500',
  accentTo: 'to-orange-600',
    navItems: [
        { to: '/guard', label: 'Dashboard', Icon: ShieldCheck, end: true },
        { to: '/guard/visitors', label: 'Visitor Gates', Icon: QrCode },
        { to: '/guard/verify-id', label: 'Verify ID Card', Icon: ScanLine },
        { to: '/guard/vehicles', label: 'Vehicle Gates', Icon: Car },
        { to: '/guard/emergencies', label: 'Emergencies', Icon: ShieldAlert },
        { to: '/guard/residents', label: 'Resident Lookup', Icon: Users },
        { to: '/guard/society', label: 'Emergency Contacts', Icon: Building2 },
        { to: '/guard/profile', label: 'My Profile', Icon: User },
    ],
};

export default function GuardApp() {
  return (
    <PortalLayout sidebarConfig={SIDEBAR_CONFIG} maxWidth="max-w-3xl">
      <Routes>
        <Route index element={<GuardDashboardPage />} />
        <Route path="verify-id" element={<VerifyIdCardPage />} />
        <Route path="visitors" element={<GuardVisitorsPage />} />
        <Route path="vehicles" element={<GuardVehiclePage />} />
        <Route path="emergencies" element={<AdminEmergencyPage />} />
        <Route path="residents" element={<GuardResidentsPage />} />
        <Route path="society" element={<GuardSocietyPage />} />
        <Route path="profile" element={<StaffProfilePage />} />
        <Route path="*" element={<Navigate to="/guard" replace />} />
      </Routes>
    </PortalLayout>
  );
}
