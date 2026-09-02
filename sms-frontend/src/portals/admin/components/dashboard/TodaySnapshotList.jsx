import React from 'react';
import { UserCheck, Car, Wrench, FileText } from 'lucide-react';

export default function TodaySnapshotList({ snapshot }) {
    const items = [
        { label: 'Visitors Today', value: snapshot?.visitorsToday || 12, icon: UserCheck },
        { label: 'Vehicles In', value: snapshot?.vehiclesToday || 34, icon: Car },
        { label: 'Service Requests', value: snapshot?.serviceRequests || 5, icon: Wrench },
        { label: 'Unpaid Invoices', value: snapshot?.unpaidInvoices || 2, icon: FileText },
    ];

    return (
        <div className="bg-[#13151a] border border-white/5 rounded-2xl p-5 lg:col-span-1 h-80 flex flex-col relative overflow-hidden group">
            <h2 className="text-white font-semibold text-sm mb-4 relative z-10">Today's Snapshot</h2>
            
            <div className="flex-1 space-y-5 relative z-10">
                {items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between group-hover:bg-white/5 -mx-2 px-2 py-1 rounded transition-colors">
                        <div className="flex items-center gap-3">
                            <item.icon className="w-4 h-4 text-gray-300" />
                            <span className="text-sm text-gray-200">{item.label}</span>
                        </div>
                        <span className="text-sm font-semibold text-white">{item.value}</span>
                    </div>
                ))}
            </div>
            
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -mr-20 -mb-20 pointer-events-none"></div>
        </div>
    );
}
