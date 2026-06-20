/**
 * ResidentApp.jsx — Resident portal shell with full feature routing.
 */
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import {
    LayoutDashboard, User, MessageSquareWarning,
    Bell, UserCheck, Receipt, Home,
} from 'lucide-react';
import PortalLayout from '../../components/layout/PortalLayout';
import ResidentDashboardPage from './pages/ResidentDashboardPage';
import ResidentProfilePage from './pages/ResidentProfilePage';
import ResidentComplaintsPage from './pages/ResidentComplaintsPage';
import ResidentNoticesPage from './pages/ResidentNoticesPage';
import ResidentVisitorPage from './pages/ResidentVisitorPage';
import ResidentInvoicesPage from './pages/ResidentInvoicesPage';

const SIDEBAR_CONFIG = {
    brand: { title: 'Resident Portal', subtitle: 'My Home Hub', Icon: Home },
    accentFrom: 'from-indigo-600',
    accentTo: 'to-violet-600',
    navItems: [
        { to: '/resident',            label: 'My Home',          Icon: LayoutDashboard, end: true },
        { to: '/resident/profile',    label: 'My Profile',       Icon: User },
        { to: '/resident/complaints', label: 'Complaints',       Icon: MessageSquareWarning },
        { to: '/resident/notices',    label: 'Notices',          Icon: Bell },
        { to: '/resident/visitors',   label: 'Visitor Passes',   Icon: UserCheck },
        { to: '/resident/invoices',   label: 'Invoices & Bills', Icon: Receipt },
    ],
};

export default function ResidentApp() {
    return (
        <PortalLayout sidebarConfig={SIDEBAR_CONFIG}>
            <Routes>
                <Route index element={<ResidentDashboardPage />} />
                <Route path="profile"    element={<ResidentProfilePage />} />
                <Route path="complaints" element={<ResidentComplaintsPage />} />
                <Route path="notices"    element={<ResidentNoticesPage />} />
                <Route path="visitors"   element={<ResidentVisitorPage />} />
                <Route path="invoices"   element={<ResidentInvoicesPage />} />
                <Route path="*"          element={<Navigate to="/resident" replace />} />
            </Routes>
        </PortalLayout>
    );
}
