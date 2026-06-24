import React, { useState } from 'react';
import { useStaffPublishNoticeMutation } from '../../../../store/api/staffApi';
import { CheckCircle2, ChevronDown, ChevronUp, Pin } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import StatusBadge from '../../../../components/ui/StatusBadge';
import Card from '../../../../components/ui/Card';

export default function NoticeCard({ notice, canPublish }) {
    const [publishNotice, { isLoading }] = useStaffPublishNoticeMutation();
    const [expanded, setExpanded] = useState(false);

    return (
        <Card className={notice.isPinned ? 'border-indigo-200 bg-indigo-50/30' : ''}>
            <Card.Body>
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0 flex items-start gap-2">
                        {notice.isPinned && <Pin className="h-4 w-4 text-indigo-500 shrink-0 mt-1" />}
                        <div>
                            <p className="font-bold text-slate-900">{notice.title}</p>
                            <p className="text-xs font-medium text-slate-400 mt-0.5">{new Date(notice.publishedAt ?? notice.createdAt).toLocaleDateString('en-IN')}</p>
                        </div>
                    </div>
                    <StatusBadge status={notice.status} />
                </div>
                
                <div className="flex gap-2 mb-3">
                    <StatusBadge status={notice.noticeType} />
                    <StatusBadge status={notice.priority} />
                </div>
                
                <p className={`text-sm text-slate-600 leading-relaxed ${!expanded ? 'line-clamp-2' : ''}`}>{notice.content}</p>
                
                <div className="flex items-center justify-between mt-4">
                    {notice.content?.length > 100 && (
                        <button onClick={() => setExpanded(!expanded)} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                            {expanded ? <><ChevronUp className="h-3.5 w-3.5" /> Less</> : <><ChevronDown className="h-3.5 w-3.5" /> More</>}
                        </button>
                    )}
                    {canPublish && notice.status === 'DRAFT' && (
                        <Button 
                            variant="secondary"
                            onClick={() => publishNotice(notice._id)} 
                            disabled={isLoading}
                            isLoading={isLoading}
                            className="ml-auto text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
                        >
                            <CheckCircle2 className="h-4 w-4 mr-1.5" /> Publish
                        </Button>
                    )}
                </div>
            </Card.Body>
        </Card>
    );
}
