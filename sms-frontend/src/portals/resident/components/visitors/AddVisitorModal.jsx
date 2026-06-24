import React, { useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import { Input } from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import { Button } from '../../../../components/ui/Button';
import { useCreateVisitorPassMutation } from '../../../../store/api/residentApi';
import { VISITOR_TYPES } from './constants';

export function AddVisitorModal({ onClose }) {
    const [createVisitorPass, { isLoading }] = useCreateVisitorPassMutation();
    const [form, setForm] = useState({
        visitorName: '', visitorPhone: '', visitorEmail: '', visitorType: 'GUEST',
        purpose: '', expectedArrival: '', vehicleNumber: '',
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.visitorName.trim()) return setError('Visitor name is required.');
        setError('');
        try {
            await createVisitorPass(form).unwrap();
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
                    <Input 
                        type="datetime-local"
                        label="Expected Arrival" 
                        value={form.expectedArrival} 
                        onChange={set('expectedArrival')}
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
