import React, { useState } from 'react';
import { DarkModal, DarkInput, DarkSelect, DarkButton } from './DarkUI';

export function AddDomesticStaffModal({ onClose, onAdd }) {
    const [form, setForm] = useState({ name: '', role: 'MAID', customRole: '', phone: '', photoFile: null });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) return setError('Name is required');
        let processedData = { ...form };
        if (processedData.role !== 'OTHER') {
            delete processedData.customRole;
        } else if (!processedData.customRole?.trim()) {
            return setError('Please specify the custom role');
        }
        
        setLoading(true);
        try {
            await onAdd(processedData);
            onClose();
        } catch {
            setError('Failed to add domestic staff');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DarkModal isOpen={true} onClose={onClose} title="Add Domestic Staff">
            {error && <p className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <DarkInput 
                    label="Full Name *" 
                    value={form.name} 
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Staff name" 
                />
                <div className="grid grid-cols-2 gap-3">
                    <DarkSelect 
                        label="Role *" 
                        value={form.role} 
                        onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    >
                        {['MAID', 'COOK', 'DRIVER', 'GARDENER', 'NANNY', 'OTHER'].map(r => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </DarkSelect>
                    {form.role === 'OTHER' && (
                        <DarkInput
                            label="Specify Role *"
                            value={form.customRole}
                            onChange={e => setForm(f => ({ ...f, customRole: e.target.value }))}
                            placeholder="e.g. Electrician"
                        />
                    )}
                    <DarkInput 
                        label="Phone" 
                        value={form.phone} 
                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="+91 XXXXXXXXXX" 
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Photo (Optional)</label>
                    <input type="file" accept="image/*" onChange={e => setForm(f => ({ ...f, photoFile: e.target.files[0] }))}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-purple-500/20 file:text-purple-400 hover:file:bg-purple-500/30 transition-colors" />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <DarkButton type="button" variant="secondary" onClick={onClose}>Cancel</DarkButton>
                    <DarkButton type="submit" isLoading={loading}>Add Staff</DarkButton>
                </div>
            </form>
        </DarkModal>
    );
}
