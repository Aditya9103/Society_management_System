import React, { useState } from 'react';
import { useCreateNoticeMutation, useUpdateNoticeMutation } from '../../../../store/api/societyAdminApi';
import { X, Megaphone, Users, Calendar, Shield, Send, Bell, FileText, AlertCircle } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

export default function CreateNoticeModal({ onClose, initialData = null }) {
    const [createNotice, { isLoading: isCreating }] = useCreateNoticeMutation();
    const [updateNotice, { isLoading: isUpdating }] = useUpdateNoticeMutation();
    const isLoading = isCreating || isUpdating;
    const isEditMode = !!initialData;

    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        noticeType: initialData?.noticeType || '',
        content: initialData?.content || '',
        priority: initialData?.priority || 'NORMAL',
        targetAudience: initialData?.targetAudience?.type || 'ALL',
        scheduledAt: initialData?.scheduledAt ? new Date(initialData.scheduledAt).toISOString().slice(0, 16) : '',
    });

    const [error, setError] = useState('');

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleContentChange = (content) => setFormData(prev => ({ ...prev, content }));

    const handleSubmit = async (status) => {
        try {
            setError('');
            if (!formData.title || !formData.noticeType || !formData.content) {
                setError('Title, Type, and Content are required.');
                return;
            }

            const payload = {
                title: formData.title,
                noticeType: formData.noticeType,
                content: formData.content,
                priority: formData.priority,
                status: status,
                targetAudience: { type: formData.targetAudience },
                scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt).toISOString() : null,
            };

            if (isEditMode) {
                await updateNotice({ id: initialData._id, ...payload }).unwrap();
            } else {
                await createNotice(payload).unwrap();
            }
            onClose();
        } catch (err) {
            setError(err?.data?.message || 'Failed to create notice');
        }
    };

    const modules = {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link', 'image'],
            ['clean']
        ],
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#151722] rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 relative">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors z-10">
                    <X className="w-5 h-5" />
                </button>

                {/* Left Side - Hero / Info */}
                <div className="hidden md:flex flex-col w-[35%] bg-gradient-to-b from-[#1a1c29] to-[#151722] border-r border-white/5 p-10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[#6338f0]/5" />
                    
                    {/* Illustration Container */}
                    <div className="w-48 h-48 mx-auto mb-10 relative z-10">
                        <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-3xl" />
                        <div className="relative w-full h-full flex items-center justify-center">
                            <Megaphone className="w-24 h-24 text-indigo-400 drop-shadow-[0_0_15px_rgba(99,56,240,0.5)] transform -rotate-12" />
                            <div className="absolute -top-4 -left-4 w-12 h-12 bg-purple-500/20 rounded-2xl border border-purple-500/30 flex items-center justify-center backdrop-blur-md animate-bounce" style={{ animationDelay: '0.2s' }}>
                                <Bell className="w-5 h-5 text-purple-400" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-14 h-14 bg-emerald-500/20 rounded-2xl border border-emerald-500/30 flex items-center justify-center backdrop-blur-md animate-bounce" style={{ animationDelay: '0.5s' }}>
                                <FileText className="w-6 h-6 text-emerald-400" />
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 text-center mb-10">
                        <h2 className="text-2xl font-bold text-white mb-3">Create New Notice</h2>
                        <p className="text-gray-400 text-[14px] leading-relaxed">Share important updates and announcements with all residents or specific groups.</p>
                    </div>

                    <div className="space-y-6 relative z-10 mt-auto">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                                <Users className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <h4 className="text-[13px] font-bold text-white mb-1">Reach All Residents</h4>
                                <p className="text-[12px] text-gray-500 font-medium">Send notices to everyone in the society</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                                <Calendar className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <h4 className="text-[13px] font-bold text-white mb-1">Schedule for Later</h4>
                                <p className="text-[12px] text-gray-500 font-medium">Choose when your notice should be published</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                                <Shield className="w-5 h-5 text-orange-400" />
                            </div>
                            <div>
                                <h4 className="text-[13px] font-bold text-white mb-1">Set Priority Levels</h4>
                                <p className="text-[12px] text-gray-500 font-medium">Mark notices as Normal, High or Urgent</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="flex-1 p-8 md:p-10 overflow-y-auto flex flex-col custom-scrollbar">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">{isEditMode ? 'Edit Notice' : 'Create Notice'}</h2>
                            <p className="text-gray-400 text-[14px]">{isEditMode ? 'Update notice details and content.' : 'Draft a new notice or announcement for residents.'}</p>
                        </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] font-bold flex items-center gap-3">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-6 flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[13px] font-bold text-white flex items-center gap-1">Title <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Enter notice title..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white font-bold placeholder-gray-500 focus:outline-none focus:border-[#6338f0]/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[13px] font-bold text-white flex items-center gap-1">Type <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <select
                                        name="noticeType"
                                        value={formData.noticeType}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-[14px] text-white font-bold appearance-none focus:outline-none focus:border-[#6338f0]/50 cursor-pointer"
                                    >
                                        <option value="" className="bg-[#151722]">Select notice type</option>
                                        {['GENERAL', 'MAINTENANCE', 'FINANCIAL', 'EMERGENCY', 'EVENT', 'LEGAL', 'PARKING', 'MEETING'].map(t => (
                                            <option key={t} value={t} className="bg-[#151722]">{t}</option>
                                        ))}
                                    </select>
                                    <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[13px] font-bold text-white flex items-center gap-1">Content <span className="text-red-500">*</span></label>
                            <div className="rounded-xl overflow-hidden border border-white/10 focus-within:border-[#6338f0]/50 transition-colors">
                                <ReactQuill 
                                    theme="snow" 
                                    value={formData.content} 
                                    onChange={handleContentChange}
                                    modules={modules}
                                    className="bg-white/5 text-white quill-dark min-h-[250px]"
                                    placeholder="Write your notice content here..."
                                />
                            </div>
                            <style>{`
                                .quill-dark .ql-toolbar { border: none !important; border-bottom: 1px solid rgba(255,255,255,0.1) !important; background: rgba(255,255,255,0.02); }
                                .quill-dark .ql-container { border: none !important; font-family: inherit; font-size: 14px; min-height: 200px; }
                                .quill-dark .ql-editor { color: white; padding: 16px; font-weight: 500; }
                                .quill-dark .ql-editor.ql-blank::before { color: #6b7280; font-style: normal; }
                                .quill-dark .ql-stroke { stroke: #9ca3af; }
                                .quill-dark .ql-fill { fill: #9ca3af; }
                                .quill-dark button:hover .ql-stroke { stroke: white; }
                                .quill-dark button:hover .ql-fill { fill: white; }
                                .quill-dark .ql-active .ql-stroke { stroke: #6338f0; }
                                .quill-dark .ql-active .ql-fill { fill: #6338f0; }
                            `}</style>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-[13px] font-bold text-white flex items-center gap-1">Priority <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <select
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-[14px] text-white font-bold appearance-none focus:outline-none focus:border-[#6338f0]/50 cursor-pointer"
                                    >
                                        <option value="LOW" className="bg-[#151722]">Low</option>
                                        <option value="NORMAL" className="bg-[#151722]">Normal</option>
                                        <option value="HIGH" className="bg-[#151722]">High</option>
                                        <option value="URGENT" className="bg-[#151722]">Urgent</option>
                                    </select>
                                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${
                                        formData.priority === 'URGENT' ? 'bg-red-500' : 
                                        formData.priority === 'HIGH' ? 'bg-orange-500' : 
                                        formData.priority === 'NORMAL' ? 'bg-blue-500' : 'bg-gray-400'
                                    }`} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[13px] font-bold text-white flex items-center gap-1">Audience <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <select
                                        name="targetAudience"
                                        value={formData.targetAudience}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-[14px] text-white font-bold appearance-none focus:outline-none focus:border-[#6338f0]/50 cursor-pointer"
                                    >
                                        <option value="ALL" className="bg-[#151722]">All Residents</option>
                                        <option value="OWNERS" className="bg-[#151722]">Owners Only</option>
                                        <option value="TENANTS" className="bg-[#151722]">Tenants Only</option>
                                        <option value="DEFAULTERS" className="bg-[#151722]">Defaulters</option>
                                    </select>
                                    <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[13px] font-bold text-white flex items-center gap-1">Schedule <span className="text-gray-500 font-medium ml-1">(Optional)</span></label>
                                <div className="relative">
                                    <input
                                        type="datetime-local"
                                        name="scheduledAt"
                                        value={formData.scheduledAt}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-[14px] text-white font-bold focus:outline-none focus:border-[#6338f0]/50"
                                        style={{ colorScheme: 'dark' }}
                                    />
                                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {!formData.scheduledAt && (
                            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                                    <span className="text-indigo-400 font-serif italic text-sm">i</span>
                                </div>
                                <span className="text-[13px] text-gray-300 font-medium">If no schedule is set, the notice will be published immediately after creation.</span>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-white/5">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            disabled={isLoading}
                            className="px-6 py-2.5 rounded-xl border border-white/10 text-white font-bold text-[14px] hover:bg-white/5 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button 
                            type="button" 
                            onClick={() => handleSubmit('DRAFT')}
                            disabled={isLoading}
                            className="px-6 py-2.5 rounded-xl border border-[#6338f0]/50 text-indigo-400 font-bold text-[14px] hover:bg-[#6338f0]/10 transition-colors disabled:opacity-50"
                        >
                            {isEditMode ? 'Update Draft' : 'Save as Draft'}
                        </button>
                        <button 
                            type="button" 
                            onClick={() => handleSubmit(formData.scheduledAt ? 'SCHEDULED' : 'PUBLISHED')}
                            disabled={isLoading}
                            className="px-6 py-2.5 rounded-xl bg-[#6338f0] hover:bg-[#5b32e6] text-white font-bold text-[14px] shadow-[0_0_15px_rgba(99,56,240,0.4)] transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            <Send className="w-4 h-4" />
                            {isLoading ? 'Processing...' : (isEditMode ? 'Update & Publish' : 'Create & Publish')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
