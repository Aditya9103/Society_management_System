/**
 * StaffNoticesPage.jsx — Notice board for staff.
 * COMMITTEE_MEMBER: can create + publish.
 * HELP_DESK: read-only.
 */
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useGetStaffNoticesQuery, useStaffCreateNoticeMutation, useStaffPublishNoticeMutation } from '../../../store/api/staffApi';
import { Bell, Plus, X, RefreshCw, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Pin } from 'lucide-react';

const STATUS_STYLES = {
    DRAFT: { cls: 'bg-slate-100 text-slate-500', label: 'Draft' },
    PUBLISHED: { cls: 'bg-emerald-100 text-emerald-700', label: 'Published' },
    ARCHIVED: { cls: 'bg-slate-200 text-slate-400', label: 'Archived' },
};

const TYPE_STYLES = {
    GENERAL: 'bg-slate-100 text-slate-600', MAINTENANCE: 'bg-amber-100 text-amber-700',
    FINANCIAL: 'bg-emerald-100 text-emerald-700', EMERGENCY: 'bg-red-100 text-red-700',
    EVENT: 'bg-purple-100 text-purple-700', LEGAL: 'bg-blue-100 text-blue-700',
    PARKING: 'bg-indigo-100 text-indigo-700', MEETING: 'bg-cyan-100 text-cyan-700',
};

function CreateModal({ onClose }) {
    const [createNotice, { isLoading }] = useStaffCreateNoticeMutation();
    const [form, setForm] = useState({ title: '', content: '', noticeType: 'GENERAL', priority: 'NORMAL', isPinned: false });
    const [error, setError] = useState('');
    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.content) return setError('Title and content are required.');
        try { await createNotice(form).unwrap(); onClose(); }
        catch (err) { setError(err?.data?.message ?? 'Failed to create notice.'); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-slate-800 text-lg">Create Notice</h3>
                    <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100"><X className="h-5 w-5" /></button>
                </div>
                {error && <p className="mb-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Title *</label>
                        <input value={form.title} onChange={set('title')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Content *</label>
                        <textarea value={form.content} onChange={set('content')} rows={4} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Type</label>
                            <select value={form.noticeType} onChange={set('noticeType')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                                {['GENERAL','MAINTENANCE','FINANCIAL','EMERGENCY','EVENT','LEGAL','PARKING','MEETING'].map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Priority</label>
                            <select value={form.priority} onChange={set('priority')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                                {['LOW','NORMAL','HIGH','URGENT'].map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={form.isPinned} onChange={set('isPinned')} className="h-4 w-4 rounded accent-indigo-600" />
                        <span className="text-sm text-slate-600">Pin to top</span>
                    </label>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600">Cancel</button>
                        <button type="submit" disabled={isLoading} className="flex-1 rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-2">
                            {isLoading && <RefreshCw className="h-4 w-4 animate-spin" />} Create & Publish
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function NoticeCard({ notice, canPublish }) {
    const [publishNotice, { isLoading }] = useStaffPublishNoticeMutation();
    const [expanded, setExpanded] = useState(false);
    const s = STATUS_STYLES[notice.status] ?? STATUS_STYLES.PUBLISHED;
    const t = TYPE_STYLES[notice.noticeType] ?? TYPE_STYLES.GENERAL;

    return (
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0 flex items-start gap-2">
                    {notice.isPinned && <Pin className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />}
                    <div>
                        <p className="font-semibold text-slate-900">{notice.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{new Date(notice.publishedAt ?? notice.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                </div>
                <span className={`text-xs font-semibold rounded-full px-2.5 py-0.5 shrink-0 ${s.cls}`}>{s.label}</span>
            </div>
            <div className="flex gap-2 mb-2"><span className={`text-xs font-medium rounded-full px-2.5 py-0.5 ${t}`}>{notice.noticeType}</span></div>
            <p className={`text-sm text-slate-600 leading-relaxed ${!expanded ? 'line-clamp-2' : ''}`}>{notice.content}</p>
            <div className="flex items-center justify-between mt-2">
                {notice.content?.length > 100 && (
                    <button onClick={() => setExpanded(!expanded)} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                        {expanded ? <><ChevronUp className="h-3.5 w-3.5" /> Less</> : <><ChevronDown className="h-3.5 w-3.5" /> More</>}
                    </button>
                )}
                {canPublish && notice.status === 'DRAFT' && (
                    <button onClick={() => publishNotice(notice._id)} disabled={isLoading}
                        className="flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 ml-auto">
                        {isLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />} Publish
                    </button>
                )}
            </div>
        </div>
    );
}

export default function StaffNoticesPage() {
    const { user } = useSelector(s => s.auth);
    const role = user?.role;
    const { data, isLoading, isError, refetch } = useGetStaffNoticesQuery();
    const [showModal, setShowModal] = useState(false);
    const notices = data?.data ?? [];
    const canPublish = role === 'COMMITTEE_MEMBER';

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Notice Board</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Society announcements and communications</p>
                </div>
                {canPublish && (
                    <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition">
                        <Plus className="h-4 w-4" /> Create Notice
                    </button>
                )}
            </div>

            {isError && (
                <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-600 ring-1 ring-red-200">
                    <AlertCircle className="h-5 w-5 shrink-0" /> Failed to load. <button onClick={refetch} className="underline ml-1">Retry</button>
                </div>
            )}

            {isLoading ? (
                <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-200" />)}</div>
            ) : notices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50"><Bell className="h-8 w-8 text-indigo-400" /></div>
                    <p className="font-semibold text-slate-700">No notices yet</p>
                </div>
            ) : (
                <div className="space-y-3">{notices.map(n => <NoticeCard key={n._id} notice={n} canPublish={canPublish} />)}</div>
            )}

            {showModal && <CreateModal onClose={() => { setShowModal(false); refetch(); }} />}
        </div>
    );
}
