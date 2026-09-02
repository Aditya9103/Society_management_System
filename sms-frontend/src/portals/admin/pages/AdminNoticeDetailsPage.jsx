import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGetNoticeByIdQuery, useIncrementViewMutation } from '../../../store/api/societyAdminApi';
import { ArrowLeft, Megaphone, Calendar, Users, Eye, EyeOff, FileText, Send, Share2, Download, Clock, Edit2 } from 'lucide-react';
import PageHeader from '../../../components/ui/PageHeader';
import Alert from '../../../components/ui/Alert';
import CreateNoticeModal from '../components/notices/CreateNoticeModal';

const STATUS_CONFIG = {
    PUBLISHED: { text: 'Published', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
    SCHEDULED: { text: 'Scheduled', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
    DRAFT: { text: 'Draft', color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30' },
    ARCHIVED: { text: 'Archived', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
};

const PRIORITY_CONFIG = {
    URGENT: { text: 'URGENT', color: 'text-red-500', dot: 'bg-red-500' },
    HIGH: { text: 'HIGH', color: 'text-orange-500', dot: 'bg-orange-500' },
    NORMAL: { text: 'MEDIUM', color: 'text-blue-500', dot: 'bg-blue-500' },
    LOW: { text: 'LOW', color: 'text-gray-400', dot: 'bg-gray-400' },
};

const CATEGORY_COLORS = {
    GENERAL: { text: 'text-blue-400', border: 'border-blue-400/30' },
    MAINTENANCE: { text: 'text-orange-400', border: 'border-orange-400/30' },
    FINANCIAL: { text: 'text-emerald-400', border: 'border-emerald-400/30' },
    EMERGENCY: { text: 'text-red-400', border: 'border-red-400/30' },
    EVENT: { text: 'text-purple-400', border: 'border-purple-400/30' },
};

export default function AdminNoticeDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    const { data, isLoading, isError, refetch } = useGetNoticeByIdQuery(id, { refetchOnMountOrArgChange: true });

    if (isLoading) return <div className="flex items-center justify-center h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6338f0]"></div></div>;
    if (isError || !data?.data?.notice) return <Alert type="error">Failed to load notice details.</Alert>;

    const notice = data.data.notice;
    const author = notice.createdBy || {};
    const sConfig = STATUS_CONFIG[notice.status] || STATUS_CONFIG.DRAFT;
    const pConfig = PRIORITY_CONFIG[notice.priority] || PRIORITY_CONFIG.NORMAL;
    const catConfig = CATEGORY_COLORS[notice.noticeType] || CATEGORY_COLORS.GENERAL;

    const formattedDate = (date) => date ? new Date(date).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : '—';
    const shortDate = (date) => date ? new Date(date).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
    const timeOnly = (date) => date ? new Date(date).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—';

    const getTimeline = () => {
        const events = [];
        events.push({ title: 'Notice Created', date: notice.createdAt, author: `${author.firstName} ${author.lastName}`, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/20' });
        if (notice.status === 'PUBLISHED' && notice.publishedAt) {
            events.push({ title: 'Published', date: notice.publishedAt, author: `${author.firstName} ${author.lastName}`, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/20' });
        }
        if (notice.status === 'SCHEDULED' && notice.scheduledAt) {
            events.push({ title: 'Scheduled to Publish', date: notice.scheduledAt, author: `${author.firstName} ${author.lastName}`, icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/20' });
        }
        if (notice.acknowledgedCount > 0) {
            events.push({ title: 'Viewed by Residents', date: new Date(), subtitle: `${notice.acknowledgedCount} / ${notice.sentToCount || 0} residents`, icon: Eye, color: 'text-indigo-400', bg: 'bg-indigo-500/20' });
        }
        if (notice.expiresAt) {
            events.push({ title: 'Scheduled End', date: notice.expiresAt, author: 'System', icon: Clock, color: 'text-gray-400', bg: 'bg-gray-500/20' });
        }
        return events;
    };

    const CheckCircle = ({ className }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Link to="/admin/notices" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-[14px] font-bold">
                    <ArrowLeft className="w-4 h-4" /> Back to Notices
                </Link>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-[13px] font-bold hover:bg-white/10 transition-colors flex items-center gap-2">
                        <Share2 className="w-4 h-4" /> Share
                    </button>
                    <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-[13px] font-bold hover:bg-white/10 transition-colors flex items-center gap-2">
                        <Download className="w-4 h-4" /> Download
                    </button>
                    <button onClick={() => setIsEditModalOpen(true)} className="px-5 py-2 rounded-xl bg-[#6338f0] border border-[#6338f0]/50 text-white text-[13px] font-bold shadow-[0_0_15px_rgba(99,56,240,0.3)] hover:bg-[#5b32e6] transition-colors flex items-center gap-2">
                        <Edit2 className="w-4 h-4" /> Edit Notice
                    </button>
                </div>
            </div>

            {/* Hero Card */}
            <div className="bg-[#151722] border border-white/5 rounded-3xl p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between min-h-[220px]">
                <div className="absolute top-0 right-0 w-[500px] h-full bg-gradient-to-l from-indigo-900/20 to-transparent pointer-events-none" />
                
                <div className="relative z-10 flex flex-col items-start gap-4 flex-1">
                    <div className="flex items-center gap-3">
                        <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${sConfig.bg} ${sConfig.color}`}>{sConfig.text}</div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30">
                            <Send className="w-5 h-5 text-indigo-400 transform -rotate-45 -ml-1 mt-1" />
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">{notice.title}</h1>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-[13px] font-bold mt-2">
                        <span className="flex items-center gap-2 text-gray-400"><Calendar className="w-4 h-4" /> {formattedDate(notice.publishedAt || notice.createdAt)}</span>
                        <div className="flex items-center gap-2 text-gray-400">
                            <div className="w-5 h-5 rounded-full overflow-hidden bg-white/10 shrink-0">
                                {author.profilePhotoUrl ? <img src={author.profilePhotoUrl} alt="Author" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] text-white">{(author.firstName?.[0] || '?')}</div>}
                            </div>
                            by {author.firstName} {author.lastName}
                        </div>
                        <div className="h-4 w-px bg-white/10" />
                        <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider border ${catConfig.border} ${catConfig.text}`}>{notice.noticeType}</span>
                        <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider border border-white/10 flex items-center gap-1.5 ${pConfig.color}`}><div className={`w-1.5 h-1.5 rounded-full ${pConfig.dot}`} /> {pConfig.text}</span>
                        <span className="px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider border border-white/10 text-gray-500">ID: {notice._id.substring(0, 8).toUpperCase()}</span>
                    </div>
                </div>

                {/* Hero Illustration */}
                <div className="hidden md:flex items-center justify-center relative z-10 w-64 shrink-0">
                    <Megaphone className="w-32 h-32 text-indigo-500/50 drop-shadow-2xl" />
                </div>
            </div>

            {/* Info Bar */}
            <div className="bg-[#151722] border border-white/5 rounded-2xl p-4 flex flex-wrap gap-4 divide-x divide-white/5 shadow-sm">
                <div className="flex items-center gap-4 px-6 flex-1 min-w-[200px]">
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0"><Users className="w-5 h-5 text-purple-400" /></div>
                    <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-gray-500">Audience</span>
                        <span className="text-[14px] font-bold text-white">{notice.targetAudience?.type === 'ALL' ? 'All Residents' : notice.targetAudience?.type}</span>
                        <span className="text-[11px] font-bold text-purple-400">{notice.sentToCount || 0} Recipients</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 px-6 flex-1 min-w-[200px]">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0"><CheckCircle className="w-5 h-5 text-emerald-400" /></div>
                    <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-gray-500">Status</span>
                        <span className="text-[14px] font-bold text-white">{sConfig.text}</span>
                        <span className="text-[11px] font-bold text-gray-500">Visible to all residents</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 px-6 flex-1 min-w-[200px]">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0"><Eye className="w-5 h-5 text-blue-400" /></div>
                    <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-gray-500">Visibility</span>
                        <span className="text-[14px] font-bold text-white">Public</span>
                        <span className="text-[11px] font-bold text-gray-500">Visible to all residents</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 px-6 flex-1 min-w-[200px]">
                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0"><Calendar className="w-5 h-5 text-red-400" /></div>
                    <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-gray-500">Scheduled For</span>
                        <span className="text-[14px] font-bold text-white">{notice.scheduledAt ? shortDate(notice.scheduledAt) + ', ' + timeOnly(notice.scheduledAt) : (notice.publishedAt ? shortDate(notice.publishedAt) + ', ' + timeOnly(notice.publishedAt) : '—')}</span>
                        <span className="text-[11px] font-bold text-gray-500">{notice.scheduledAt ? 'Scheduled to publish' : 'Published immediately'}</span>
                    </div>
                </div>
            </div>

            {/* Split Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column (Content) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#151722] border border-white/5 rounded-3xl p-8 shadow-sm h-full flex flex-col">
                        <h3 className="text-[16px] font-bold text-white mb-6">Notice Content</h3>
                        <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-p:text-slate-300 prose-headings:text-white prose-a:text-purple-400 hover:prose-a:text-purple-300 prose-strong:text-white prose-ul:text-slate-300 prose-ol:text-slate-300">
                            {/* Notice Content Render */}
                            <div className="text-[14px] leading-relaxed" dangerouslySetInnerHTML={{ __html: notice.content }} />
                        </div>
                        
                        {notice.attachmentUrls && notice.attachmentUrls.length > 0 && (
                            <div className="mt-8 pt-8 border-t border-white/5">
                                <h4 className="text-[13px] font-bold text-white mb-4">Attachments ({notice.attachmentUrls.length})</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {notice.attachmentUrls.map((url, idx) => (
                                        <a key={idx} href={url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0"><FileText className="w-4 h-4 text-red-400" /></div>
                                                <span className="text-[13px] font-bold text-gray-300 group-hover:text-white truncate">Attachment_{idx+1}</span>
                                            </div>
                                            <Download className="w-4 h-4 text-gray-500 group-hover:text-white shrink-0" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        <div className="mt-auto pt-8">
                            <div className="p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center"><Megaphone className="w-5 h-5 text-indigo-400" /></div>
                                    <div>
                                        <h4 className="text-[14px] font-bold text-white">Need to make changes?</h4>
                                        <p className="text-[12px] text-gray-500 font-medium mt-0.5">You can edit this notice or create a new one if major changes are required.</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsEditModalOpen(true)} className="px-5 py-2.5 rounded-xl border border-white/10 text-white text-[13px] font-bold hover:bg-white/5 transition-colors">Edit Notice</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column (Timeline & Stats) */}
                <div className="space-y-6">
                    {/* Timeline */}
                    <div className="bg-[#151722] border border-white/5 rounded-3xl p-8 shadow-sm">
                        <h3 className="text-[16px] font-bold text-white mb-6">Notice Timeline</h3>
                        <div className="relative border-l-2 border-white/5 ml-3 space-y-8 pb-4">
                            {getTimeline().map((event, idx) => {
                                const Icon = event.icon;
                                return (
                                    <div key={idx} className="relative pl-6">
                                        <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full ${event.bg} border-[3px] border-[#151722] flex items-center justify-center shadow-lg`}>
                                            <Icon className={`w-3.5 h-3.5 ${event.color}`} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[14px] font-bold text-white">{event.title}</span>
                                            <span className="text-[12px] font-bold text-gray-500 mt-1">{shortDate(event.date)}, {timeOnly(event.date)}</span>
                                            {event.subtitle && <span className="text-[12px] font-bold text-gray-400 mt-0.5">{event.subtitle}</span>}
                                        </div>
                                        {event.author && (
                                            <div className="absolute right-0 top-1 text-[11px] font-bold text-gray-600">
                                                by {event.author}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="bg-[#151722] border border-white/5 rounded-3xl p-8 shadow-sm">
                        <h3 className="text-[16px] font-bold text-white mb-6">Notice Statistics</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-2">
                                    <Send className="w-4 h-4 text-blue-400" />
                                </div>
                                <span className="text-xl font-bold text-white">{notice.acknowledgedCount || 0}</span>
                                <span className="text-[10px] font-bold text-gray-500 uppercase mt-1">Acknowledgements</span>
                            </div>
                            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2">
                                    <Eye className="w-4 h-4 text-emerald-400" />
                                </div>
                                <span className="text-xl font-bold text-white">{notice.viewsCount || 0}</span>
                                <span className="text-[10px] font-bold text-gray-500 uppercase mt-1">Views</span>
                            </div>
                            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center mb-2">
                                    <Share2 className="w-4 h-4 text-indigo-400" />
                                </div>
                                <span className="text-xl font-bold text-white">{notice.sharesCount || 0}</span>
                                <span className="text-[10px] font-bold text-gray-500 uppercase mt-1">Shares</span>
                            </div>
                            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center mb-2">
                                    <Download className="w-4 h-4 text-orange-400" />
                                </div>
                                <span className="text-xl font-bold text-white">{notice.downloadsCount || 0}</span>
                                <span className="text-[10px] font-bold text-gray-500 uppercase mt-1">Downloads</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {isEditModalOpen && (
                <CreateNoticeModal 
                    onClose={() => {
                        setIsEditModalOpen(false);
                        refetch();
                    }} 
                    initialData={notice} 
                />
            )}
        </div>
    );
}
