import React from 'react';
import { Mail, Phone, UserX } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import StatusBadge from '../../../../components/ui/StatusBadge';

export default function StaffCard({ member, onDeactivate, isDeactivating }) {
    const initials = `${member.firstName?.[0] ?? ''}${member.lastName?.[0] ?? ''}`;
    return (
        <Card className={!member.isActive ? 'opacity-60' : ''}>
            <Card.Body className="flex flex-col gap-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-bold text-white">
                            {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-900 truncate">{member.firstName} {member.lastName}</p>
                            <StatusBadge status={member.role} className="mt-0.5" />
                        </div>
                    </div>
                    {member.isActive && (
                        <button
                            onClick={() => onDeactivate(member)}
                            disabled={isDeactivating}
                            title="Deactivate staff member"
                            className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
                        >
                            <UserX className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">{member.email}</span>
                    </div>
                    {member.phone && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                            <span>{member.phone}</span>
                        </div>
                    )}
                </div>

                {!member.isActive && (
                    <div className="rounded-lg bg-slate-100 px-3 py-1.5 text-center text-xs font-medium text-slate-500">
                        Account Deactivated
                    </div>
                )}
            </Card.Body>
        </Card>
    );
}
