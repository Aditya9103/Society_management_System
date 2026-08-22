import React, { useState } from 'react';
import { DarkModal, DarkInput, DarkSelect, DarkButton } from './DarkUI';

export function AddEmergencyContactModal({ onClose, onAdd }) {
    const [form, setForm] = useState({ name: '', relation: 'SPOUSE', customRelation: '', phone: '', email: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) return setError('Name is required');
        if (!form.phone.trim()) return setError('Phone is required');
        
        let processedData = { ...form };
        if (processedData.relation === 'OTHER') {
            if (!processedData.customRelation?.trim()) {
                return setError('Please specify the relation');
            }
            processedData.relation = processedData.customRelation.trim();
        }
        delete processedData.customRelation;
        
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
        <DarkModal isOpen={true} onClose={onClose} title="Add Emergency Contact">
            {error && <p className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <DarkInput 
                    label="Full Name *" 
                    value={form.name} 
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Contact's name" 
                />
                
                <DarkSelect 
                    label="Relation *" 
                    value={form.relation} 
                    onChange={e => setForm(f => ({ ...f, relation: e.target.value }))}
                >
                    {['SPOUSE', 'CHILD', 'PARENT', 'SIBLING', 'GRANDPARENT', 'FRIEND', 'OTHER'].map(r => (
                        <option key={r} value={r}>{r}</option>
                    ))}
                </DarkSelect>

                {form.relation === 'OTHER' && (
                    <DarkInput
                        label="Specify Relation *"
                        value={form.customRelation}
                        onChange={e => setForm(f => ({ ...f, customRelation: e.target.value }))}
                        placeholder="e.g. Colleague"
                    />
                )}

                <DarkInput 
                    label="Phone *" 
                    value={form.phone} 
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+91 XXXXXXXXXX" 
                />

                <DarkInput 
                    label="Email Address" 
                    type="email"
                    value={form.email} 
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="Optional: Will receive SOS alerts" 
                />

                <div className="flex justify-end gap-3 pt-4">
                    <DarkButton type="button" variant="secondary" onClick={onClose}>Cancel</DarkButton>
                    <DarkButton type="submit" isLoading={loading}>Add Contact</DarkButton>
                </div>
            </form>
        </DarkModal>
    );
}
