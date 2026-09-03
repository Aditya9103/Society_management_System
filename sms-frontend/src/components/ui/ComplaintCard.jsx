import React from 'react';
import { Link } from 'react-router-dom';
import { 
    AlertTriangle, Droplets, Zap, Shield, HelpCircle, 
    MessageSquare, Settings, Volume2, Car, Wrench, 
    Eye, MoreVertical 
} from 'lucide-react';

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
    DRAFT: { color: 'text-gray-400', bg: 'bg-gray-400/10', border: 'border-gray-500', glow: 'shadow-[0_0_15px_rgba(156,163,175,0.1)]' },
    OPEN: { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.15)]' },
    ASSIGNED: { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.15)]' },
    IN_PROGRESS: { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500', glow: 'shadow-[0_0_15px_rgba(249,115,22,0.15)]' },
    PENDING_RESIDENT: { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500', glow: 'shadow-[0_0_15px_rgba(234,179,8,0.15)]' },
    RESOLVED: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]' },
    CLOSED: { color: 'text-gray-500', bg: 'bg-gray-500/10', border: 'border-gray-500', glow: 'shadow-[0_0_15px_rgba(107,114,128,0.15)]' },
    ESCALATED: { color: 'text-rose-600', bg: 'bg-rose-600/10', border: 'border-rose-600', glow: 'shadow-[0_0_15px_rgba(225,29,72,0.15)]' },
};

const PRIORITY_COLORS = {
    LOW: 'bg-green-500',
    MEDIUM: 'bg-yellow-500',
    HIGH: 'bg-red-500',
    URGENT: 'bg-rose-600 animate-pulse',
};

export default function ComplaintCard({ complaint, linkPrefix = '/admin/complaints' }) {
    const Icon = CATEGORY_ICONS[complaint.category] || HelpCircle;
    const statusConfig = STATUS_CONFIG[complaint.status] || STATUS_CONFIG.OPEN;
    const priorityColor = PRIORITY_COLORS[complaint.priority] || PRIORITY_COLORS.LOW;

    const raisedBy = complaint.raisedBy?.userId || {};
    const unit = complaint.raisedBy?.unitId?.unitNumber || 'N/A';
    
    return (
        <div className={`relative bg-[#151722] border-y md:border border-white/5 rounded-none md:rounded-2xl p-5 pl-6 transition-all hover:bg-white/[0.02] overflow-hidden flex flex-col lg:flex-row lg:items-center gap-6 group -mx-4 md:mx-0`}>
            {/* Make entire card clickable except for z-10 actions */}
            <Link to={`${linkPrefix}/${complaint._id}`} className="absolute inset-0 z-0" />

            {/* Left Edge Glow Bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${statusConfig.bg} ${statusConfig.border} border-l-[3px] ${statusConfig.glow} z-0`} />

            {/* Column 1 & 2: Icon & Details */}
            <div className="flex gap-4 lg:w-[30%] relative z-10 pointer-events-none">
                <div className="flex flex-col items-center gap-2">
                    <div className={`w-12 h-12 rounded-full ${statusConfig.bg} flex items-center justify-center border border-white/5 shrink-0`}>
                        <Icon className={`w-6 h-6 ${statusConfig.color}`} />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusConfig.bg} ${statusConfig.color} border border-white/5 uppercase tracking-wider`}>
                        {complaint.status.replace('_', ' ')}
                    </span>
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                    <h3 className="text-[15px] font-bold text-white tracking-wide truncate">{complaint.title}</h3>
                    <span className="text-[12px] font-bold text-gray-400 mt-0.5">{complaint.complaintNumber}</span>
                    <p className="text-[13px] font-bold text-gray-300 mt-2 line-clamp-2 leading-relaxed">{complaint.description}</p>
                </div>
            </div>

            {/* Column 3: Reported By */}
            <div className="flex gap-3 lg:w-[22%] relative z-10 pointer-events-none">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/30 shrink-0 overflow-hidden">
                    {raisedBy.profilePhotoUrl ? (
                        <img src={raisedBy.profilePhotoUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        (raisedBy.firstName?.[0] || '?')
                    )}
                </div>
                <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-[14px] font-bold text-white truncate">{raisedBy.firstName} {raisedBy.lastName}</span>
                    </div>
                    <span className="text-[12px] font-bold text-gray-400 mt-0.5 truncate">Unit {unit}</span>
                    <span className="text-[12px] font-bold text-gray-400 truncate">{raisedBy.phone || 'No phone'}</span>
                </div>
            </div>

            {/* Column 4: Category & Priority */}
            <div className="flex flex-col lg:w-[12%] relative z-10 pointer-events-none">
                <span className="text-[11px] font-bold text-gray-500">Category</span>
                <span className="text-[13px] font-bold text-white mt-0.5 truncate">{complaint.category === 'OTHER' ? complaint.customCategory || 'Other' : complaint.category}</span>
                
                <span className="text-[11px] font-bold text-gray-500 mt-2">Priority</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <div className={`w-2 h-2 rounded-full ${priorityColor}`} />
                    <span className="text-[13px] font-bold text-white">{complaint.priority}</span>
                </div>
            </div>

            {/* Column 5: Dates & Assignment */}
            <div className="flex flex-col lg:w-[20%] relative z-10 pointer-events-none">
                <span className="text-[11px] font-bold text-gray-500">Reported On</span>
                <span className="text-[13px] font-bold text-gray-300 mt-0.5 truncate">
                    {new Date(complaint.createdAt).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>

                <span className="text-[11px] font-bold text-gray-500 mt-2">Assigned To</span>
                {complaint.assignedTo ? (
                    <div className="flex items-center gap-2 mt-0.5">
                        <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] font-bold text-blue-400 overflow-hidden shrink-0">
                            {complaint.assignedTo.profilePhotoUrl ? (
                                <img src={complaint.assignedTo.profilePhotoUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                (complaint.assignedTo.firstName?.[0] || '?')
                            )}
                        </div>
                        <span className="text-[13px] font-bold text-white truncate">
                            {complaint.assignedTo.firstName} {complaint.assignedTo.lastName}
                        </span>
                    </div>
                ) : (
                    <span className="text-[13px] font-bold text-yellow-500 mt-0.5">Unassigned</span>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 lg:ml-auto relative z-10">
                <Link 
                    to={`${linkPrefix}/${complaint._id}`}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <Eye className="w-4 h-4" />
                </Link>
                <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                    <MoreVertical className="w-4 h-4" />
                </button>
                <Link 
                    to={`${linkPrefix}/${complaint._id}`}
                    className={`px-4 py-2.5 rounded-xl border font-bold text-[13px] transition-all
                        ${complaint.status === 'OPEN' ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' :
                        ['ASSIGNED', 'IN_PROGRESS'].includes(complaint.status) ? 'border-orange-500/30 text-orange-400 hover:bg-orange-500/10' :
                        'border-white/10 text-white hover:bg-white/10'
                        }
                    `}
                >
                    {complaint.status === 'OPEN' ? 'Escalate' : 
                     ['ASSIGNED', 'IN_PROGRESS'].includes(complaint.status) ? 'Follow Up' : 
                     'View Details'}
                </Link>
            </div>
        </div>
    );
}
