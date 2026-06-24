import React, { useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import { Input } from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import { Button } from '../../../../components/ui/Button';
import { Textarea } from '../../../../components/ui/Textarea';
import { useRaiseComplaintMutation } from '../../../../store/api/residentApi';
import { COMPLAINT_CATEGORIES } from './constants';

export function RaiseComplaintModal({ onClose }) {
    const [raiseComplaint, { isLoading }] = useRaiseComplaintMutation();
    const [form, setForm] = useState({
        title: '', description: '', category: 'ELECTRICAL', subcategory: COMPLAINT_CATEGORIES['ELECTRICAL'][0], priority: 'MEDIUM', isCommonArea: false, commonAreaLocation: '',
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e, status = 'OPEN') => {
        if (e) e.preventDefault();
        if (!form.title.trim() || !form.description.trim()) return setError('Title and description are required.');
        setError('');
        try {
            await raiseComplaint({ ...form, status }).unwrap();
            onClose();
        } catch (err) {
            setError(err?.data?.message ?? 'Failed to raise complaint.');
        }
    };

    const set = (k) => (e) => {
        const val = e.target.value;
        if (k === 'category') {
            setForm(f => ({ ...f, category: val, subcategory: COMPLAINT_CATEGORIES[val][0] }));
        } else {
            setForm(f => ({ ...f, [k]: val }));
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Raise a Complaint">
            {error && <p className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            <form onSubmit={e => handleSubmit(e, 'OPEN')} className="space-y-4">
                <Input 
                    label="Title *" 
                    value={form.title} 
                    onChange={set('title')} 
                    maxLength={150}
                    placeholder="Brief description of the issue" 
                />
                <Textarea 
                    label="Description *" 
                    value={form.description} 
                    onChange={set('description')} 
                    rows={3}
                    placeholder="Detailed description..." 
                />
                <div className="grid grid-cols-2 gap-3">
                    <Select 
                        label="Category *" 
                        value={form.category} 
                        onChange={set('category')}
                    >
                        {Object.keys(COMPLAINT_CATEGORIES).map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                    </Select>
                    <Select 
                        label="Subcategory *" 
                        value={form.subcategory} 
                        onChange={set('subcategory')}
                    >
                        {COMPLAINT_CATEGORIES[form.category]?.map(s => <option key={s} value={s}>{s}</option>)}
                    </Select>
                </div>
                <Select 
                    label="Priority" 
                    value={form.priority} 
                    onChange={set('priority')}
                >
                    {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(p => <option key={p} value={p}>{p}</option>)}
                </Select>
                <div className="flex items-center gap-3 py-1">
                    <input type="checkbox" id="commonArea" checked={form.isCommonArea}
                        onChange={e => setForm(f => ({ ...f, isCommonArea: e.target.checked }))}
                        className="h-4 w-4 rounded accent-indigo-600" />
                    <label htmlFor="commonArea" className="text-sm font-medium text-gray-700">This is a common area issue</label>
                </div>
                {form.isCommonArea && (
                    <Input 
                        label="Location" 
                        value={form.commonAreaLocation} 
                        onChange={set('commonAreaLocation')}
                        placeholder="e.g. Building entrance, Lift lobby..." 
                    />
                )}
                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="button" variant="secondary" onClick={() => handleSubmit(null, 'DRAFT')} isLoading={isLoading}>Save as Draft</Button>
                    <Button type="submit" isLoading={isLoading}>Submit Complaint</Button>
                </div>
            </form>
        </Modal>
    );
}
