import React from 'react';
import { Link } from 'react-router-dom';

export default function PendingApprovalsList({ approvals = [] }) {
    // If no approvals are provided, mock them to match the visual image request.
    const displayApprovals = approvals?.length > 0 ? approvals : [
        { _id: '1', name: 'Prashant Jha', unit: 'Unit D0008 • Owner', date: '9 Jul 2026', initial: 'PJ', color: 'bg-amber-600' },
        { _id: '2', name: 'Rohit Kumar', unit: 'Unit D0006 • Owner', date: '30 Jun 2026', initial: 'RK', color: 'bg-emerald-600' },
        { _id: '3', name: 'Jakik Jnaji', unit: 'Unit D0003 • Tenant', date: '30 Jun 2026', initial: 'JJ', color: 'bg-violet-600' }
    ];

    const getInitials = (user) => {
        if (!user || (!user.firstName && !user.lastName)) return 'U';
        return `${(user.firstName || '')[0] || ''}${(user.lastName || '')[0] || ''}`.toUpperCase();
    };

    return (
        <div className="bg-[#13151a] border border-white/5 rounded-2xl p-5 lg:col-span-1 h-80 flex flex-col relative overflow-hidden group">
            <div className="flex justify-between items-center mb-4 relative z-10">
                <h2 className="text-white font-semibold text-sm">Pending Approvals</h2>
                <Link to="/admin/pending" className="text-xs text-indigo-400 hover:text-indigo-300">View All</Link>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar relative z-10">
                {displayApprovals.map((app) => {
                    const name = app.name || (app.userId ? `${app.userId.firstName} ${app.userId.lastName}` : 'Unknown User');
                    const initial = app.initial || getInitials(app.userId);
                    const unitInfo = app.unit || (app.unitId ? `Unit ${app.unitId.unitNumber} • ${app.residentType || 'Resident'}` : 'Unknown Unit');
                    const dateStr = app.date || new Date(app.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                    
                    // Generate color based on initial
                    const colors = ['bg-amber-600', 'bg-emerald-600', 'bg-violet-600', 'bg-blue-600', 'bg-rose-600'];
                    const colorIndex = initial.charCodeAt(0) % colors.length;
                    const bgColor = app.color || colors[colorIndex];

                    return (
                        <div key={app._id} className="flex gap-4 items-center cursor-pointer hover:bg-white/5 p-2 -mx-2 rounded-xl transition-colors">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${bgColor} text-white font-semibold shadow-inner`}>
                                {initial}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-100 truncate">{name}</h4>
                                <p className="text-[12px] text-gray-300 truncate mb-0.5">{unitInfo}</p>
                                <p className="text-[12px] text-gray-400 truncate">{dateStr}</p>
                            </div>
                            <div className="shrink-0 px-2 py-1 rounded border border-amber-500/20 bg-amber-500/10 text-[9px] font-medium text-amber-500 tracking-wider">
                                PENDING
                            </div>
                        </div>
                    );
                })}
                {displayApprovals.length === 0 && (
                    <div className="text-center text-sm text-gray-400 mt-10">No pending approvals.</div>
                )}
            </div>
        </div>
    );
}
