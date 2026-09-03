import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useGetNoticeByIdQuery, useIncrementShareMutation, useIncrementDownloadMutation, useIncrementViewMutation } from '../../../store/api/residentApi';
import { ArrowLeft, Megaphone, Calendar, Users, Eye, CheckCircle2, Share2, Download, FileText, Clock, AlertTriangle, AlertCircle } from 'lucide-react';
import Alert from '../../../components/ui/Alert';

const CATEGORY_COLORS = {
    GENERAL: { text: 'text-blue-400', border: 'border-blue-400/30', bg: 'bg-blue-500/10' },
    MAINTENANCE: { text: 'text-orange-400', border: 'border-orange-400/30', bg: 'bg-orange-500/10' },
    FINANCIAL: { text: 'text-emerald-400', border: 'border-emerald-400/30', bg: 'bg-emerald-500/10' },
    EMERGENCY: { text: 'text-red-400', border: 'border-red-400/30', bg: 'bg-red-500/10' },
    EVENT: { text: 'text-purple-400', border: 'border-purple-400/30', bg: 'bg-purple-500/10' },
};

export default function ResidentNoticeDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data, isLoading, isError } = useGetNoticeByIdQuery(id);
    const [incrementShare] = useIncrementShareMutation();
    const [incrementDownload] = useIncrementDownloadMutation();
    const [incrementView] = useIncrementViewMutation();

    useEffect(() => {
        if (id) {
            incrementView(id).catch(err => console.error('Failed to increment view', err));
        }
    }, [id, incrementView]);

    if (isLoading) return <div className="flex items-center justify-center h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div></div>;
    if (isError || !data?.data?.notice) return <Alert type="error">Failed to load notice details.</Alert>;

    const notice = data.data.notice;
    const author = notice.createdBy || {};
    const catConfig = CATEGORY_COLORS[notice.noticeType] || CATEGORY_COLORS.GENERAL;
    const formattedDate = (date) => date ? new Date(date).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : '—';

    const handleShare = async () => {
        try {
            await incrementShare(id);
            if (navigator.share) {
                navigator.share({
                    title: notice.title,
                    text: `Check out this notice: ${notice.title}`,
                    url: window.location.href,
                });
            }
        } catch (err) {
            console.error('Failed to share', err);
        }
    };

    const handleDownload = async (url) => {
        try {
            await incrementDownload(id);
            window.open(url, '_blank');
        } catch (err) {
            console.error('Failed to download', err);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-10 px-4 sm:px-0">
            {/* Header / Nav */}
            <div className="flex items-center justify-between">
                <Link to="/resident/notices" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-[14px] font-bold">
                    <ArrowLeft className="w-4 h-4" /> Back to Notices
                </Link>
                <div className="flex items-center gap-3">
                    <button onClick={handleShare} className="w-10 h-10 rounded-full bg-slate-800/50 hover:bg-slate-700 border border-slate-700/50 text-slate-300 hover:text-white transition-colors flex items-center justify-center">
                        <Share2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Hero / Details */}
            <div className="bg-[#0f111a] border-y sm:border-x border-slate-800/80 rounded-none sm:rounded-[24px] overflow-hidden -mx-4 sm:mx-0">
                {/* Notice Banner */}
                <div className="h-32 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 relative overflow-hidden flex items-center px-8">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                    <div className="relative z-10 flex items-center gap-4 w-full">
                        <div className={`w-16 h-16 rounded-2xl ${catConfig.bg} border ${catConfig.border} flex items-center justify-center shrink-0 backdrop-blur-md`}>
                            <Megaphone className={`w-8 h-8 ${catConfig.text}`} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit border ${catConfig.border} ${catConfig.text} bg-black/20 backdrop-blur-md`}>
                                {notice.noticeType}
                            </span>
                            {notice.priority === 'URGENT' && (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit border border-red-500/50 text-red-400 bg-red-500/10 backdrop-blur-md">
                                    Urgent Priority
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-tight">{notice.title}</h1>
                    
                    <div className="flex flex-wrap items-center gap-4 text-[13px] font-bold mb-8 pb-8 border-b border-slate-800">
                        <div className="flex items-center gap-2 text-slate-400">
                            <Calendar className="w-4 h-4" />
                            {formattedDate(notice.publishedAt || notice.createdAt)}
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                        <div className="flex items-center gap-2 text-slate-400">
                            <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-800 shrink-0">
                                {author.profilePhotoUrl ? <img src={author.profilePhotoUrl} alt="Author" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] text-white">{(author.firstName?.[0] || '?')}</div>}
                            </div>
                            Posted by {author.firstName} {author.lastName}
                        </div>
                    </div>

                    <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-p:text-slate-300 prose-headings:text-white prose-a:text-purple-400 hover:prose-a:text-purple-300 prose-strong:text-white prose-ul:text-slate-300 prose-ol:text-slate-300">
                        <div dangerouslySetInnerHTML={{ __html: notice.content }} />
                    </div>

                    {notice.attachmentUrls && notice.attachmentUrls.length > 0 && (
                        <div className="mt-10 pt-8 border-t border-slate-800">
                            <h3 className="text-[14px] font-bold text-white mb-4 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-purple-400" />
                                Attachments
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {notice.attachmentUrls.map((url, idx) => (
                                    <button onClick={() => handleDownload(url)} key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/80 hover:border-purple-500/50 transition-all group">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/20"><FileText className="w-5 h-5 text-red-400" /></div>
                                            <span className="text-[13px] font-bold text-slate-300 group-hover:text-white truncate">Document_{idx+1}.pdf</span>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center group-hover:bg-purple-500/20 group-hover:text-purple-400 transition-colors">
                                            <Download className="w-4 h-4 text-slate-400 group-hover:text-purple-400" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
