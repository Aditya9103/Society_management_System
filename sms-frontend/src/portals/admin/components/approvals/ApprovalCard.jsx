import React from 'react';
import { UserCheck, Check, Mail, Phone, Home, X } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import StatusBadge from '../../../../components/ui/StatusBadge';
import Card from '../../../../components/ui/Card';

export default function ApprovalCard({ resident, onApprove, onReject, isApproving }) {
    const user = resident.userId;
    if (!user) return null;

    const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`;
    const unit = resident.unitId;

    return (
        <Card className="overflow-hidden transition-all hover:shadow-md">
            <Card.Body className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                {/* Left — Identity */}
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-bold text-white shadow">
                        {initials}
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-slate-900">
                                {user.firstName} {user.lastName}
                            </p>
                            <StatusBadge status="PENDING" label="PENDING REVIEW" type="WARNING" />
                        </div>

                        {/* Contact + Unit details */}
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" /> {user.email}
                            </span>
                            {user.phone && (
                                <span className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" /> {user.phone}
                                </span>
                            )}
                            {unit && (
                                <span className="flex items-center gap-1">
                                    <Home className="h-3 w-3" />
                                    Unit {unit.unitNumber}
                                    {unit.bhkType && ` · ${unit.bhkType}`}
                                </span>
                            )}
                        </div>

                        {/* Meta */}
                        <div className="mt-2 flex flex-wrap gap-3 text-xs">
                            <span className="text-slate-400">
                                Ownership: <span className="font-medium text-slate-600">{resident.ownershipType}</span>
                            </span>
                            <span className="text-slate-400">
                                Applied: <span className="font-medium text-slate-600">
                                    {new Date(resident.createdAt).toLocaleDateString('en-IN')}
                                </span>
                            </span>
                            {resident.uploadedDocuments?.length > 0 && (
                                <span className="text-slate-400">
                                    Docs: <span className="font-medium text-emerald-600">{resident.uploadedDocuments.length} uploaded</span>
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right — Actions */}
                <div className="flex shrink-0 items-center gap-2 self-end sm:self-start">
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
