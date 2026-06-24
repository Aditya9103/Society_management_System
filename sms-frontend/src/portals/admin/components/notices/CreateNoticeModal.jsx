import React, { useState } from 'react';
import { useCreateNoticeMutation } from '../../../../store/api/societyAdminApi';
import Modal from '../../../../components/ui/Modal';
import { Input } from '../../../../components/ui/Input';
import { Textarea } from '../../../../components/ui/Textarea';
import Select from '../../../../components/ui/Select';
import { Button } from '../../../../components/ui/Button';
import Alert from '../../../../components/ui/Alert';

export default function CreateNoticeModal({ onClose }) {
    const [createNotice, { isLoading }] = useCreateNoticeMutation();
    const [form, setForm] = useState({
        title: '', content: '', noticeType: 'GENERAL', priority: 'NORMAL', isPinned: false,
    });
    const [error, setError] = useState('');
    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e?.target?.type === 'checkbox' ? e.target.checked : (e?.target !== undefined ? e.target.value : e) }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.content) return setError('Title and content are required.');
        setError('');
        try {
            await createNotice(form).unwrap();
            onClose();
        } catch (err) {
            setError(err?.data?.message ?? 'Failed to create notice.');
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Create Notice">
            {error && <Alert type="error" className="mb-4">{error}</Alert>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input 
                    label="Title *" 
                    value={form.title} 
                    onChange={set('title')} 
                    maxLength={150}
                    placeholder="Notice title" 
                />
                <Textarea 
                    label="Content *" 
                    value={form.content} 
                    onChange={set('content')} 
                    rows={4}
                    placeholder="Full notice text..." 
                />
                <div className="grid grid-cols-2 gap-4">
                    <Select label="Type" value={form.noticeType} onChange={set('noticeType')}>
                        {['GENERAL','MAINTENANCE','FINANCIAL','EMERGENCY','EVENT','LEGAL','PARKING','MEETING'].map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </Select>
                    <Select label="Priority" value={form.priority} onChange={set('priority')}>
                        {['LOW','NORMAL','HIGH','URGENT'].map(p => <option key={p} value={p}>{p}</option>)}
                    </Select>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={form.isPinned} onChange={set('isPinned')} className="h-4 w-4 rounded accent-indigo-600" />
                    <span className="text-sm text-slate-600">Pin this notice to the top</span>
                </label>
                <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
                    <Button type="submit" isLoading={isLoading} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white">
                        Create & Publish
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
