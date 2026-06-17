import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import TenantsPage from './pages/TenantsPage';
import SocietiesPage from './pages/SocietiesPage';
import Sidebar from './components/Sidebar';

/**
 * SuperAdminApp — the shell layout for the Super Admin portal.
 *
 * Renders a fixed sidebar + scrollable main content area.
 * All child pages are mounted via nested <Routes>.
 */
export default function SuperAdminApp() {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />

            {/* Main content — offset by sidebar width */}
            <main className="flex-1 ml-64 min-h-screen">
                <div className="mx-auto max-w-7xl px-6 py-8">
                    <Routes>
                        <Route index element={<DashboardPage />} />
                        <Route path="tenants" element={<TenantsPage />} />
                        <Route path="societies" element={<SocietiesPage />} />
                        <Route path="*" element={<Navigate to="/super-admin" replace />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
}
