import React from 'react';
import { Check, Mail, Phone, Home, X, FileText, User, Calendar } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';

export default function ApprovalCard({ resident, onApprove, onReject, onViewDocs, isApproving }) {
    const user = resident.userId;
    if (!user) return null;

    const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`;
    const unit = resident.unitId;
    
    const formattedDate = new Date(resident.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
    });
    const formattedTime = new Date(resident.createdAt).toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit'
    });

    return (
        <div className="bg-[#151722] border border-white/5 rounded-2xl p-5 flex flex-col md:flex-row gap-6 md:items-center justify-between transition-colors hover:border-white/10 shadow-sm relative overflow-hidden">
            
            {/* Identity Column */}
            <div className="flex items-center gap-4 flex-1 min-w-0 md:border-r border-white/5 md:pr-4">
                <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-amber-600 text-xl font-bold text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                    {initials}
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-[17px] font-bold text-white break-words whitespace-normal">
                            {user.firstName} {user.lastName}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/30 tracking-wider">
                            PENDING
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-[13px] font-bold text-gray-300 break-all">
                        <Mail className="h-3.5 w-3.5 shrink-0" /> {user.email}
                    </div>
                    {user.phone && (
                        <div className="flex items-center gap-1.5 text-[13px] font-bold text-gray-300">
                            <Phone className="h-3.5 w-3.5 shrink-0" /> {user.phone}
                        </div>
                    )}
                </div>
            </div>

            {/* Unit Details Column */}
            <div className="flex flex-col gap-2 flex-1 md:border-r border-white/5 md:pr-4">
                {unit ? (
                    <>
                        <div className="flex items-center gap-2 text-white font-bold text-[15px]">
                            <Home className="h-4 w-4 text-purple-400" /> 
                            Unit {unit.unitNumber}
                        </div>
                        <div className="text-[13px] font-bold text-gray-300">
                            Tower {unit.tower?.name || 'N/A'} • Floor {unit.floor || 'N/A'}
                        </div>
                        <div className="mt-1">
                            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#6338f0]/10 text-[#8b5cf6] border border-[#6338f0]/30 uppercase tracking-widest">
                                RESIDENTIAL
                            </span>
                        </div>
                    </>
                ) : (
                    <div className="text-[13px] font-bold text-gray-300">Unit not assigned</div>
                )}
            </div>

            {/* Application Meta Column */}
            <div className="flex flex-col gap-3 flex-1 md:border-r border-white/5 md:pr-4">
                <div className="flex items-center gap-2 text-[13px] font-bold">
                    <User className="h-4 w-4 text-gray-300" />
                    <span className="text-gray-300">Ownership:</span> 
                    <span className="text-white uppercase">{resident.ownershipType}</span>
                </div>
                <div className="flex items-center gap-2 text-[13px] font-bold">
                    <Calendar className="h-4 w-4 text-gray-300" />
                    <span className="text-gray-300">Applied on</span>
                </div>
                <div className="text-[13px] font-bold text-gray-300 pl-6">
                    {formattedDate}, {formattedTime}
                </div>
            </div>

            {/* Actions Column */}
            <div className="flex flex-col gap-3 shrink-0 items-end">
                <button 
                    onClick={() => onViewDocs(user._id)}
                    className="flex items-center gap-1.5 text-[13px] font-bold text-[#b388ff] hover:text-[#c4a1ff] transition-colors mb-1"
                >
                    <FileText className="h-4 w-4" />
                    View Documents ({resident.uploadedDocuments?.length || 0})
                </button>
                
                <div className="flex items-center gap-3 w-full justify-end">
                    <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500/50 text-red-500 hover:bg-red-500/10 hover:text-red-400 flex-1 justify-center bg-transparent"
                        onClick={() => onReject(user._id, `${user.firstName} ${user.lastName}`)}
                    >
                        <X className="mr-1.5 h-4 w-4" /> Reject
                    </Button>
                    <Button
                        size="sm"
                        className="bg-transparent border border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-400 flex-1 justify-center shadow-none"
                        isLoading={isApproving}
                        onClick={() => onApprove(resident)}
                    >
                        <Check className="mr-1.5 h-4 w-4" /> Approve
                    </Button>
                </div>
            </div>

        </div>
    );
}
