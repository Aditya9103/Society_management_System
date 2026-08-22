import { useState } from 'react';
import { ChevronDown, ChevronUp, Pin, CheckCircle2, ArrowRight, Droplet, Calendar, Wrench, Activity, Bell, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAcknowledgeNoticeMutation } from '../../../../store/api/residentApi';

// Helper to determine styling and imagery based on notice type/priority
const getTheme = (notice) => {
    const type = notice.noticeType;
    const priority = notice.priority;

    if (priority === 'URGENT' || type === 'EMERGENCY') {
        return {
            color: 'red',
            bgGradient: 'from-red-950/40 to-[#0f111a]',
            border: 'border-red-500/30',
            glow: 'shadow-[0_0_30px_rgba(239,68,68,0.1)]',
            icon: Droplet,
            iconBg: 'bg-red-500/10',
            iconColor: 'text-red-500',
            image: 'https://images.unsplash.com/photo-1614064641913-6b7596dc5b12?w=400&q=80' // Red abstract alert
        };
    } else if (type === 'EVENT' || type === 'MEETING') {
        return {
            color: 'purple',
            bgGradient: 'from-purple-950/40 to-[#0f111a]',
            border: 'border-purple-500/30',
            glow: 'shadow-[0_0_30px_rgba(168,85,247,0.1)]',
            icon: Calendar,
            iconBg: 'bg-purple-500/10',
            iconColor: 'text-purple-500',
            image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&q=80' // Event hall
        };
    } else if (type === 'MAINTENANCE') {
        return {
            color: 'orange',
            bgGradient: 'from-orange-950/40 to-[#0f111a]',
            border: 'border-orange-500/30',
            glow: 'shadow-[0_0_30px_rgba(249,115,22,0.1)]',
            icon: Wrench,
            iconBg: 'bg-orange-500/10',
            iconColor: 'text-orange-500',
            image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=400&q=80' // Elevator/Maintenance
        };
    } else {
        return {
            color: 'blue',
            bgGradient: 'from-blue-950/40 to-[#0f111a]',
            border: 'border-blue-500/30',
            glow: 'shadow-[0_0_30px_rgba(59,130,246,0.1)]',
            icon: Bell,
            iconBg: 'bg-blue-500/10',
            iconColor: 'text-blue-500',
            image: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=400&q=80' // General blue abstract
        };
    }
};

export function NoticeCard({ notice }) {
    const [expanded, setExpanded] = useState(false);
    const [acknowledgeNotice, { isLoading }] = useAcknowledgeNoticeMutation();
    const theme = getTheme(notice);
    const isAck = notice.hasAcknowledged;

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

    return (
        <div className={`relative overflow-hidden rounded-[16px] md:rounded-[24px] bg-gradient-to-r ${theme.bgGradient} border ${theme.border} ${theme.glow} p-3 sm:p-4 md:p-5 lg:p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col`}>
            {/* Absolute positioning for the background image spanning the entire card */}
            <div className="absolute inset-0 z-0 overflow-hidden opacity-[0.15]">
                {/* Gradient overlay to ensure text readability */}
                <div className="absolute inset-0 bg-[#0f111a]/40 z-10 mix-blend-overlay"></div>
                <img src={theme.image} alt="Notice visual" className="w-full h-full object-cover mix-blend-screen" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-3 md:gap-6 flex-1">
                
                <div className="flex-1 w-full">
                    <div className="flex items-start md:items-center gap-2.5 md:gap-3 mb-2 md:mb-4">
                        <div className={`h-8 w-8 md:h-12 md:w-12 rounded-full ${theme.iconBg} flex items-center justify-center border ${theme.border} shrink-0 mt-1 md:mt-0`}>
                            <theme.icon className={`h-4 w-4 md:h-5 md:w-5 ${theme.iconColor}`} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                {notice.priority === 'URGENT' && (
                                    <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold tracking-widest uppercase border border-red-500/30">
                                        Urgent
                                    </span>
                                )}
                                {notice.priority === 'HIGH' && notice.noticeType !== 'EMERGENCY' && (
                                    <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-bold tracking-widest uppercase border border-orange-500/30">
                                        High Priority
                                    </span>
                                )}
                                {notice.isPinned && (
                                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-bold tracking-widest uppercase border border-indigo-500/30 flex items-center gap-1">
                                        <Pin className="h-3 w-3" /> Pinned
                                    </span>
                                )}
                                <span className={`px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 text-[10px] font-bold tracking-widest uppercase border border-slate-700`}>
                                    {notice.noticeType || 'GENERAL'}
                                </span>
                            </div>
                            <h2 className="text-[14px] md:text-[20px] font-bold text-white leading-tight mt-1">{notice.title}</h2>
                            <p className="text-[10px] md:text-xs text-slate-400 mt-1">{notice.noticeType === 'EVENT' ? 'Event Details' : notice.noticeType === 'MAINTENANCE' ? 'Maintenance Update' : 'General Announcement'}</p>
                        </div>
                    </div>

                    <p className={`text-[11px] md:text-[13px] text-slate-300 leading-relaxed max-w-2xl mb-3 ${!expanded ? 'line-clamp-2 md:line-clamp-3' : ''}`}>
                        {notice.content}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] md:text-xs font-semibold text-slate-400">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-3 w-3 md:h-3.5 md:w-3.5" />
                            {notice.publishedAt ? new Date(notice.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently'}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3 md:h-3.5 md:w-3.5" />
                            {notice.publishedAt ? new Date(notice.publishedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </div>
                    </div>
                </div>

                {/* Right Actions Area */}
                <div className="shrink-0 flex flex-col justify-end items-stretch md:items-end w-full md:w-auto mt-2 md:mt-0">
                    
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full justify-between mt-3 md:mt-auto">
                        {notice.requiresAcknowledgement && !isAck && (
                            <button
                                onClick={handleAcknowledge}
                                disabled={isLoading}
                                className="flex items-center justify-center gap-2 rounded-[12px] bg-emerald-500/20 px-4 py-2.5 md:py-2 text-[11px] md:text-xs font-bold text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors w-full sm:w-auto"
                            >
                                <CheckCircle2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                {isLoading ? 'Verifying...' : 'Acknowledge'}
                            </button>
                        )}
                        {notice.requiresAcknowledgement && isAck && (
                            <span className="flex items-center justify-center sm:justify-start gap-1.5 text-[11px] md:text-xs font-bold text-emerald-500 w-full sm:w-auto py-1">
                                <CheckCircle2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                Acknowledged
                            </span>
                        )}
                        
                        <button 
                            onClick={() => setExpanded(!expanded)}
                            className={`flex items-center justify-center gap-2 rounded-[12px] bg-[#1a1c29]/80 px-4 md:px-5 py-2.5 text-[11px] md:text-[13px] font-bold text-white border border-slate-700/50 hover:bg-slate-800 transition-colors w-full sm:w-auto shadow-lg backdrop-blur-md ${(!notice.requiresAcknowledgement || isAck) ? 'sm:ml-auto' : ''}`}
                        >
                            {expanded ? 'Show Less' : 'Read More'} {expanded ? <ChevronUp className="h-3.5 w-3.5 md:h-4 md:w-4 text-slate-400" /> : <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4 text-slate-400" />}
                        </button>
                    </div>
                </div>
                
            </div>
            
        </div>
    );
}
