import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
    ArrowLeft, HelpCircle, 
    Zap, Droplets, Shield, MessageSquare, Settings, Car, Wrench, Volume2, Send
} from 'lucide-react';
import { 
    useGetComplaintByIdQuery, 
    useChangeComplaintStatusMutation 
} from '../../../store/api/residentApi';
import Alert from '../../../components/ui/Alert';

const CATEGORY_ICONS = {
    ELECTRICAL: Zap,
    PLUMBING: Droplets,
    SECURITY: Shield,
    HOUSEKEEPING: MessageSquare,
    LIFT_ELEVATOR: Settings,
    PARKING: Car,
    STRUCTURAL: Wrench,
    NOISE_NUISANCE: Volume2,
    OTHER: HelpCircle,
};

const STATUS_CONFIG = {
    DRAFT: { color: 'text-gray-400', bg: 'bg-gray-400/10', border: 'border-gray-500' },
    OPEN: { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500' },
    ASSIGNED: { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500' },
    IN_PROGRESS: { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500' },
    PENDING_RESIDENT: { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500' },
    RESOLVED: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500' },
    CLOSED: { color: 'text-gray-500', bg: 'bg-gray-500/10', border: 'border-gray-500' },
    ESCALATED: { color: 'text-rose-600', bg: 'bg-rose-600/10', border: 'border-rose-600' },
};

export default function ResidentComplaintDetailsPage() {
    const { id } = useParams();

    const { data, isLoading, isError, refetch } = useGetComplaintByIdQuery(id);
    const [changeStatus, { isLoading: isUpdating }] = useChangeComplaintStatusMutation();

    const [statusNote, setStatusNote] = useState('');

    const complaint = data?.data?.complaint || data?.complaint;
    const timeline = complaint?.timeline || [];

    if (isLoading) {
        return <div className="flex items-center justify-center h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6338f0]"></div></div>;
    }

    if (isError || !complaint) {
        return (
            <div className="pt-10">
                <Alert type="error" className="bg-red-500/10 border-red-500/30 text-red-400">
                    Failed to load complaint details. <button onClick={refetch} className="underline ml-1 font-bold">Retry</button>
                </Alert>
            </div>
        );
    }

    const Icon = CATEGORY_ICONS[complaint.category] || HelpCircle;
    const statusConfig = STATUS_CONFIG[complaint.status] || STATUS_CONFIG.OPEN;
    const unit = complaint.raisedBy?.unitId?.unitNumber || 'N/A';
    const assignedTo = complaint.assignedTo;

    const handleSendMessage = async () => {
        if (!statusNote.trim()) return;
        try {
            // Residents don't change the status when sending a message, just pass the current status
            const payload = { id: complaint._id, status: complaint.status, notes: statusNote };
            await changeStatus(payload).unwrap();
            setStatusNote(''); // Clear note on success
        } catch (err) {
            console.error('Failed to send message', err);
            alert('Failed to send message');
        }
    };

    return (
        <div className="space-y-6 font-sans pb-10">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-[12px] font-bold text-gray-400 mb-2">
                        <Link to="/resident/complaints" className="hover:text-white transition-colors flex items-center gap-1">
                            <ArrowLeft className="w-3 h-3" /> My Complaints
                        </Link>
                        <span>&gt;</span>
                        <span className="text-[#6338f0]">{complaint.complaintNumber}</span>
                    </div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-[28px] font-bold text-white tracking-tight leading-tight">
                            {complaint.title}
                        </h1>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md ${statusConfig.bg} ${statusConfig.color} border border-white/5 uppercase tracking-wider`}>
                            {complaint.status.replace('_', ' ')}
                        </span>
                    </div>
                    <p className="text-[13px] font-bold text-gray-400">
                        Complaint ID: {complaint.complaintNumber} &bull; Created on {new Date(complaint.createdAt).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column (Meta & Description) */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Meta Block */}
                    <div className="bg-[#151722] border border-white/5 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6 md:gap-10">
                        <div className="flex flex-col items-center gap-3 w-32 shrink-0">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]">
                                <Icon className="w-8 h-8 text-white opacity-80" />
                            </div>
                            <div className="text-center">
                                <span className="text-[11px] font-bold text-gray-500 block">Priority</span>
                                <div className="flex items-center justify-center gap-1.5 mt-1">
                                    <div className={`w-2 h-2 rounded-full ${complaint.priority === 'HIGH' || complaint.priority === 'URGENT' ? 'bg-red-500' : complaint.priority === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                                    <span className="text-[13px] font-bold text-white">{complaint.priority}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <span className="text-[11px] font-bold text-gray-500">Category</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <Icon className="w-4 h-4 text-gray-300" />
                                    <span className="text-[14px] font-bold text-white">{complaint.category === 'OTHER' ? complaint.customCategory || 'Other' : complaint.category}</span>
                                </div>
                            </div>
                            <div>
                                <span className="text-[11px] font-bold text-gray-500">Location</span>
                                <div className="mt-1 text-[14px] font-bold text-white">
                                    {complaint.isCommonArea ? complaint.commonAreaLocation || 'Common Area' : `Unit ${unit}`}
                                </div>
                            </div>
                            
                            <div>
                                <span className="text-[11px] font-bold text-gray-500">Assigned To</span>
                                <div className="flex items-center gap-2 mt-2">
                                    {assignedTo ? (
                                        <>
                                            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] text-blue-400 font-bold overflow-hidden shrink-0">
                                                {assignedTo.profilePhotoUrl ? (
                                                    <img src={assignedTo.profilePhotoUrl} alt="Avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    (assignedTo.firstName?.[0] || '?')
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-bold text-white">{assignedTo.firstName} {assignedTo.lastName}</span>
                                                <span className="text-[11px] font-bold text-gray-400">{assignedTo.role.replace('_', ' ')}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <span className="text-[13px] font-bold text-yellow-500">Unassigned</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-[#151722] border border-white/5 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-[16px] font-bold text-white mb-3">Description</h3>
                        <p className="text-[14px] font-bold text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {complaint.description}
                        </p>
                        
                        {complaint.images && complaint.images.length > 0 && (
                            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {complaint.images.map((img, idx) => (
                                    <div key={idx} className="aspect-video rounded-xl bg-white/5 border border-white/10 overflow-hidden relative group">
                                        <img src={img} alt={`Attachment ${idx+1}`} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Send Message to Staff */}
                    <div className="bg-[#151722] border border-white/5 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-[16px] font-bold text-white mb-4">Send a Message</h3>
                        <div className="flex flex-col h-full">
                            <textarea 
                                value={statusNote}
                                onChange={(e) => setStatusNote(e.target.value)}
                                placeholder="Write a message or reply to staff..."
                                className="w-full min-h-[100px] bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[13px] text-white font-bold placeholder-gray-500 focus:outline-none focus:border-[#6338f0]/50 shadow-sm resize-none"
                            />
                            <div className="flex items-center justify-between mt-3">
                                <span className="text-[11px] font-bold text-gray-500">This will be added to the activity log.</span>
                                <button 
                                    onClick={handleSendMessage}
                                    disabled={isUpdating || !statusNote.trim()}
                                    className="px-6 py-2.5 bg-[#6338f0] hover:bg-[#5b32e6] text-white text-[13px] font-bold rounded-xl transition-colors shadow-[0_0_15px_rgba(99,56,240,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <Send className="w-4 h-4" />
                                    {isUpdating ? 'Sending...' : 'Send Message'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column (Timeline) */}
                <div className="space-y-6">
                    {/* Activity Log / Timeline */}
                    <div className="bg-[#151722] border border-white/5 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-[16px] font-bold text-white">Activity Log</h3>
                        </div>
                        
                        <div className="relative border-l border-white/10 ml-3 space-y-6 pb-2">
                            {/* Original Complaint Creation Node */}
                            <div className="relative pl-6">
                                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-[#151722] border-2 border-green-500 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[13px] font-bold text-white">Complaint Created</span>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-[12px] font-bold text-gray-400">You</span>
                                        <span className="text-[11px] font-bold text-gray-500">{new Date(complaint.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Comments / Timeline Events */}
                            {timeline.slice().reverse().map((event, idx) => (
                                <div key={event._id || idx} className="relative pl-6">
                                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-[#151722] border-2 border-indigo-500 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[13px] font-bold text-white">
                                            {event.statusChangedTo ? `Status changed to ${event.statusChangedTo}` : 'Message Added'}
                                        </span>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-[12px] font-bold text-gray-400">
                                                {event.authorId?.firstName ? `${event.authorId.firstName} ${event.authorId.lastName}` : 'System'}
                                            </span>
                                            <span className="text-[11px] font-bold text-gray-500">
                                                {new Date(event.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        {event.commentText && (
                                            <p className="text-[12px] font-bold text-gray-300 mt-2 bg-white/5 p-3 rounded-xl border border-white/10">
                                                {event.commentText}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
