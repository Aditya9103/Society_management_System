import React from 'react';
import { usePublishNoticeMutation, useArchiveNoticeMutation, useDeleteNoticeMutation } from '../../../../store/api/societyAdminApi';
import { CheckCircle2, Archive, Trash2 } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import StatusBadge from '../../../../components/ui/StatusBadge';
import { Button } from '../../../../components/ui/Button';
import NoticeAcknowledgementsModal from './NoticeAcknowledgementsModal';

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
    
    const statusType = STATUS_MAP[notice.status] || 'NEUTRAL';
    const t = TYPE_STYLES[notice.noticeType] ?? TYPE_STYLES.GENERAL;

    return (
        <Card>
            <Card.Body>
                <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900">{notice.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{new Date(notice.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                    <StatusBadge status={notice.status} type={statusType} />
                </div>
                <p className="text-sm text-slate-500 line-clamp-2 mb-3">{notice.content}</p>
                <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-medium rounded-full px-2.5 py-0.5 ${t}`}>{notice.noticeType}</span>
                    {notice.requiresAcknowledgement && (
                        <Button 
                            onClick={() => setShowAcksModal(true)}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs py-1.5 px-3"
                        >
                            View Acknowledgements ({notice.acknowledgedCount || 0}/{notice.sentToCount || 0})
                        </Button>
                    )}
                    <div className="ml-auto flex gap-2">
                        {notice.status === 'DRAFT' && (
                            <Button 
                                onClick={() => publishNotice(notice._id)} 
                                disabled={publishing}
                                isLoading={publishing}
                                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs py-1.5 px-3"
                            >
                                {!publishing && <CheckCircle2 className="h-3.5 w-3.5 mr-1" />} Publish
                            </Button>
                        )}
                        {notice.status !== 'ARCHIVED' && (
                            <Button 
                                onClick={() => archiveNotice(notice._id)} 
                                disabled={archiving}
                                isLoading={archiving}
                                className="bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs py-1.5 px-3"
                            >
                                {!archiving && <Archive className="h-3.5 w-3.5 mr-1" />} Archive
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
                            className="bg-red-50 hover:bg-red-100 text-red-600 text-xs py-1.5 px-3"
                        >
                            {!deleting && <Trash2 className="h-3.5 w-3.5 mr-1" />} Delete
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
        </Card>
    );
}
