import React from 'react';
import { Phone, Check, X } from 'lucide-react';
import { useCancelVisitorPassMutation, useApproveWalkInMutation, useDenyWalkInMutation } from '../../../../store/api/residentApi';
import { Button } from '../../../../components/ui/Button';

export function VisitorCard({ visitor }) {
    const [cancelVisitorPass, { isLoading: isCancelling }] = useCancelVisitorPassMutation();
    const [approveWalkIn, { isLoading: isApproving }] = useApproveWalkInMutation();
    const [denyWalkIn, { isLoading: isDenying }] = useDenyWalkInMutation();

    const canCancel = ['PENDING', 'APPROVED'].includes(visitor.status) && visitor.approvalMethod !== 'REAL_TIME_APPROVAL';
    const needsApproval = visitor.status === 'PENDING' && visitor.approvalMethod === 'REAL_TIME_APPROVAL';

    // Status Badge Helpers
    const getStatusStyle = (status) => {
        switch (status) {
            case 'ACTIVE': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            case 'UPCOMING':
            case 'PENDING':
            case 'APPROVED': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'COMPLETED': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'CANCELLED': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-slate-500/20 text-white font-bold border-slate-500/30';
        }
    };
    const getDisplayStatus = (status) => {
        if (['PENDING', 'APPROVED'].includes(status)) return 'UPCOMING';
        return status;
    };
    
    // Format Date
    const formattedDate = visitor.expectedArrival ? new Date(visitor.expectedArrival).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', weekday: 'long' }) : '';
    const formattedTime = visitor.expectedArrival ? new Date(visitor.expectedArrival).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';

    return (
        <div className="bg-[#151822] border border-slate-800 rounded-3xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center transition-all hover:bg-[#1a1e2b] group">
            
            <div className="flex items-start gap-4 flex-1">
                {/* Avatar/Initial */}
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 overflow-hidden">
                    {/* Assuming placeholder, would use img if visitor.image exists */}
                    {visitor.visitorType === 'GUEST' ? (
                        <img src={`https://ui-avatars.com/api/?name=${visitor.visitorName}&background=2dd4bf&color=fff`} alt="" />
                    ) : (
                        <img src={`https://ui-avatars.com/api/?name=${visitor.visitorName}&background=a78bfa&color=fff`} alt="" />
                    )}
                </div>
                
                <div className="flex-1">
                    <p className="text-white font-bold text-[15px] mb-1">{visitor.visitorName}</p>
                    {visitor.visitorPhone && (
                        <p className="text-white font-bold text-xs flex items-center gap-1.5 mb-2">
                            <Phone className="w-3 h-3" /> {visitor.visitorPhone}
                        </p>
                    )}
                    <p className="text-slate-500 text-[11px] font-bold uppercase flex items-center gap-2">
                        <span className="flex items-center gap-1">
                            <span className="w-4 h-4 rounded bg-slate-800 flex items-center justify-center text-[8px]">G</span>
                            {(visitor.visitorType === 'OTHER' ? (visitor.customVisitorType || 'OTHER') : visitor.visitorType).replace('_', ' ')}
                        </span>
                    </p>
                </div>
            </div>

            <div className="flex-1 border-l border-r border-slate-800/50 px-6 mx-6 min-h-[60px] hidden md:block space-y-3">
                <div>
                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">Visit Date & Time</p>
                    <p className="text-white font-bold text-xs">{formattedDate}</p>
                    <p className="text-white font-bold text-xs">{formattedTime} - {(new Date(new Date(visitor.expectedArrival).getTime() + 2*60*60*1000)).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div>
                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">Gate Entry</p>
                    <p className="text-white font-bold text-xs">Main Gate</p>
                </div>
            </div>

            <div className="flex flex-col items-end gap-3 w-full md:w-auto mt-4 md:mt-0">
                <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest border uppercase flex items-center gap-1.5 ${getStatusStyle(visitor.status)}`}>
                    {visitor.status === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>}
                    {getDisplayStatus(visitor.status)}
                </div>

                <div className="flex flex-col items-end">
                    {/* Mock QR Code for visual */}
                    <div className={`w-16 h-16 bg-white rounded p-1 mb-1 ${visitor.status === 'CANCELLED' ? 'opacity-30' : ''}`}>
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${visitor._id}`} alt="QR Code" className="w-full h-full object-contain" />
                    </div>
                    {visitor.status === 'CANCELLED' ? (
                        <p className="text-red-500/80 text-[10px] font-bold">Pass Cancelled</p>
                    ) : (
                        <p className="text-slate-500 text-[10px] font-mono">Pass ID: GV{visitor._id.substring(0,8)}</p>
                    )}
                </div>
                
                {canCancel && (
                    <button onClick={() => cancelVisitorPass(visitor._id)} disabled={isCancelling}
                        className="text-[11px] font-bold text-red-500 hover:text-red-400 transition-colors mt-1">
                        {isCancelling ? 'Cancelling…' : 'Cancel Pass'}
                    </button>
                )}

                {needsApproval && (
                     <div className="flex gap-2 w-full">
                         <button onClick={() => approveWalkIn(visitor._id)} disabled={isApproving || isDenying}
                             className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded px-2 py-1 text-[11px] font-bold transition-colors">
                             Approve
                         </button>
                         <button onClick={() => denyWalkIn(visitor._id)} disabled={isApproving || isDenying}
                             className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded px-2 py-1 text-[11px] font-bold transition-colors">
                             Deny
                         </button>
                     </div>
                )}
            </div>
        </div>
    );
}
