import React, { useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import { Input } from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import DatePicker from '../../../../components/ui/DatePicker';
import { Button } from '../../../../components/ui/Button';
import { useCreateVisitorPassMutation } from '../../../../store/api/residentApi';
import { VISITOR_TYPES } from './constants';

export function AddVisitorModal({ onClose }) {
    const [createVisitorPass, { isLoading }] = useCreateVisitorPassMutation();
    const [form, setForm] = useState({
        visitorName: '', visitorPhone: '', visitorEmail: '', visitorType: 'GUEST', customVisitorType: '',
        purpose: '', expectedArrival: null, vehicleNumber: '',
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
                payload.expectedArrival = payload.expectedArrival.toISOString();
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
        <Modal isOpen={true} onClose={onClose} title="Invite a Visitor">
            {error && <p className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 sm:col-span-1">
                        <Input 
                            label="Visitor Name *" 
                            value={form.visitorName} 
                            onChange={set('visitorName')}
                            placeholder="Full name" 
                        />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <Input 
                            type="email"
                            label="Visitor Email (receives QR)" 
                            value={form.visitorEmail} 
                            onChange={set('visitorEmail')}
                            placeholder="visitor@example.com" 
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Select 
                        label="Visitor Type *" 
                        value={form.visitorType} 
                        onChange={set('visitorType')}
                    >
                        {VISITOR_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                    </Select>
                    
                    {form.visitorType === 'OTHER' && (
                        <Input
                            label="Specify Visitor Type *"
                            value={form.customVisitorType}
                            onChange={set('customVisitorType')}
                            placeholder="e.g. Inspector"
                        />
                    )}
                    
                    <DatePicker 
                        label="Expected Arrival" 
                        selected={form.expectedArrival} 
                        onChange={(date) => setForm(f => ({ ...f, expectedArrival: date }))}
                        minDate={new Date()}
                    />
                </div>
                <Input 
                    label="Purpose" 
                    value={form.purpose} 
                    onChange={set('purpose')}
                    placeholder="e.g. Family visit, Package delivery..." 
                />
                <Input 
                    label="Vehicle Number (optional)" 
                    value={form.vehicleNumber} 
                    onChange={set('vehicleNumber')}
                    placeholder="MH01AB1234" 
                />
                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" isLoading={isLoading}>Create Pass</Button>
                </div>
            </form>
        </Modal>
    );
}
