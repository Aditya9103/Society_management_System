import React, { useState } from 'react';
import { useStaffRaiseComplaintMutation } from '../../../../store/api/staffApi';
import { Input } from '../../../../components/ui/Input';
import { Textarea } from '../../../../components/ui/Textarea';
import Select from '../../../../components/ui/Select';
import { Button } from '../../../../components/ui/Button';
import Modal from '../../../../components/ui/Modal';
import Alert from '../../../../components/ui/Alert';

const CATEGORIES = ['PLUMBING','ELECTRICAL','CIVIL','SECURITY','CLEANING','LIFT','PARKING','NOISE','PEST_CONTROL','LANDSCAPING','INTERNET','GAS','ADMIN','OTHER'];

export default function RaiseComplaintModal({ isOpen, onClose }) {
    const [raiseComplaint, { isLoading }] = useStaffRaiseComplaintMutation();
    const [form, setForm] = useState({ title: '', description: '', category: 'GENERAL', priority: 'MEDIUM', isCommonArea: true, commonAreaLocation: '' });
    const [error, setError] = useState('');

    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target?.type === 'checkbox' ? e.target.checked : e.target?.value || e }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.description) return setError('Title and description required.');
        try { 
            await raiseComplaint(form).unwrap(); 
            setForm({ title: '', description: '', category: 'GENERAL', priority: 'MEDIUM', isCommonArea: true, commonAreaLocation: '' });
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
                <div className="grid grid-cols-2 gap-4">
                    <Select label="Category" value={form.category} onChange={set('category')}>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                    </Select>
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
