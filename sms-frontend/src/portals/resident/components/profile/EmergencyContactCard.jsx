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
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-red-200 hover:shadow transition-all group">
            <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                    <User className="h-5 w-5" />
                </div>
                <div>
                    <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                        {contact.name}
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 tracking-wider">
                            {contact.relation === 'OTHER' ? contact.customRelation || 'OTHER' : contact.relation}
                        </span>
                    </h4>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                        {contact.phone && (
                            <span className="flex items-center gap-1">
                                <Phone className="h-3.5 w-3.5 text-slate-400" />
                                {contact.phone}
                            </span>
                        )}
                        {contact.email && (
                            <span className="flex items-center gap-1 text-indigo-600 font-medium">
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
                className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                title="Remove Contact"
            >
                <Trash2 className="h-5 w-5" />
            </button>
        </div>
    );
}
