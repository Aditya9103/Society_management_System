import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, UserX, Trash2 } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import StatusBadge from '../../../../components/ui/StatusBadge';

export default function StaffCard({ member, onDeactivate, isDeactivating, onDelete, isDeleting }) {
    const navigate = useNavigate();
    const initials = `${member.firstName?.[0] ?? ''}${member.lastName?.[0] ?? ''}`;
    return (
        <Card
            className={`cursor-pointer hover:border-[#6338f0]/50 transition-colors ${!member.isActive ? 'opacity-60' : ''}`}
            onClick={() => navigate(`/admin/staff/${member._id}`)}
        >
            <Card.Body className="flex flex-col gap-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-base font-bold text-white shadow-sm">
                            {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-base font-bold text-slate-800 break-words whitespace-normal">{member.firstName} {member.lastName}</p>
                            <StatusBadge status={member.role} className="mt-1" />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {member.isActive ? (
                            <button
                                onClick={(e) => { e.stopPropagation(); onDeactivate(member); }}
                                disabled={isDeactivating || isDeleting}
                                title="Deactivate staff member"
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-white font-bold transition-all hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 active:scale-95 disabled:opacity-40"
                            >
                                <UserX className="h-4 w-4" />
                            </button>
                        ) : (
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(member); }}
                                disabled={isDeleting || isDeactivating}
                                title="Delete permanently"
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-white font-bold transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-95 disabled:opacity-40"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="space-y-2 mt-2">
                    <div className="flex items-center gap-2.5 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
                        <Mail className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                        <span className="break-words whitespace-normal">{member.email}</span>
                    </div>
                    {member.phone && (
                        <div className="flex items-center gap-2.5 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
                            <Phone className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                            <span>{member.phone}</span>
                        </div>
                    )}
                </div>

                {!member.isActive && (
                    <div className="rounded-xl border border-red-200/60 bg-red-50 px-3 py-2 text-center text-xs font-bold text-red-700 shadow-sm mt-3">
                        Account Deactivated
                    </div>
                )}
            </Card.Body>
        </Card>
    );
}
