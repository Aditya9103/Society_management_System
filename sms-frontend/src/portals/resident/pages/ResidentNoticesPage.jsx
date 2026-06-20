/**
 * ResidentNoticesPage.jsx — Society notice board for residents.
 */
import React, { useState } from 'react';
import { useGetMyNoticesQuery } from '../../../store/api/residentApi';
import { Bell, AlertCircle, RefreshCw, ChevronDown, ChevronUp, Pin } from 'lucide-react';

const PRIORITY_STYLES = {
    LOW:    { cls: 'bg-slate-100 text-slate-500',    dot: 'bg-slate-400' },
    NORMAL: { cls: 'bg-blue-100 text-blue-600',      dot: 'bg-blue-500' },
    HIGH:   { cls: 'bg-orange-100 text-orange-700',  dot: 'bg-orange-500' },
    URGENT: { cls: 'bg-red-100 text-red-700',        dot: 'bg-red-500' },
};

const TYPE_STYLES = {
    GENERAL:     'bg-slate-100 text-slate-600',
    MAINTENANCE: 'bg-amber-100 text-amber-700',
    FINANCIAL:   'bg-emerald-100 text-emerald-700',
    EMERGENCY:   'bg-red-100 text-red-700',
    EVENT:       'bg-purple-100 text-purple-700',
    LEGAL:       'bg-blue-100 text-blue-700',
    PARKING:     'bg-indigo-100 text-indigo-700',
    MEETING:     'bg-cyan-100 text-cyan-700',
};

function NoticeCard({ notice }) {
    const [expanded, setExpanded] = useState(false);
    const p = PRIORITY_STYLES[notice.priority] ?? PRIORITY_STYLES.NORMAL;
    const t = TYPE_STYLES[notice.noticeType] ?? TYPE_STYLES.GENERAL;

    return (
        <div className={`rounded-2xl bg-white shadow-sm ring-1 transition hover:shadow-md ${notice.isPinned ? 'ring-indigo-300' : 'ring-slate-100'}`}>
            <div className="p-5">
                <div className="flex items-start gap-3 mb-2">
                    {notice.isPinned && (
                        <Pin className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 leading-snug">{notice.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {notice.publishedAt ? new Date(notice.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                            {notice.createdBy && ` · ${notice.createdBy.firstName} ${notice.createdBy.lastName}`}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className={`text-xs font-semibold rounded-full px-2.5 py-0.5 ${t}`}>{notice.noticeType}</span>
                    <span className={`flex items-center gap-1 text-xs font-semibold rounded-full px-2.5 py-0.5 ${p.cls}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${p.dot}`} />{notice.priority}
                    </span>
                </div>
                <p className={`text-sm text-slate-600 leading-relaxed ${!expanded ? 'line-clamp-2' : ''}`}>
                    {notice.content}
                </p>
                {notice.content.length > 120 && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="mt-2 flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                        {expanded ? <><ChevronUp className="h-3.5 w-3.5" /> Show less</> : <><ChevronDown className="h-3.5 w-3.5" /> Read more</>}
                    </button>
                )}
            </div>
        </div>
    );
}

export default function ResidentNoticesPage() {
    const { data, isLoading, isError, refetch } = useGetMyNoticesQuery();
    const notices = data?.data ?? [];
    const pinned = notices.filter(n => n.isPinned);
    const regular = notices.filter(n => !n.isPinned);

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Notice Board</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Society announcements and updates</p>
                </div>
                <button onClick={refetch} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 transition">
                    <RefreshCw className="h-4 w-4" /> Refresh
                </button>
            </div>

            {isError && (
                <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-600 ring-1 ring-red-200">
                    <AlertCircle className="h-5 w-5 shrink-0" /> Failed to load notices. <button onClick={refetch} className="underline ml-1">Retry</button>
                </div>
            )}

            {isLoading ? (
                <div className="space-y-3">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200" />)}
                </div>
            ) : notices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
                        <Bell className="h-8 w-8 text-indigo-400" />
                    </div>
                    <p className="font-semibold text-slate-700">No notices yet</p>
                    <p className="text-sm text-slate-400 mt-1">Society notices will appear here.</p>
                </div>
            ) : (
                <>
                    {pinned.length > 0 && (
                        <div>
                            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-indigo-500">📌 Pinned</p>
                            <div className="space-y-3">{pinned.map(n => <NoticeCard key={n._id} notice={n} />)}</div>
                        </div>
                    )}
                    {regular.length > 0 && (
                        <div>
                            {pinned.length > 0 && <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Recent</p>}
                            <div className="space-y-3">{regular.map(n => <NoticeCard key={n._id} notice={n} />)}</div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
