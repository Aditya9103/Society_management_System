import React, { useState } from 'react';
import { RefreshCw, Trash2 } from 'lucide-react';

const RELATION_COLORS = {
    SPOUSE: 'bg-pink-100 text-pink-700',
    CHILD: 'bg-blue-100 text-blue-700',
    PARENT: 'bg-amber-100 text-amber-700',
    SIBLING: 'bg-purple-100 text-purple-700',
    GRANDPARENT: 'bg-emerald-100 text-emerald-700',
    OTHER: 'bg-slate-100 text-slate-600',
};

export function FamilyMemberCard({ member, onDelete }) {
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);
        await onDelete(member._id);
        setDeleting(false);
    };

    return (
        <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">
                    {member.name?.[0]?.toUpperCase()}
                </div>
                <div>
                    <p className="text-sm font-semibold text-slate-800">{member.name}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${RELATION_COLORS[member.relation] ?? RELATION_COLORS.OTHER}`}>
                        {member.relation}
                    </span>
                </div>
            </div>
            <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition"
            >
                {deleting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </button>
        </div>
    );
}
