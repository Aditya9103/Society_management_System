import React from 'react';
import { cn } from '../../../../components/ui/Button';

const COLOR_MAP = {
    emerald: 'bg-emerald-500',
    blue:    'bg-blue-500',
    violet:  'bg-violet-500',
    amber:   'bg-amber-500',
};

export default function StatCard({ label, value, icon: Icon, color }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{value ?? 0}</p>
                </div>
                <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-lg', COLOR_MAP[color] ?? 'bg-gray-500')}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
        </div>
    );
}
