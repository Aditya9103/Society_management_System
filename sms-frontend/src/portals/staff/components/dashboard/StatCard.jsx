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

const CARD_COLORS = {
    emerald: 'bg-emerald-500 shadow-emerald-200',
    blue: 'bg-blue-500 shadow-blue-200',
    violet: 'bg-violet-500 shadow-violet-200',
    amber: 'bg-amber-500 shadow-amber-200',
    indigo: 'bg-indigo-500 shadow-indigo-200',
    slate: 'bg-slate-500 shadow-slate-200',
};

export default function StatCard({ card }) {
    const colorClass = CARD_COLORS[card.color] ?? CARD_COLORS.slate;
    return (
        <Card className="overflow-hidden">
            <Card.Body className="p-5">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{card.label}</p>
                        <p className="mt-2 text-3xl font-bold text-slate-900">{card.value ?? 0}</p>
                    </div>
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-lg ${colorClass}`}>
                        {ICONS[card.icon] ?? ICONS.Building2}
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
}
