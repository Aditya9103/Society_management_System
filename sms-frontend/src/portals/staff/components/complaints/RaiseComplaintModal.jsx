import React, { useState } from 'react';
import { useStaffRaiseComplaintMutation } from '../../../../store/api/staffApi';
import { Input } from '../../../../components/ui/Input';
import { Textarea } from '../../../../components/ui/Textarea';
import Select from '../../../../components/ui/Select';
import { Button } from '../../../../components/ui/Button';
import Modal from '../../../../components/ui/Modal';
import Alert from '../../../../components/ui/Alert';

const CATEGORIES = ['ELECTRICAL', 'PLUMBING', 'SECURITY', 'HOUSEKEEPING', 'LIFT_ELEVATOR', 'PARKING', 'GARDEN_LANDSCAPE', 'STRUCTURAL', 'NOISE_NUISANCE', 'AMENITY', 'ADMINISTRATIVE', 'OTHER'];

export default function RaiseComplaintModal({ isOpen, onClose }) {
    const [raiseComplaint, { isLoading }] = useStaffRaiseComplaintMutation();
    const [form, setForm] = useState({ title: '', description: '', category: 'GENERAL', customCategory: '', priority: 'MEDIUM', isCommonArea: true, commonAreaLocation: '' });
    const [imageFile, setImageFile] = useState(null);
    const [error, setError] = useState('');

    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target?.type === 'checkbox' ? e.target.checked : e.target?.value || e }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.description) return setError('Title and description required.');
        if (form.category === 'OTHER' && !form.customCategory?.trim()) return setError('Please specify the custom category.');
        try { 
            const formData = new FormData();
            Object.keys(form).forEach(key => {
                if (key === 'customCategory' && form.category !== 'OTHER') return;
                formData.append(key, form[key]);
            });
            if (imageFile) formData.append('images', imageFile);

            await raiseComplaint(formData).unwrap(); 
            setForm({ title: '', description: '', category: 'GENERAL', priority: 'MEDIUM', isCommonArea: true, commonAreaLocation: '' });
            setImageFile(null);
            setError('');
            onClose(); 
        } catch (err) { 
            setError(err?.data?.message ?? 'Failed to raise complaint.'); 
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Raise Complaint">
            {error && <Alert type="error" className="mb-4">{error}</Alert>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input 
                    label="Title *" 
                    value={form.title} 
                    onChange={set('title')} 
                    required 
                />
                <Textarea 
                    label="Description *" 
                    value={form.description} 
                    onChange={set('description')} 
                    required 
                    rows={3} 
                />
                <div className="flex items-center gap-2">
                    <input type="checkbox" checked={form.isCommonArea} onChange={set('isCommonArea')} id="isCommonArea" />
                    <label htmlFor="isCommonArea" className="text-sm">Is this a common area?</label>
                </div>
                {form.isCommonArea && (
                    <Input 
                        label="Common Area Location" 
                        value={form.commonAreaLocation} 
                        onChange={set('commonAreaLocation')}
                        placeholder="e.g. Building entrance, Lift lobby..." 
                    />
                )}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Upload Image (Optional)</label>
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={e => setImageFile(e.target.files[0])}
                        className="block w-full text-sm text-slate-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-md file:border-0
                            file:text-sm file:font-semibold
                            file:bg-indigo-50 file:text-indigo-700
                            hover:file:bg-indigo-100"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Select label="Category" value={form.category} onChange={set('category')}>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                    </Select>
                    
                    {form.category === 'OTHER' && (
                        <Input
                            label="Specify Category *"
                            value={form.customCategory}
                            onChange={set('customCategory')}
                            placeholder="e.g. Internet Provider"
                        />
                    )}

                    <Select label="Priority" value={form.priority} onChange={set('priority')}>
                        {['LOW','MEDIUM','HIGH','URGENT'].map(p => <option key={p} value={p}>{p}</option>)}
                    </Select>
                </div>
                <div className="flex gap-3 pt-4 border-t border-slate-100 mt-4">
                    <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
                    <Button type="submit" isLoading={isLoading} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white">
                        Submit
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
