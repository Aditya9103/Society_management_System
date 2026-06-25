import React, { useState, useEffect } from 'react';
import { useGetStaffUnitsQuery, useGuardWalkInMutation } from '../../../../store/api/staffApi';
import { UserPlus, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Input } from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import { Button } from '../../../../components/ui/Button';

export default function WalkInForm({ recentApprovalEvent }) {
    const { data: unitsData, isLoading: isLoadingUnits } = useGetStaffUnitsQuery();
    const units = unitsData?.data || [];

    const [guardWalkIn, { isLoading, data, isError, error, isSuccess }] = useGuardWalkInMutation();
    const [form, setForm] = useState({
        hostUnitId: '', visitorName: '', visitorPhone: '', visitorType: 'GUEST', purpose: ''
    });
    const [recentVisitor, setRecentVisitor] = useState(null);

    useEffect(() => {
        if (recentApprovalEvent && recentVisitor && recentVisitor.status === 'WAITING') {
            if (recentApprovalEvent.data.visitorName === recentVisitor.name) {
                setRecentVisitor(prev => ({ ...prev, status: recentApprovalEvent.type }));
            }
        }
    }, [recentApprovalEvent, recentVisitor]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await guardWalkIn(form).unwrap();
            setRecentVisitor({ name: form.visitorName, status: 'WAITING' });
            setForm({ hostUnitId: '', visitorName: '', visitorPhone: '', visitorType: 'GUEST', purpose: '' });
        } catch (err) { }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 max-w-2xl border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-orange-500" /> New Walk-In Visitor
            </h2>

            {recentVisitor?.status === 'WAITING' && (
                <div className="mb-6 flex items-center gap-3 p-4 bg-blue-50 text-blue-700 rounded-xl border border-blue-200 text-sm font-medium">
                    <Clock className="h-5 w-5 text-blue-600" /> Walk-in requested for {recentVisitor.name}! Waiting for resident approval.
                </div>
            )}
            {recentVisitor?.status === 'APPROVED' && (
                <div className="mb-6 flex items-center gap-3 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 text-sm font-medium">
                    <CheckCircle className="h-5 w-5 text-green-600" /> Walk-in for {recentVisitor.name} Approved by Resident!
                </div>
            )}
            {recentVisitor?.status === 'DENIED' && (
                <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm font-medium">
                    <XCircle className="h-5 w-5 text-red-600" /> Walk-in for {recentVisitor.name} Denied by Resident!
                </div>
            )}
            {isSuccess && !recentVisitor && (
                <div className="mb-6 flex items-center gap-3 p-4 bg-blue-50 text-blue-700 rounded-xl border border-blue-200 text-sm font-medium">
                    <Clock className="h-5 w-5" /> Walk-in requested! Waiting for resident approval.
                </div>
            )}
            {isError && (
                <div className="mb-6 flex flex-col gap-1 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm font-medium">
                    <div className="flex items-center gap-3">
                        <XCircle className="h-5 w-5" />
                        <span>{error?.data?.message || 'Failed to submit walk-in'}</span>
                    </div>
                    {error?.data?.details && error.data.details.length > 0 && (
                        <ul className="list-disc list-inside ml-8 mt-2 text-xs opacity-90">
                            {error.data.details.map((err, idx) => (
                                <li key={idx}>{err.field}: {err.message}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <Select
                    label="Select Unit / Flat Number *"
                    value={form.hostUnitId}
                    onChange={e => setForm({ ...form, hostUnitId: e.target.value })}
                    required
                    disabled={isLoadingUnits}
                >
                    <option value="">{isLoadingUnits ? 'Loading Units...' : '-- Select a Unit --'}</option>
                    {units.map(u => (
                        <option key={u._id} value={u.unitNumber}>
                            {u.unitNumber} - {u.towerId?.name || 'Tower'}
                        </option>
                    ))}
                </Select>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Input
                        label="Visitor Name *"
                        value={form.visitorName}
                        onChange={e => setForm({ ...form, visitorName: e.target.value })}
                        required
                        placeholder="Full name"
                    />
                    <Input
                        label="Phone"
                        value={form.visitorPhone}
                        onChange={e => setForm({ ...form, visitorPhone: e.target.value })}
                        placeholder="Phone number"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Select
                        label="Visitor Type"
                        value={form.visitorType}
                        onChange={e => setForm({ ...form, visitorType: e.target.value })}
                    >
                        {['GUEST', 'DELIVERY', 'SERVICE', 'VENDOR', 'CONTRACTOR'].map(t => <option key={t} value={t}>{t}</option>)}
                    </Select>
                    <Input
                        label="Purpose"
                        value={form.purpose}
                        onChange={e => setForm({ ...form, purpose: e.target.value })}
                        placeholder="e.g. Courier"
                    />
                </div>

                <div className="pt-2">
                    <Button
                        type="submit"
                        className="w-full bg-orange-500 hover:bg-orange-600 focus:ring-orange-500 text-white"
                        isLoading={isLoading}
                    >
                        Request Entry Approval
                    </Button>
                </div>
            </form>
        </div>
    );
}
