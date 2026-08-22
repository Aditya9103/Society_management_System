import React, { useState } from 'react';
import { DarkModal, DarkInput, DarkSelect, DarkButton } from './DarkUI';

export function AddMemberModal({ onClose, onAdd }) {
    const [form, setForm] = useState({ name: '', relation: 'SPOUSE', customRelation: '', phone: '', gender: '', customGender: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) return setError('Name is required');
        let processedData = { ...form };
        if (processedData.relation !== 'OTHER') {
            delete processedData.customRelation;
        } else if (!processedData.customRelation?.trim()) {
            return setError('Please specify the relation');
        }
        
        if (processedData.gender !== 'OTHER') {
            delete processedData.customGender;
        } else if (!processedData.customGender?.trim()) {
            return setError('Please specify the custom gender');
        }

        setLoading(true);
        try {
            await onAdd(processedData);
            onClose();
        } catch {
            setError('Failed to add family member');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DarkModal isOpen={true} onClose={onClose} title="Add Family Member">
            {error && <p className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <DarkInput 
                    label="Full Name *" 
                    value={form.name} 
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Family member's name" 
                />
                <div className="grid grid-cols-2 gap-3">
                    <DarkSelect 
                        label="Relation *" 
                        value={form.relation} 
                        onChange={e => setForm(f => ({ ...f, relation: e.target.value }))}
                    >
                        {['SPOUSE', 'CHILD', 'PARENT', 'SIBLING', 'GRANDPARENT', 'OTHER'].map(r => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </DarkSelect>
                    <DarkSelect 
                        label="Gender" 
                        value={form.gender} 
                        onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                    >
                        <option value="">— Select —</option>
                        {['MALE', 'FEMALE', 'OTHER'].map(g => <option key={g} value={g}>{g}</option>)}
                    </DarkSelect>
                    
                    {form.relation === 'OTHER' && (
                        <DarkInput
                            label="Specify Relation *"
                            value={form.customRelation}
                            onChange={e => setForm(f => ({ ...f, customRelation: e.target.value }))}
                            placeholder="e.g. Uncle"
                        />
                    )}
                    
                    {form.gender === 'OTHER' && (
                        <DarkInput
                            label="Specify Gender *"
                            value={form.customGender}
                            onChange={e => setForm(f => ({ ...f, customGender: e.target.value }))}
                            placeholder="e.g. Non-Binary"
                        />
                    )}
                </div>
                <DarkInput 
                    label="Phone" 
                    value={form.phone} 
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+91 XXXXXXXXXX" 
                />
                <div className="flex justify-end gap-3 pt-4">
                    <DarkButton type="button" variant="secondary" onClick={onClose}>Cancel</DarkButton>
                    <DarkButton type="submit" isLoading={loading}>Add Member</DarkButton>
                </div>
            </form>
        </DarkModal>
    );
}
