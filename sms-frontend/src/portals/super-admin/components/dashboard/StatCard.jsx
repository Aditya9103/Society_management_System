import React from 'react';
import { cn } from '../../../../components/ui/Button';

export default function StatCard({ label, value, icon: Icon, color, subLabel, subValue }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{label}</p>
                    <p className="mt-1 text-3xl font-bold text-gray-900">
                        {value ?? <span className="text-gray-300">—</span>}
                    </p>
                </div>
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', color)}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
            </div>
            {subLabel && (
                <p className="mt-3 text-xs text-gray-400">
                    <span className="font-medium text-green-600">{subValue}</span> {subLabel}
                </p>
            )}
        </div>
    );
}
