import React from 'react';
import { usePublishNoticeMutation, useArchiveNoticeMutation, useDeleteNoticeMutation } from '../../../../store/api/societyAdminApi';
import { CheckCircle2, Archive, Trash2 } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import StatusBadge from '../../../../components/ui/StatusBadge';
import { Button } from '../../../../components/ui/Button';
import NoticeAcknowledgementsModal from './NoticeAcknowledgementsModal';
import RescheduleNoticeModal from './RescheduleNoticeModal';
import { Clock } from 'lucide-react';

const STATUS_MAP = {
    DRAFT: 'NEUTRAL',
    PUBLISHED: 'SUCCESS',
    ARCHIVED: 'NEUTRAL',
    SCHEDULED: 'INFO',
};

const TYPE_STYLES = {
    GENERAL: 'bg-slate-100 text-slate-600', MAINTENANCE: 'bg-amber-100 text-amber-700',
    FINANCIAL: 'bg-emerald-100 text-emerald-700', EMERGENCY: 'bg-red-100 text-red-700',
    EVENT: 'bg-purple-100 text-purple-700', LEGAL: 'bg-blue-100 text-blue-700',
    PARKING: 'bg-indigo-100 text-indigo-700', MEETING: 'bg-cyan-100 text-cyan-700',
};

export default function NoticeAdminCard({ notice }) {
    const [publishNotice, { isLoading: publishing }] = usePublishNoticeMutation();
    const [archiveNotice, { isLoading: archiving }] = useArchiveNoticeMutation();
    const [deleteNotice, { isLoading: deleting }] = useDeleteNoticeMutation();
    const [showAcksModal, setShowAcksModal] = React.useState(false);
    const [showRescheduleModal, setShowRescheduleModal] = React.useState(false);
    
    const statusType = STATUS_MAP[notice.status] || 'NEUTRAL';
    const t = TYPE_STYLES[notice.noticeType] ?? TYPE_STYLES.GENERAL;

    return (
        <Card>
            <Card.Body>
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                        <p className="text-base font-bold text-slate-800 truncate">{notice.title}</p>
                        <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">{new Date(notice.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <StatusBadge status={notice.status} type={statusType} />
                </div>
                <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">{notice.content}</p>
                <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-slate-100/60 mt-3">
                    <span className={`text-xs font-bold rounded-md px-2.5 py-1 ${t}`}>{notice.noticeType}</span>
                    {notice.requiresAcknowledgement && (
                        <Button 
                            onClick={() => setShowAcksModal(true)}
                            className="bg-indigo-50/80 hover:bg-indigo-100/80 text-indigo-700 text-xs font-bold py-1.5 px-3 border border-indigo-200/50"
                        >
                            View Acknowledgements <span className="ml-1 bg-indigo-200 text-indigo-800 px-1.5 rounded-sm">{notice.acknowledgedCount || 0}/{notice.sentToCount || 0}</span>
                        </Button>
                    )}
                    <div className="ml-auto flex gap-2">
                        {notice.status === 'DRAFT' && (
                            <Button 
                                onClick={() => publishNotice(notice._id)} 
                                disabled={publishing}
                                isLoading={publishing}
                                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs py-1.5 px-4 font-bold border border-emerald-200"
                            >
                                {!publishing && <CheckCircle2 className="h-4 w-4 mr-1.5" />} Publish
                            </Button>
                        )}
                        {(notice.status === 'SCHEDULED' || notice.status === 'DRAFT') && (
                            <Button 
                                onClick={() => setShowRescheduleModal(true)} 
                                className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs py-1.5 px-4 font-bold border border-blue-200"
                            >
                                <Clock className="h-4 w-4 mr-1.5" /> Reschedule
                            </Button>
                        )}
                        {notice.status !== 'ARCHIVED' && (
                            <Button 
                                onClick={() => archiveNotice(notice._id)} 
                                disabled={archiving}
                                isLoading={archiving}
                                className="bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs py-1.5 px-4 font-bold border border-slate-200"
                            >
                                {!archiving && <Archive className="h-4 w-4 mr-1.5" />} Archive
                            </Button>
                        )}
                        <Button 
                            onClick={() => {
                                if (window.confirm('Are you sure you want to delete this notice?')) {
                                    deleteNotice(notice._id);
                                }
                            }} 
                            disabled={deleting}
                            isLoading={deleting}
                            className="bg-red-50 hover:bg-red-100 text-red-700 text-xs py-1.5 px-4 font-bold border border-red-200"
                            >
                                {!deleting && <Trash2 className="h-4 w-4 mr-1.5" />} Delete
                        </Button>
                    </div>
                </div>
            </Card.Body>

            {showAcksModal && (
                <NoticeAcknowledgementsModal 
                    notice={notice} 
                    onClose={() => setShowAcksModal(false)} 
                />
            )}
            
            {showRescheduleModal && (
                <RescheduleNoticeModal
                    notice={notice}
                    onClose={() => setShowRescheduleModal(false)}
                />
            )}
        </Card>
    );
}
