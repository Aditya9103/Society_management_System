import React from 'react';
import { Users, Grid3X3, Home, Building2, Clock } from 'lucide-react';
import Card from '../../../../components/ui/Card';

const ICONS = {
    Users: <Users className="h-6 w-6" />,
    Grid3X3: <Grid3X3 className="h-6 w-6" />,
    Home: <Home className="h-6 w-6" />,
    HomeIcon: <Home className="h-6 w-6" />,
    Building2: <Building2 className="h-6 w-6" />,
    Clock: <Clock className="h-6 w-6" />,
};

const GRADIENTS = {
    emerald: 'from-[#123625]/80 to-[#0a1f15]',
    blue:    'from-[#143261]/80 to-[#0b1c36]',
    violet:  'from-[#2e1d5e]/80 to-[#1c1439]',
    amber:   'from-[#4a3212]/80 to-[#261909]',
    rose:    'from-[#4a1216]/80 to-[#2b0a0d]',
    indigo:  'from-[#2e1d5e]/80 to-[#1c1439]',
    slate:   'from-[#1e293b]/80 to-[#0f172a]'
};
const ICON_BGS = {
    emerald: 'bg-[#1a4d35]/50 text-[#4ade80]',
    blue:    'bg-[#1d488c]/50 text-[#60a5fa]',
    violet:  'bg-[#3e248a]/50 text-[#b388ff]',
    amber:   'bg-[#6b4819]/50 text-[#f59e0b]',
    rose:    'bg-[#701c22]/50 text-[#f87171]',
    indigo:  'bg-[#3e248a]/50 text-[#b388ff]',
    slate:   'bg-[#334155]/50 text-[#94a3b8]'
};

export default function StatCard({ card }) {
    const colors = GRADIENTS[card.color] || GRADIENTS.slate;
    const iconBg = ICON_BGS[card.color] || ICON_BGS.slate;

    return (
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colors} p-5 border border-white/5 shadow-lg`}>
            {/* Abstract Background Waves (CSS based) */}
            <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none">
                <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 80C30 50 60 80 120 20L120 80H0Z" fill="currentColor" className="text-white" />
                    <path d="M20 80C50 40 80 70 120 0L120 80H20Z" fill="currentColor" className="text-white opacity-50" />
                </svg>
            </div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center backdrop-blur-md`}>
                        {ICONS[card.icon] ?? ICONS.Building2}
                    </div>
                    <h3 className="text-gray-300 text-[13px] font-bold tracking-wide">{card.label}</h3>
                </div>
                <div className="text-white text-3xl font-black mb-1 tracking-tight">{card.value ?? 0}</div>
            </div>
        </div>
    );
}
