import React, { useEffect, useState } from 'react';
import { getSocket, disconnectSocket } from '../../../socket/socketClient';
import { useApproveWalkInMutation, useDenyWalkInMutation, useGetMyVisitorsQuery } from '../../../store/api/residentApi';
import { ShieldAlert, Check, X, RefreshCw } from 'lucide-react';
import { useSelector } from 'react-redux';

export default function ResidentWalkInListener() {
    const [approvalRequest, setApprovalRequest] = useState(null);
    const [approveWalkIn, { isLoading: isApproving }] = useApproveWalkInMutation();
    const [denyWalkIn, { isLoading: isDenying }] = useDenyWalkInMutation();

    const token = useSelector(state => state.auth.accessToken);

    // Fetch any missed/pending walk-ins on mount
    const { data: pendingVisitors } = useGetMyVisitorsQuery({ status: 'PENDING' }, { skip: !token });

    // 1. Sync from RTK Query (Handles page refresh & missed notifications)
    useEffect(() => {
        if (!pendingVisitors?.data) return;

        // Find the first pending real-time approval
        const walkInToApprove = pendingVisitors.data.find(v => v.approvalMethod === 'REAL_TIME_APPROVAL');
        
        if (walkInToApprove) {
            // Only set if we don't already have one, to avoid overwriting socket data
            if (!approvalRequest) {
                setApprovalRequest({
                    visitorId: walkInToApprove._id,
                    name: walkInToApprove.visitorName,
                    purpose: walkInToApprove.purpose || 'Walk-in Visit'
                });
            }
        } else {
            // If the list is empty or has no pending walk-ins, clear the popup
            setApprovalRequest(null);
        }
    }, [pendingVisitors]); // ONLY run when pendingVisitors changes!

    // 2. Sync from Socket (Handles real-time push)
    useEffect(() => {
        if (!token) return;

        const socket = getSocket();
        if (!socket) return;

        const handleApprovalRequest = (data) => {
            console.log('Received walk-in approval request:', data);
            setApprovalRequest(data);
        };

        socket.on('visitor:approval_request', handleApprovalRequest);

        return () => {
            socket.off('visitor:approval_request', handleApprovalRequest);
        };
    }, [token]);

    if (!approvalRequest) return null;

    const handleApprove = async () => {
        try {
            await approveWalkIn(approvalRequest.visitorId).unwrap();
            setApprovalRequest(null);
        } catch (err) {
            console.error('Failed to approve visitor:', err);
            if (err?.status === 400 || err?.data?.message?.includes('not pending')) {
                setApprovalRequest(null);
            } else {
                alert('Failed to approve visitor: ' + (err.data?.message || err.message));
            }
        }
    };

    const handleDeny = async () => {
        try {
            await denyWalkIn(approvalRequest.visitorId).unwrap();
            setApprovalRequest(null);
        } catch (err) {
            console.error('Failed to deny visitor:', err);
            if (err?.status === 400 || err?.data?.message?.includes('not pending')) {
                setApprovalRequest(null);
            } else {
                alert('Failed to deny visitor: ' + (err.data?.message || err.message));
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-100 animate-in zoom-in-95 duration-200 relative">
                <button 
                    onClick={() => setApprovalRequest(null)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
                >
                    <X className="h-5 w-5" />
                </button>
                <div className="flex flex-col items-center text-center">
                    <div className="h-16 w-16 bg-red-50 text-red-500 flex items-center justify-center rounded-full mb-4">
                        <ShieldAlert className="h-8 w-8" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Visitor at Gate!</h2>
                    <p className="text-sm text-slate-500 mt-2">
                        <strong className="text-slate-800">{approvalRequest.name}</strong> has arrived at the gate for <strong className="text-slate-800">{approvalRequest.purpose}</strong>. Do you allow them entry?
                    </p>
                </div>

                <div className="mt-6 flex flex-col gap-3">
                    <button
                        onClick={handleApprove}
                        disabled={isApproving || isDenying}
                        className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold transition disabled:opacity-50"
                    >
                        {isApproving ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                        Allow Entry
                    </button>

                    <button
                        onClick={handleDeny}
                        disabled={isApproving || isDenying}
                        className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold transition disabled:opacity-50"
                    >
                        {isDenying ? <RefreshCw className="h-5 w-5 animate-spin" /> : <X className="h-5 w-5" />}
                        Deny Entry
                    </button>
                </div>
            </div>
        </div>
    );
}
