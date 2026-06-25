import React, { useState } from 'react';
import WalkInForm from '../components/visitors/WalkInForm';
import ScanQrForm from '../components/visitors/ScanQrForm';
import ActiveVisitorsList from '../components/visitors/ActiveVisitorsList';
import { useSelector } from 'react-redux';
import { getSocket } from '../../../socket/socketClient';

import PageHeader from '../../../components/ui/PageHeader';
import TabBar from '../../../components/ui/TabBar';

const TABS = [
    { value: 'WALK_IN', label: 'Walk In' },
    { value: 'SCAN', label: 'Scan' },
    { value: 'ACTIVE', label: 'Active' },
];

export default function GuardVisitorsPage() {
    const [activeTab, setActiveTab] = useState('WALK_IN'); // WALK_IN, SCAN, ACTIVE
    const [recentApprovalEvent, setRecentApprovalEvent] = useState(null);
    const token = useSelector(state => state.auth.accessToken);

    React.useEffect(() => {
        if (!token) return;
        const socket = getSocket();
        if (!socket) return;

        const handleApproved = (data) => {
            alert(`✅ Walk-In Approved by Resident!\nVisitor: ${data.visitorName}`);
            setRecentApprovalEvent({ type: 'APPROVED', data });
        };
        const handleDenied = (data) => {
            alert(`❌ Walk-In Denied by Resident!\nVisitor: ${data.visitorName}`);
            setRecentApprovalEvent({ type: 'DENIED', data });
        };

        socket.on('visitor:approved', handleApproved);
        socket.on('visitor:denied', handleDenied);

        return () => {
            socket.off('visitor:approved', handleApproved);
            socket.off('visitor:denied', handleDenied);
        };
    }, [token]);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Visitor Gates"
                subtitle="Manage Walk-ins, Scan QR Codes, and Monitor Active Visitors."
            />

            <TabBar
                tabs={TABS}
                value={activeTab}
                onChange={setActiveTab}
            />

            {activeTab === 'WALK_IN' && <WalkInForm recentApprovalEvent={recentApprovalEvent} />}
            {activeTab === 'SCAN' && <ScanQrForm />}
            {activeTab === 'ACTIVE' && <ActiveVisitorsList />}
        </div>
    );
}
