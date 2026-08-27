import React from 'react';
import { UserPlus, Megaphone, PlusSquare, MessageSquareWarning, BarChart2, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../../../components/ui/Button';

export default function QuickActionsGrid() {
    const actions = [
        { label: 'Add Resident', to: '/admin/residents', icon: UserPlus, color: 'text-violet-400', bg: 'bg-violet-500/10 hover:bg-violet-500/20' },
        { label: 'Create Notice', to: '/admin/notices', icon: Megaphone, color: 'text-blue-400', bg: 'bg-blue-500/10 hover:bg-blue-500/20' },
        { label: 'Add Unit', to: '/admin/units', icon: PlusSquare, color: 'text-emerald-400', bg: 'bg-emerald-500/10 hover:bg-emerald-500/20' },
        { label: 'Raise Complaint', to: '/admin/complaints', icon: MessageSquareWarning, color: 'text-orange-400', bg: 'bg-orange-500/10 hover:bg-orange-500/20' },
        { label: 'Create Poll', to: '/admin/polls', icon: BarChart2, color: 'text-rose-400', bg: 'bg-rose-500/10 hover:bg-rose-500/20' },
        { label: 'Emergency Alert', to: '/admin/emergencies', icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-500/10 hover:bg-red-500/20' },
    ];

    return (
        <div className="bg-[#13151a] border border-white/5 rounded-2xl p-5 lg:col-span-1 h-80 flex flex-col relative overflow-hidden group">
            <h2 className="text-white font-semibold text-sm mb-4 relative z-10">Quick Actions</h2>
            
            <div className="flex-1 grid grid-cols-2 gap-3 relative z-10">
                {actions.map((action, i) => (
                    <Link
                        key={i}
                        to={action.to}
                        className={cn("flex items-center gap-3 p-3 rounded-xl border border-white/5 transition-colors", action.bg)}
                    >
                        <action.icon className={cn("w-4 h-4 shrink-0", action.color)} />
                        <span className="text-xs font-medium text-gray-200">{action.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
