import React, { useState } from 'react';
import { Trash2, Phone, Mail, User } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';

export function EmergencyContactCard({ contact, onDelete }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!window.confirm(`Remove ${contact.name} from emergency contacts?`)) return;
        setIsDeleting(true);
        try {
            await onDelete(contact._id);
        } catch {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex items-center justify-between rounded-[16px] bg-[#12131c] px-4 py-3 border border-slate-800/80 shadow-sm transition-colors hover:border-red-500/30 group">
            <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                    <User className="h-5 w-5" />
                </div>
                <div>
                    <h4 className="font-bold text-white flex items-center gap-2 mb-1 text-[13px]">
                        {contact.name}
                        <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-white font-bold tracking-wider">
                            {contact.relation === 'OTHER' ? contact.customRelation || 'OTHER' : contact.relation}
                        </span>
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-white font-bold">
                        {contact.phone && (
                            <span className="flex items-center gap-1.5">
                                <Phone className="h-3.5 w-3.5 text-slate-500" />
                                {contact.phone}
                            </span>
                        )}
                        {contact.email && (
                            <span className="flex items-center gap-1.5 text-blue-400 font-bold">
                                <Mail className="h-3.5 w-3.5" />
                                {contact.email}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            
            <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-lg p-2 text-slate-500 hover:bg-red-500/10 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                title="Remove Contact"
            >
                <Trash2 className="h-5 w-5" />
            </button>
        </div>
    );
}
