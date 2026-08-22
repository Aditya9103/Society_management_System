import React, { useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import { useRaiseComplaintMutation } from '../../../../store/api/residentApi';
import { COMPLAINT_CATEGORIES } from './constants';
import { X, UploadCloud, AlertCircle } from 'lucide-react';

export function RaiseComplaintModal({ onClose }) {
    const [raiseComplaint, { isLoading }] = useRaiseComplaintMutation();
    const [form, setForm] = useState({
        title: '', description: '', category: 'ELECTRICAL', customCategory: '', subcategory: COMPLAINT_CATEGORIES['ELECTRICAL'][0], priority: 'MEDIUM', isCommonArea: false, commonAreaLocation: '',
    });
    const [imageFile, setImageFile] = useState(null);
    const [error, setError] = useState('');

    const handleSubmit = async (e, status = 'OPEN') => {
        if (e) e.preventDefault();
        if (!form.title.trim() || !form.description.trim()) return setError('Title and description are required.');
        if (form.category === 'OTHER' && !form.customCategory?.trim()) return setError('Please specify the custom category.');
        
        setError('');
        try {
            const formData = new FormData();
            Object.keys(form).forEach(key => {
                if (key === 'customCategory' && form.category !== 'OTHER') return;
                formData.append(key, form[key]);
            });
            formData.append('status', status);
            if (imageFile) {
                formData.append('images', imageFile);
            }

            await raiseComplaint(formData).unwrap();
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
        <Modal isOpen={true} onClose={onClose} className="!bg-[#0f111a] !border !border-slate-800 !p-0 shadow-[0_0_50px_rgba(79,70,229,0.15)] max-w-2xl w-full">
            
            {/* Custom Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-950/40 to-[#0f111a] border-b border-slate-800 px-6 py-5 flex items-start justify-between">
                <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-indigo-500/20 rounded-full blur-[40px] pointer-events-none"></div>
                <div className="relative z-10">
                    <h2 className="text-xl font-bold text-white tracking-tight">Raise a Complaint</h2>
                    <p className="mt-1 text-[13px] text-indigo-200/70">Please provide details so we can resolve it quickly.</p>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="relative z-10 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            <div className="p-6">
                {error && (
                    <div className="mb-5 flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <p>{error}</p>
                    </div>
                )}
                
                <form onSubmit={e => handleSubmit(e, 'OPEN')} className="space-y-5">
                    
                    <div className="space-y-1.5">
                        <label className="text-[13px] font-bold text-slate-300">Title <span className="text-red-400">*</span></label>
                        <input 
                            className="w-full bg-[#151722] border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-white text-[14px] placeholder:text-slate-600 outline-none transition-all"
                            value={form.title} 
                            onChange={set('title')} 
                            maxLength={150}
                            placeholder="Brief description of the issue" 
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[13px] font-bold text-slate-300">Description <span className="text-red-400">*</span></label>
                        <textarea 
                            className="w-full bg-[#151722] border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-3 text-white text-[14px] placeholder:text-slate-600 outline-none transition-all resize-none"
                            value={form.description} 
                            onChange={set('description')} 
                            rows={3}
                            placeholder="Detailed description of what happened..." 
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-bold text-slate-300">Category <span className="text-red-400">*</span></label>
                            <select 
                                className="w-full bg-[#151722] border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-white text-[14px] outline-none transition-all appearance-none"
                                value={form.category} 
                                onChange={set('category')}
                            >
                                {Object.keys(COMPLAINT_CATEGORIES).map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                            </select>
                        </div>
                        
                        {form.category === 'OTHER' ? (
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-bold text-slate-300">Specify Category <span className="text-red-400">*</span></label>
                                <input
                                    className="w-full bg-[#151722] border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-white text-[14px] placeholder:text-slate-600 outline-none transition-all"
                                    value={form.customCategory}
                                    onChange={set('customCategory')}
                                    placeholder="e.g. Internet Provider"
                                />
                            </div>
                        ) : (
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-bold text-slate-300">Subcategory <span className="text-red-400">*</span></label>
                                <select 
                                    className="w-full bg-[#151722] border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-white text-[14px] outline-none transition-all appearance-none"
                                    value={form.subcategory} 
                                    onChange={set('subcategory')}
                                >
                                    {COMPLAINT_CATEGORIES[form.category]?.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-bold text-slate-300">Priority</label>
                            <select 
                                className="w-full bg-[#151722] border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-white text-[14px] outline-none transition-all appearance-none"
                                value={form.priority} 
                                onChange={set('priority')}
                            >
                                {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        
                        <div className="flex flex-col justify-center space-y-2 mt-6">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center justify-center w-5 h-5 rounded border border-slate-700 bg-[#151722] group-hover:border-indigo-500 transition-colors">
                                    <input 
                                        type="checkbox" 
                                        checked={form.isCommonArea}
                                        onChange={e => setForm(f => ({ ...f, isCommonArea: e.target.checked }))}
                                        className="peer absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                    <div className="w-2.5 h-2.5 rounded-[2px] bg-indigo-500 scale-0 peer-checked:scale-100 transition-transform"></div>
                                </div>
                                <span className="text-[14px] font-medium text-slate-300">This is a common area issue</span>
                            </label>
                        </div>
                    </div>

                    {form.isCommonArea && (
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-bold text-slate-300">Location</label>
                            <input 
                                className="w-full bg-[#151722] border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-white text-[14px] placeholder:text-slate-600 outline-none transition-all"
                                value={form.commonAreaLocation} 
                                onChange={set('commonAreaLocation')}
                                placeholder="e.g. Building entrance, Lift lobby..." 
                            />
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-[13px] font-bold text-slate-300">Upload Image (Optional)</label>
                        <div className="relative overflow-hidden rounded-xl bg-[#151722] border border-dashed border-slate-700 hover:border-indigo-500/50 transition-colors">
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={e => setImageFile(e.target.files[0])}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="flex flex-col items-center justify-center p-6 text-center pointer-events-none">
                                <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center mb-3">
                                    <UploadCloud className="h-5 w-5 text-indigo-400" />
                                </div>
                                <p className="text-[13px] font-bold text-white mb-1">
                                    {imageFile ? imageFile.name : 'Click or drag image to upload'}
                                </p>
                                <p className="text-[11px] text-slate-500">SVG, PNG, JPG or GIF (max. 5MB)</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/50 mt-6">
                        <button 
                            type="button" 
                            className="px-5 py-2.5 rounded-xl bg-transparent hover:bg-slate-800 text-slate-300 text-[13px] font-bold transition-colors" 
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button 
                            type="button" 
                            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-[13px] font-bold transition-colors disabled:opacity-50" 
                            onClick={() => handleSubmit(null, 'DRAFT')} 
                            disabled={isLoading}
                        >
                            Save Draft
                        </button>
                        <button 
                            type="submit" 
                            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-bold transition-colors shadow-[0_0_15px_rgba(79,70,229,0.4)] disabled:opacity-50 flex items-center justify-center min-w-[140px]" 
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                            ) : 'Submit Complaint'}
                        </button>
                    </div>

                </form>
            </div>
        </Modal>
    );
}
