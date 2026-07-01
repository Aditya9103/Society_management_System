/**
 * ResidentApp.jsx — Resident portal shell with full feature routing.
 */
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, User, MessageSquareWarning,
    Bell, UserCheck, Receipt, Home, ShieldAlert, Car, Users, BarChart2
} from 'lucide-react';
import { useSelector } from 'react-redux';
import PortalLayout from '../../components/layout/PortalLayout';
import ResidentDashboardPage from './pages/ResidentDashboardPage';
import ResidentProfilePage from './pages/ResidentProfilePage';
import ResidentComplaintsPage from './pages/ResidentComplaintsPage';
import ResidentNoticesPage from './pages/ResidentNoticesPage';
import ResidentEmergencyPage from './pages/ResidentEmergencyPage';
import ResidentVisitorPage from './pages/ResidentVisitorPage';
import ResidentInvoicesPage from './pages/ResidentInvoicesPage';
import ResidentVehiclePage from './pages/ResidentVehiclePage';
import ResidentPollsPage from './pages/ResidentPollsPage';
import ResidentDocumentsPage from './pages/ResidentDocumentsPage';
import ResidentWalkInListener from './components/ResidentWalkInListener';
import { PendingApprovalScreen } from './components/dashboard/PendingApprovalScreen';
import { RejectedScreen } from './components/dashboard/RejectedScreen';
import { FileText } from 'lucide-react';

const SIDEBAR_CONFIG = {
    brand: { title: 'Resident Portal', subtitle: 'My Home Hub', Icon: Home },
    accentFrom: 'from-indigo-600',
    accentTo: 'to-violet-600',
    navItems: [
        { to: '/resident', label: 'My Home', Icon: LayoutDashboard, end: true },
        { to: '/resident/notices', label: 'Notices', Icon: Bell },
        { to: '/resident/profile', label: 'My Profile', Icon: User },
        { to: '/resident/complaints', label: 'Complaints', Icon: MessageSquareWarning },
        { to: '/resident/emergency', label: 'Emergency (SOS)', Icon: ShieldAlert },
        { to: '/resident/vehicles', label: 'Vehicles & Parking', Icon: Car },
        { to: '/resident/visitors', label: 'Visitor Passes', Icon: UserCheck },
        { to: '/resident/polls', label: 'Polls & Voting', Icon: BarChart2 },
        { to: '/resident/invoices', label: 'Invoices & Bills', Icon: Receipt },
        { to: '/resident/documents', label: 'Documents', Icon: FileText },
    ],
};

export default function ResidentApp() {
    const { user } = useSelector((state) => state.auth);
    const location = useLocation();

    // Block REJECTED / Revoked users entirely
    if (user?.registrationStatus === 'REJECTED') {
        return <RejectedScreen />;
    }

    // Block PENDING_APPROVAL users from all pages EXCEPT documents
    if (
        user?.registrationStatus === 'PENDING_APPROVAL' && 
        !location.pathname.includes('/documents')
    ) {
        return <PendingApprovalScreen />;
    }

    // Force INCOMPLETE_PROFILE back to registration step 3
    if (user?.registrationStatus === 'INCOMPLETE_PROFILE') {
        return <Navigate to="/auth/register/resident" replace />;
    }

    return (
        <PortalLayout sidebarConfig={SIDEBAR_CONFIG}>
            <ResidentWalkInListener />
            <Routes>
                <Route index element={<ResidentDashboardPage />} />
                <Route path="notices" element={<ResidentNoticesPage />} />
                <Route path="profile" element={<ResidentProfilePage />} />
                <Route path="complaints" element={<ResidentComplaintsPage />} />
                <Route path="emergency" element={<ResidentEmergencyPage />} />
                <Route path="vehicles" element={<ResidentVehiclePage />} />
                <Route path="visitors" element={<ResidentVisitorPage />} />
                <Route path="polls" element={<ResidentPollsPage />} />
                <Route path="invoices" element={<ResidentInvoicesPage />} />
                <Route path="documents" element={<ResidentDocumentsPage />} />
                <Route path="*" element={<Navigate to="/resident" replace />} />
            </Routes>
        </PortalLayout>
    );
}
