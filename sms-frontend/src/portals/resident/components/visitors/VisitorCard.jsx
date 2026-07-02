import React from 'react';
import { Phone, Car, Clock, Check, X, RefreshCw } from 'lucide-react';
import { useCancelVisitorPassMutation, useApproveWalkInMutation, useDenyWalkInMutation } from '../../../../store/api/residentApi';
import StatusBadge from '../../../../components/ui/StatusBadge';
import { Button } from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';

export function VisitorCard({ visitor }) {
    const [cancelVisitorPass, { isLoading: isCancelling }] = useCancelVisitorPassMutation();
    const [approveWalkIn, { isLoading: isApproving }] = useApproveWalkInMutation();
    const [denyWalkIn, { isLoading: isDenying }] = useDenyWalkInMutation();

    const canCancel = ['PENDING', 'APPROVED'].includes(visitor.status) && visitor.approvalMethod !== 'REAL_TIME_APPROVAL';
    const needsApproval = visitor.status === 'PENDING' && visitor.approvalMethod === 'REAL_TIME_APPROVAL';

    return (
        <Card>
            <Card.Body>
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                        <p className="text-base font-bold text-slate-800">{visitor.visitorName}</p>
                        <p className="text-xs font-bold text-slate-500 mt-0.5 uppercase tracking-wider">{(visitor.visitorType === 'OTHER' ? (visitor.customVisitorType || 'OTHER') : visitor.visitorType).replace('_', ' ')} {visitor.purpose ? `· ${visitor.purpose}` : ''}</p>
                    </div>
                    <StatusBadge status={visitor.status} />
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600 mb-4">
                    {visitor.visitorPhone && <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md"><Phone className="h-3.5 w-3.5 text-slate-400" />{visitor.visitorPhone}</span>}
                    {visitor.vehicleNumber && <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md"><Car className="h-3.5 w-3.5 text-slate-400" />{visitor.vehicleNumber}</span>}
                    {visitor.expectedArrival && (
                        <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            {new Date(visitor.expectedArrival).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-3 pt-3 mt-2 border-t border-slate-100/60">
                    {needsApproval && (
                        <>
                            <Button
                                size="sm"
                                variant="primary"
                                className="bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                                onClick={() => approveWalkIn(visitor._id)}
                                isLoading={isApproving}
                                disabled={isApproving || isDenying}
                            >
                                <Check className="h-4 w-4 mr-1.5" /> Approve
                            </Button>
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => denyWalkIn(visitor._id)}
                                isLoading={isDenying}
                                disabled={isApproving || isDenying}
                                className="shadow-sm"
                            >
                                <X className="h-4 w-4 mr-1.5" /> Deny
                            </Button>
                        </>
                    )}
                    {canCancel && (
                        <button onClick={() => cancelVisitorPass(visitor._id)} disabled={isCancelling}
                            className="text-sm font-bold text-red-600 hover:text-red-700 disabled:opacity-60 ml-auto transition-colors">
                            {isCancelling ? 'Cancelling…' : 'Cancel Pass'}
                        </button>
                    )}
                </div>
            </Card.Body>
        </Card>
    );
}
