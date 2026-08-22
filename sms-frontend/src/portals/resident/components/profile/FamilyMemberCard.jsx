import React, { useState } from 'react';
import { RefreshCw, Trash2 } from 'lucide-react';

const RELATION_COLORS = {
    SPOUSE: 'bg-pink-500/10 text-pink-400 border-pink-500/20 border',
    CHILD: 'bg-blue-500/10 text-blue-400 border-blue-500/20 border',
    PARENT: 'bg-amber-500/10 text-amber-400 border-amber-500/20 border',
    SIBLING: 'bg-purple-500/10 text-purple-400 border-purple-500/20 border',
    GRANDPARENT: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 border',
    OTHER: 'bg-slate-500/10 text-slate-400 border-slate-500/20 border',
};

export function FamilyMemberCard({ member, onDelete }) {
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);
        await onDelete(member._id);
        setDeleting(false);
    };

    return (
        <div className="flex items-center justify-between rounded-[16px] bg-[#12131c] px-4 py-3 border border-slate-800/80 shadow-sm transition-colors hover:border-slate-700">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 font-bold text-sm border border-indigo-500/20">
                    {member.name?.[0]?.toUpperCase()}
                </div>
                <div>
                    <p className="text-[13px] font-bold text-white mb-0.5">{member.name}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${RELATION_COLORS[member.relation] ?? RELATION_COLORS.OTHER}`}>
                        {member.relation === 'OTHER' ? member.customRelation || 'OTHER' : member.relation}
                    </span>
                </div>
            </div>
            <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
            >
                {deleting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </button>
        </div>
    );
}
