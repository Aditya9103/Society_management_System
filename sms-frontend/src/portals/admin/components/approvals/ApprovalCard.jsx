import React from 'react';
import { UserCheck, Check, Mail, Phone, Home, X } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import StatusBadge from '../../../../components/ui/StatusBadge';
import Card from '../../../../components/ui/Card';

export default function ApprovalCard({ resident, onApprove, onReject, onViewDocs, isApproving }) {
    const user = resident.userId;
    if (!user) return null;

    const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`;
    const unit = resident.unitId;

    return (
        <Card className="overflow-hidden transition-all hover:shadow-md">
            <Card.Body className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                {/* Left — Identity */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-base font-bold text-white shadow-sm">
                        {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <p className="text-base font-bold text-slate-800 truncate">
                                {user.firstName} {user.lastName}
                            </p>
                            <StatusBadge status="PENDING" label="PENDING REVIEW" type="WARNING" />
                        </div>

                        {/* Contact + Unit details */}
                        <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
                            <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">
                                <Mail className="h-3.5 w-3.5 text-slate-500" /> {user.email}
                            </span>
                            {user.phone && (
                                <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">
                                    <Phone className="h-3.5 w-3.5 text-slate-500" /> {user.phone}
                                </span>
                            )}
                            {unit && (
                                <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">
                                    <Home className="h-3.5 w-3.5 text-slate-500" />
                                    Unit {unit.unitNumber}
                                    {unit.bhkType && ` · ${unit.bhkType}`}
                                </span>
                            )}
                        </div>

                        {/* Meta */}
                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                            <span className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md text-slate-500 font-bold">
                                Ownership: <span className="text-slate-800">{resident.ownershipType}</span>
                            </span>
                            <span className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md text-slate-500 font-bold">
                                Applied: <span className="text-slate-800">
                                    {new Date(resident.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                            </span>
                            {resident.uploadedDocuments?.length > 0 && (
                                <span className="bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md text-emerald-700 font-bold">
                                    Docs: {resident.uploadedDocuments.length} uploaded
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right — Actions */}
                <div className="flex shrink-0 items-center gap-2 self-end sm:self-start">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewDocs(user._id)}
                    >
                        View Docs
                    </Button>
                    <Button
                        size="sm"
                        variant="danger"
                        onClick={() => onReject(user._id, `${user.firstName} ${user.lastName}`)}
                    >
                        <X className="mr-1 h-3.5 w-3.5" /> Reject
                    </Button>
                    <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        isLoading={isApproving}
                        onClick={() => onApprove(resident)}
                    >
                        <Check className="mr-1 h-3.5 w-3.5" /> Approve
                    </Button>
                </div>
            </Card.Body>
        </Card>
    );
}
