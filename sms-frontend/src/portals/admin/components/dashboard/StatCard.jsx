import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../../../components/ui/Button';

export default function StatCard({ label, value, icon: Icon, gradient, subLabel, subValue, to }) {
    const content = (
        <div className={cn('relative overflow-hidden rounded-2xl p-6 text-white shadow-lg transition-transform hover:-translate-y-0.5 hover:shadow-xl', gradient)}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-white/75">{label}</p>
                    <p className="mt-1 text-4xl font-bold tracking-tight">
                        {value ?? <span className="text-white/40">—</span>}
                    </p>
                    {subLabel && (
                        <p className="mt-2 text-xs text-white/65">
                            <span className="font-semibold text-white/90">{subValue}</span> {subLabel}
                        </p>
                    )}
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                    <Icon className="h-6 w-6 text-white" />
                </div>
            </div>
            {/* Decorative blob */}
            <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-white/10" />
        </div>
    );

    return to ? <Link to={to}>{content}</Link> : content;
}
