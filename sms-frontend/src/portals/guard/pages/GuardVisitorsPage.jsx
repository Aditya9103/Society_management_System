import React, { useState } from 'react';
import { 
    useGuardWalkInMutation, 
    useGuardScanQrMutation, 
    useGuardLogEntryMutation, 
    useGuardLogExitMutation,
    useGetStaffUnitsQuery
} from '../../../store/api/staffApi';
import { QrCode, UserPlus, LogIn, LogOut, CheckCircle, XCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { getSocket } from '../../../socket/socketClient';

export default function GuardVisitorsPage() {
    const [activeTab, setActiveTab] = useState('WALK_IN'); // WALK_IN, SCAN, ACTIVE
    const token = useSelector(state => state.auth.accessToken);

    React.useEffect(() => {
        if (!token) return;
        const socket = getSocket();
        if (!socket) return;

        const handleApproved = (data) => {
            alert(`✅ Walk-In Approved by Resident!\nVisitor: ${data.visitorName}`);
        };
        const handleDenied = (data) => {
            alert(`❌ Walk-In Denied by Resident!\nVisitor: ${data.visitorName}`);
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
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Visitor Gates</h1>
                <p className="text-sm text-slate-500 mt-1">Manage Walk-ins, Scan QR Codes, and Monitor Active Visitors.</p>
            </div>

            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl max-w-fit">
                {['WALK_IN', 'SCAN', 'ACTIVE'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
                            activeTab === tab 
                            ? 'bg-white text-orange-600 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        {tab.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {activeTab === 'WALK_IN' && <WalkInForm />}
            {activeTab === 'SCAN' && <ScanQrForm />}
            {activeTab === 'ACTIVE' && <ActiveVisitorsList />}
        </div>
    );
}

// ── Walk-In Form ──────────────────────────────────────────────────────────────

function WalkInForm() {
    const { data: unitsData, isLoading: isLoadingUnits } = useGetStaffUnitsQuery();
    const units = unitsData?.data || [];
    
    const [guardWalkIn, { isLoading, data, isError, error, isSuccess }] = useGuardWalkInMutation();
    const [form, setForm] = useState({
        hostUnitId: '', visitorName: '', visitorPhone: '', visitorType: 'GUEST', purpose: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await guardWalkIn(form).unwrap();
            setForm({ hostUnitId: '', visitorName: '', visitorPhone: '', visitorType: 'GUEST', purpose: '' });
        } catch (err) {}
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 max-w-2xl border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-orange-500" /> New Walk-In Visitor
            </h2>

            {isSuccess && (
                <div className="mb-4 flex items-center gap-3 p-3 bg-green-50 text-green-700 rounded-xl border border-green-200 text-sm font-medium">
                    <CheckCircle className="h-5 w-5" /> Walk-in requested! Waiting for resident approval.
                </div>
            )}
            {isError && (
                <div className="mb-4 flex flex-col gap-1 p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm font-medium">
                    <div className="flex items-center gap-3">
                        <XCircle className="h-5 w-5" /> 
                        <span>{error?.data?.message || 'Failed to submit walk-in'}</span>
                    </div>
                    {error?.data?.details && error.data.details.length > 0 && (
                        <ul className="list-disc list-inside ml-8 text-xs opacity-90">
                            {error.data.details.map((err, idx) => (
                                <li key={idx}>{err.field}: {err.message}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Select Unit / Flat Number</label>
                        <select className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none text-sm bg-white"
                            value={form.hostUnitId} onChange={e => setForm({...form, hostUnitId: e.target.value})} required disabled={isLoadingUnits}>
                            <option value="">{isLoadingUnits ? 'Loading Units...' : '-- Select a Unit --'}</option>
                            {units.map(u => (
                                <option key={u._id} value={u.unitNumber}>
                                    {u.unitNumber} - {u.towerId?.name || 'Tower'} 
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Visitor Name</label>
                        <input className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                            value={form.visitorName} onChange={e => setForm({...form, visitorName: e.target.value})} required placeholder="Full name" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Phone</label>
                        <input className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                            value={form.visitorPhone} onChange={e => setForm({...form, visitorPhone: e.target.value})} placeholder="Phone number" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Visitor Type</label>
                        <select className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none text-sm bg-white"
                            value={form.visitorType} onChange={e => setForm({...form, visitorType: e.target.value})}>
                            {['GUEST', 'DELIVERY', 'SERVICE', 'VENDOR', 'CONTRACTOR'].map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Purpose</label>
                        <input className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                            value={form.purpose} onChange={e => setForm({...form, purpose: e.target.value})} placeholder="e.g. Courier" />
                    </div>
                </div>

                <button disabled={isLoading} className="w-full py-2.5 mt-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition disabled:opacity-50">
                    {isLoading ? 'Requesting...' : 'Request Entry Approval'}
                </button>
            </form>
        </div>
    );
}

// ── Scan QR Form ──────────────────────────────────────────────────────────────

function ScanQrForm() {
    const [qrCode, setQrCode] = useState('');
    const [guardScanQr, { isLoading, data, isError, error }] = useGuardScanQrMutation();
    const [guardLogEntry] = useGuardLogEntryMutation();

    const handleScan = async (e) => {
        e.preventDefault();
        try {
            await guardScanQr({ qrCode }).unwrap();
        } catch (err) {}
    };

    const handleAllowEntry = async () => {
        if (!data?.data?.visitor?._id) return;
        try {
            await guardLogEntry({ id: data.data.visitor._id }).unwrap();
            alert('Entry Logged Successfully!');
            setQrCode('');
        } catch (err) {
            alert('Failed to log entry: ' + (err.data?.message || err.message));
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 max-w-lg border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <QrCode className="h-5 w-5 text-orange-500" /> Scan Visitor QR
            </h2>

            <form onSubmit={handleScan} className="flex gap-2">
                <input 
                    value={qrCode} 
                    onChange={e => setQrCode(e.target.value)}
                    placeholder="Enter QR Code String..."
                    className="flex-1 px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-orange-500"
                    required
                />
                <button disabled={isLoading} className="px-6 py-2 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-900 disabled:opacity-50">
                    Scan
                </button>
            </form>

            {isError && <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error?.data?.message || 'Invalid QR'}</div>}
            
            {data?.data?.visitor && (
                <div className="mt-6 p-4 border border-emerald-200 bg-emerald-50 rounded-xl space-y-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-emerald-900 text-lg">{data.data.visitor.visitorName}</p>
                            <p className="text-emerald-700 text-sm font-medium">{data.data.visitor.visitorType}</p>
                        </div>
                        <span className="px-2 py-1 bg-emerald-200 text-emerald-800 text-xs font-bold rounded-lg uppercase">
                            {data.data.visitor.status}
                        </span>
                    </div>
                    
                    <button onClick={handleAllowEntry} className="w-full flex items-center justify-center gap-2 mt-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition">
                        <LogIn className="w-5 h-5" /> Grant Access & Log Entry
                    </button>
                </div>
            )}
        </div>
    );
}

// ── Active Visitors List ─────────────────────────────────────────────────────

function ActiveVisitorsList() {
    // In a complete implementation, this would fetch from a specific GET /guard/visitors endpoint
    // For this prototype, we'll render a placeholder.
    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 text-center py-20">
            <h2 className="text-slate-400 font-medium text-lg">Active Visitors List</h2>
            <p className="text-slate-400 text-sm mt-1">Requires an active visitors GET endpoint in backend.</p>
        </div>
    );
}
