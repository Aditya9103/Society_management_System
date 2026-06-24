import React, { useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import { Input } from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import { Button } from '../../../../components/ui/Button';

export function AddMemberModal({ onClose, onAdd }) {
    const [form, setForm] = useState({ name: '', relation: 'SPOUSE', phone: '', gender: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) return setError('Name is required');
        setLoading(true);
        try {
            await onAdd(form);
            onClose();
        } catch {
            setError('Failed to add family member');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Add Family Member">
            {error && <p className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input 
                    label="Full Name *" 
                    value={form.name} 
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Family member's name" 
                />
                <div className="grid grid-cols-2 gap-3">
                    <Select 
                        label="Relation *" 
                        value={form.relation} 
                        onChange={e => setForm(f => ({ ...f, relation: e.target.value }))}
                    >
                        {['SPOUSE', 'CHILD', 'PARENT', 'SIBLING', 'GRANDPARENT', 'OTHER'].map(r => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </Select>
                    <Select 
                        label="Gender" 
                        value={form.gender} 
                        onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                    >
                        <option value="">— Select —</option>
                        {['MALE', 'FEMALE', 'OTHER'].map(g => <option key={g} value={g}>{g}</option>)}
                    </Select>
                </div>
                <Input 
                    label="Phone" 
                    value={form.phone} 
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+91 XXXXXXXXXX" 
                />
                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" isLoading={loading}>Add Member</Button>
                </div>
            </form>
        </Modal>
    );
}
