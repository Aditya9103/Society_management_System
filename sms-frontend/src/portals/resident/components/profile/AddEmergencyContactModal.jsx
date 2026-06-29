import React, { useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import { Input } from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import { Button } from '../../../../components/ui/Button';

export function AddEmergencyContactModal({ onClose, onAdd }) {
    const [form, setForm] = useState({ name: '', relation: 'SPOUSE', customRelation: '', phone: '', email: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) return setError('Name is required');
        if (!form.phone.trim()) return setError('Phone is required');
        
        let processedData = { ...form };
        if (processedData.relation !== 'OTHER') {
            delete processedData.customRelation;
        } else if (!processedData.customRelation?.trim()) {
            return setError('Please specify the relation');
        }
        
        setLoading(true);
        try {
            await onAdd(processedData);
            onClose();
        } catch (err) {
            setError(err?.data?.message || 'Failed to add emergency contact');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Add Emergency Contact">
            {error && <p className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input 
                    label="Full Name *" 
                    value={form.name} 
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Contact's name" 
                />
                
                <Select 
                    label="Relation *" 
                    value={form.relation} 
                    onChange={e => setForm(f => ({ ...f, relation: e.target.value }))}
                >
                    {['SPOUSE', 'CHILD', 'PARENT', 'SIBLING', 'GRANDPARENT', 'FRIEND', 'OTHER'].map(r => (
                        <option key={r} value={r}>{r}</option>
                    ))}
                </Select>

                {form.relation === 'OTHER' && (
                    <Input
                        label="Specify Relation *"
                        value={form.customRelation}
                        onChange={e => setForm(f => ({ ...f, customRelation: e.target.value }))}
                        placeholder="e.g. Colleague"
                    />
                )}

                <Input 
                    label="Phone *" 
                    value={form.phone} 
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+91 XXXXXXXXXX" 
                />

                <Input 
                    label="Email Address" 
                    type="email"
                    value={form.email} 
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="Optional: Will receive SOS alerts" 
                />

                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" isLoading={loading}>Add Contact</Button>
                </div>
            </form>
        </Modal>
    );
}
