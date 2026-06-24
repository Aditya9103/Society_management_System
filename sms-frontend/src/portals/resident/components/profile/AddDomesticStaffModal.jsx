import React, { useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import { Input } from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import { Button } from '../../../../components/ui/Button';

export function AddDomesticStaffModal({ onClose, onAdd }) {
    const [form, setForm] = useState({ name: '', role: 'MAID', phone: '', photoFile: null });
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
            setError('Failed to add domestic staff');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Add Domestic Staff">
            {error && <p className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input 
                    label="Full Name *" 
                    value={form.name} 
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Staff name" 
                />
                <div className="grid grid-cols-2 gap-3">
                    <Select 
                        label="Role *" 
                        value={form.role} 
                        onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    >
                        {['MAID', 'COOK', 'DRIVER', 'GARDENER', 'NANNY', 'OTHER'].map(r => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </Select>
                    <Input 
                        label="Phone" 
                        value={form.phone} 
                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="+91 XXXXXXXXXX" 
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Photo (Optional)</label>
                    <input type="file" accept="image/*" onChange={e => setForm(f => ({ ...f, photoFile: e.target.files[0] }))}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" isLoading={loading} className="bg-emerald-600 hover:bg-emerald-700">Add Staff</Button>
                </div>
            </form>
        </Modal>
    );
}
