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
            iconColor: 'text-[#b388ff]',
            iconBg: 'bg-[#3e248a]/50',
            colors: 'from-[#2e1d5e]/80 to-[#1c1439]',
            to: '/admin/residents'
        },
        {
            title: 'Total Units',
            value: stats.totalUnits || 0,
            subtitle: `${stats.occupiedUnits || 0} Occupied`,
            icon: Building2,
            iconColor: 'text-[#60a5fa]',
            iconBg: 'bg-[#1d488c]/50',
            colors: 'from-[#143261]/80 to-[#0b1c36]',
            to: '/admin/units'
        },
        {
            title: 'Total Staff',
            value: stats.totalStaff || 0,
            subtitle: 'Active Personnel',
            icon: UserCog,
            iconColor: 'text-[#4ade80]',
            iconBg: 'bg-[#1a4d35]/50',
            colors: 'from-[#123625]/80 to-[#0a1f15]',
            to: '/admin/staff'
        },
        {
            title: 'Pending Approvals',
            value: stats.pendingResidents || 0,
            subtitle: 'Requires attention',
            icon: ClipboardList,
            iconColor: 'text-[#f59e0b]',
            iconBg: 'bg-[#6b4819]/50',
            colors: 'from-[#4a3212]/80 to-[#261909]',
            to: '/admin/pending'
        },
        {
            title: 'Active Complaints',
            value: (stats.complaints?.open || 0) + (stats.complaints?.inProgress || 0),
            subtitle: `${stats.complaints?.escalated || 0} Escalated`,
            icon: AlertCircle,
            iconColor: 'text-[#ef4444]',
            iconBg: 'bg-[#701c22]/50',
            colors: 'from-[#4a1216]/80 to-[#2b0a0d]',
            to: '/admin/complaints'
        },
        {
            title: 'Maintenance Due',
            value: stats.snapshot?.serviceRequests || 0,
            subtitle: 'Upcoming tasks',
            icon: Wrench,
            iconColor: 'text-[#2dd4bf]',
            iconBg: 'bg-[#0f3d38]/50',
            colors: 'from-[#0b2926]/80 to-[#051413]',
            to: '/admin/emergencies' // Or '/admin/complaints' depending on context
        }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 md:gap-4">
            {cards.map((card, index) => (
                <Link 
                    key={index} 
                    to={card.to}
                    className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.colors} p-5 border border-white/5 shadow-lg hover:scale-[1.02] transition-transform block`}
                >
                    {/* Abstract Background Waves (CSS based) */}
                    <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none">
                        <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 80C30 50 60 80 120 20L120 80H0Z" fill="currentColor" className="text-white" />
                            <path d="M20 80C50 40 80 70 120 0L120 80H20Z" fill="currentColor" className="text-white opacity-50" />
                        </svg>
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center backdrop-blur-md`}>
                                <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                            </div>
                            <h3 className="text-gray-300 text-[12px] lg:text-[13px] font-bold tracking-wide leading-tight">{card.title}</h3>
                        </div>
                        <div className="text-white text-2xl lg:text-3xl font-black mb-1 tracking-tight">{card.value}</div>
                        <div className="text-gray-300 text-[12px] lg:text-[12px] font-medium">{card.subtitle}</div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
