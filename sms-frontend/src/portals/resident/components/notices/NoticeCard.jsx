import { useState } from 'react';
import { ChevronDown, ChevronUp, Pin, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import StatusBadge from '../../../../components/ui/StatusBadge';
import { useAcknowledgeNoticeMutation } from '../../../../store/api/residentApi';

export function NoticeCard({ notice }) {
    const [expanded, setExpanded] = useState(false);
    const [acknowledgeNotice, { isLoading }] = useAcknowledgeNoticeMutation();

    const handleAcknowledge = async () => {
        try {
            await acknowledgeNotice(notice._id).unwrap();
            toast.success('Notice acknowledged successfully');
        } catch (error) {
            if (error?.data?.message === 'Already acknowledged') {
                toast.success('Already acknowledged');
            } else {
                toast.error(error?.data?.message || 'Failed to acknowledge notice');
            }
        }
    };

    // A notice is considered acknowledged if 'hasAcknowledged' is true from the backend, 
    // or if the resident successfully clicks the button.
    const isAck = notice.hasAcknowledged;

    return (
        <div className={`rounded-2xl bg-white shadow-sm ring-1 transition hover:shadow-md ${notice.isPinned ? 'ring-indigo-300' : 'ring-slate-100'}`}>
            <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
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
                </div>
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <StatusBadge status={notice.noticeType} />
                    <StatusBadge status={notice.priority} />
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

            {/* Acknowledge Footer */}
            {notice.requiresAcknowledgement && (
                <div className="border-t border-slate-100 px-5 py-3 bg-slate-50 rounded-b-2xl flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                        This notice requires your acknowledgement.
                    </span>
                    {isAck ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                            <CheckCircle2 className="h-4 w-4" />
                            Acknowledged
                        </span>
                    ) : (
                        <button
                            onClick={handleAcknowledge}
                            disabled={isLoading}
                            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                        >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {isLoading ? 'Processing...' : 'Acknowledge'}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
