import React, { useState } from 'react';
import { useCreateVisitorPassMutation } from '../../../../store/api/residentApi';
import { VISITOR_TYPES } from './constants';
import { DarkModal, DarkInput, DarkSelect, DarkButton } from '../profile/DarkUI';

export function AddVisitorModal({ onClose }) {
    const [createVisitorPass, { isLoading }] = useCreateVisitorPassMutation();
    const [form, setForm] = useState({
        visitorName: '', visitorPhone: '', visitorEmail: '', visitorType: 'GUEST', customVisitorType: '',
        purpose: '', expectedArrival: '', vehicleNumber: '',
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.visitorName.trim()) return setError('Visitor name is required.');
        setError('');
        const payload = { ...form };
        if (payload.visitorType !== 'OTHER') {
            delete payload.customVisitorType;
        } else if (!payload.customVisitorType?.trim()) {
            return setError('Please specify the custom visitor type.');
        }

        try {
            if (payload.expectedArrival) {
                payload.expectedArrival = new Date(payload.expectedArrival).toISOString();
            } else {
                delete payload.expectedArrival;
            }
            await createVisitorPass(payload).unwrap();
            onClose();
        } catch (err) {
            setError(err?.data?.message ?? 'Failed to create visitor pass.');
        }
    };

    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

    return (
        <DarkModal isOpen={true} onClose={onClose} title="Invite a Visitor">
            {error && <p className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                        <DarkInput 
                            label="Visitor Name *" 
                            value={form.visitorName} 
                            onChange={set('visitorName')}
                            placeholder="Full name" 
                        />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <DarkInput 
                            type="email"
                            label="Visitor Email (receives QR)" 
                            value={form.visitorEmail} 
                            onChange={set('visitorEmail')}
                            placeholder="visitor@example.com" 
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                        <DarkInput 
                            label="Phone Number" 
                            value={form.visitorPhone} 
                            onChange={set('visitorPhone')}
                            placeholder="+91 98765 43210" 
                        />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <DarkInput 
                            type="datetime-local"
                            label="Expected Arrival" 
                            value={form.expectedArrival} 
                            onChange={set('expectedArrival')}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                        <DarkSelect 
                            label="Visitor Type *" 
                            value={form.visitorType} 
                            onChange={set('visitorType')}
                        >
                            {VISITOR_TYPES.map(t => <option key={t} value={t} className="bg-[#0f111a] text-white">{t.replace('_', ' ')}</option>)}
                        </DarkSelect>
                    </div>
                    
                    {form.visitorType === 'OTHER' && (
                        <div className="col-span-2 sm:col-span-1">
                            <DarkInput
                                label="Specify Visitor Type *"
                                value={form.customVisitorType}
                                onChange={set('customVisitorType')}
                                placeholder="e.g. Inspector"
                            />
                        </div>
                    )}
                </div>
                <DarkInput 
                    label="Purpose" 
                    value={form.purpose} 
                    onChange={set('purpose')}
                    placeholder="e.g. Family visit, Package delivery..." 
                />
                <DarkInput 
                    label="Vehicle Number (optional)" 
                    value={form.vehicleNumber} 
                    onChange={set('vehicleNumber')}
                    placeholder="MH01AB1234" 
                />
                <div className="flex justify-end gap-3 pt-6 border-t border-slate-800/80 mt-6">
                    <DarkButton type="button" variant="secondary" onClick={onClose}>Cancel</DarkButton>
                    <DarkButton type="submit" variant="primary" isLoading={isLoading}>Create Pass</DarkButton>
                </div>
            </form>
        </DarkModal>
    );
}
