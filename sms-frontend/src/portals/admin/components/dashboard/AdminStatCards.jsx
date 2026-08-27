import React from 'react';
import { Users, Building2, UserCog, ClipboardList, AlertCircle, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../../../components/ui/Button';

export default function AdminStatCards({ stats }) {
    const cards = [
        {
            title: 'Total Residents',
            value: stats.totalResidents || 0,
            subtitle: `+${Math.max(0, (stats.totalResidents || 0) - (stats.residentsLastMonth || 0))} vs last month`,
            icon: Users,
            iconColor: 'text-indigo-400',
            iconBg: 'bg-indigo-500/10',
            trend: 'up',
            trendColor: 'text-emerald-400',
            to: '/admin/residents'
        },
        {
            title: 'Total Units',
            value: stats.totalUnits || 0,
            subtitle: `${stats.occupiedUnits || 0} Occupied`,
            icon: Building2,
            iconColor: 'text-blue-400',
            iconBg: 'bg-blue-500/10',
            progress: stats.totalUnits ? Math.round((stats.occupiedUnits / stats.totalUnits) * 100) : 0,
            progressColor: 'bg-blue-500',
            to: '/admin/units'
        },
        {
            title: 'Total Staff',
            value: stats.totalStaff || 0,
            subtitle: 'Active Personnel',
            icon: UserCog,
            iconColor: 'text-emerald-400',
            iconBg: 'bg-emerald-500/10',
            to: '/admin/staff'
        },
        {
            title: 'Pending Approvals',
            value: stats.pendingResidents || 0,
            subtitle: 'Requires attention',
            icon: ClipboardList,
            iconColor: 'text-orange-400',
            iconBg: 'bg-orange-500/10',
            highlight: stats.pendingResidents > 0,
            to: '/admin/pending'
        },
        {
            title: 'Active Complaints',
            value: (stats.complaints?.open || 0) + (stats.complaints?.inProgress || 0),
            subtitle: `${stats.complaints?.escalated || 0} Escalated`,
            icon: AlertCircle,
            iconColor: 'text-rose-400',
            iconBg: 'bg-rose-500/10',
            subtitleColor: (stats.complaints?.escalated || 0) > 0 ? 'text-rose-400' : 'text-gray-500',
            to: '/admin/complaints'
        },
        {
            title: 'Maintenance Due',
            value: stats.snapshot?.serviceRequests || 0,
            subtitle: 'Upcoming tasks',
            icon: Wrench,
            iconColor: 'text-cyan-400',
            iconBg: 'bg-cyan-500/10',
            to: '/admin/emergencies' // Or '/admin/complaints' depending on context
        }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 lg:gap-4">
            {cards.map((card, index) => (
                <Link 
                    key={index} 
                    to={card.to}
                    className="bg-[#13151a] border border-white/5 rounded-2xl p-3 lg:p-4 flex flex-col justify-between hover:bg-[#1a1d24] transition-colors relative overflow-hidden group block"
                >
                    <div className="flex justify-between items-start mb-2 lg:mb-4">
                        <div className={cn("p-1.5 lg:p-2 rounded-lg", card.iconBg)}>
                            <card.icon className={cn("w-4 h-4 lg:w-5 lg:h-5", card.iconColor)} />
                        </div>
                    </div>
                    
                    <div>
                        <p className="text-gray-300 text-[10px] lg:text-xs font-medium mb-0.5 lg:mb-1">{card.title}</p>
                        <h3 className="text-xl lg:text-2xl font-bold text-white mb-1.5 lg:mb-2">{card.value}</h3>
                        
                        {card.progress !== undefined ? (
                            <div className="w-full mt-auto">
                                <div className="flex justify-between text-[9px] lg:text-[10px] text-gray-400 mb-1">
                                    <span>{card.subtitle}</span>
                                    <span>{card.progress}%</span>
                                </div>
                                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div className={cn("h-full rounded-full", card.progressColor)} style={{ width: `${card.progress}%` }}></div>
                                </div>
                            </div>
                        ) : (
                            <p className={cn("text-[9px] lg:text-[11px] mt-auto", card.subtitleColor || "text-gray-400")}>
                                {card.trend === 'up' && <span className={card.trendColor}>↑ </span>}
                                {card.subtitle}
                            </p>
                        )}
                    </div>
                    
                    {/* Subtle top gradient glow on hover */}
                    <div className={cn("absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b opacity-0 group-hover:opacity-10 transition-opacity", card.iconBg.replace('/10', ''))}></div>
                </Link>
            ))}
        </div>
    );
}
