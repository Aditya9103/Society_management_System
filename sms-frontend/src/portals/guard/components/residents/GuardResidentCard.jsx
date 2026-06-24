import React from 'react';
import { Phone } from 'lucide-react';
import StatusBadge from '../../../../components/ui/StatusBadge';
import Card from '../../../../components/ui/Card';

export default function GuardResidentCard({ resident }) {
    const initials = `${resident.firstName?.[0] ?? ''}${resident.lastName?.[0] ?? ''}`;
    return (
        <Card>
            <Card.Body className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-bold text-white">
                    {initials}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900">{resident.firstName} {resident.lastName}</p>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
                        {resident.phone && (
                            <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" /> {resident.phone}
                            </span>
                        )}
                    </div>
                </div>
                <StatusBadge status="RESIDENT" />
            </Card.Body>
        </Card>
    );
}
