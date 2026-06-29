import React from 'react';
import { Phone, Car, Clock, Check, X, RefreshCw } from 'lucide-react';
import { useCancelVisitorPassMutation, useApproveWalkInMutation, useDenyWalkInMutation } from '../../../../store/api/residentApi';
import StatusBadge from '../../../../components/ui/StatusBadge';
import { Button } from '../../../../components/ui/Button';

export function VisitorCard({ visitor }) {
    const [cancelVisitorPass, { isLoading: isCancelling }] = useCancelVisitorPassMutation();
    const [approveWalkIn, { isLoading: isApproving }] = useApproveWalkInMutation();
    const [denyWalkIn, { isLoading: isDenying }] = useDenyWalkInMutation();
    
    const canCancel = ['PENDING', 'APPROVED'].includes(visitor.status) && visitor.approvalMethod !== 'REAL_TIME_APPROVAL';
    const needsApproval = visitor.status === 'PENDING' && visitor.approvalMethod === 'REAL_TIME_APPROVAL';

    return (
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                    <p className="font-semibold text-slate-900">{visitor.visitorName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{(visitor.visitorType === 'OTHER' ? (visitor.customVisitorType || 'OTHER') : visitor.visitorType).replace('_', ' ')} {visitor.purpose ? `· ${visitor.purpose}` : ''}</p>
                </div>
                <StatusBadge status={visitor.status} />
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mb-3">
                {visitor.visitorPhone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{visitor.visitorPhone}</span>}
                {visitor.vehicleNumber && <span className="flex items-center gap-1"><Car className="h-3.5 w-3.5" />{visitor.vehicleNumber}</span>}
                {visitor.expectedArrival && (
                    <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(visitor.expectedArrival).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                )}
            </div>
            
            <div className="flex items-center gap-3">
                {needsApproval && (
                    <>
                        <Button 
                            size="sm" 
                            variant="primary" 
                            className="bg-emerald-500 hover:bg-emerald-600" 
                            onClick={() => approveWalkIn(visitor._id)} 
                            isLoading={isApproving} 
                            disabled={isApproving || isDenying}
                        >
                            <Check className="h-3.5 w-3.5 mr-1" /> Approve
                        </Button>
                        <Button 
                            size="sm" 
                            variant="secondary" 
                            onClick={() => denyWalkIn(visitor._id)} 
                            isLoading={isDenying} 
                            disabled={isApproving || isDenying}
                        >
                            <X className="h-3.5 w-3.5 mr-1" /> Deny
                        </Button>
                    </>
                )}
                {canCancel && (
                    <button onClick={() => cancelVisitorPass(visitor._id)} disabled={isCancelling}
                        className="text-xs font-semibold text-red-500 hover:text-red-600 disabled:opacity-60 ml-auto">
                        {isCancelling ? 'Cancelling…' : 'Cancel Pass'}
                    </button>
                )}
            </div>
        </div>
    );
}
