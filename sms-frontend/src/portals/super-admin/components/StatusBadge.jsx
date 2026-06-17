import React from 'react';
import { cn } from '../../../components/ui/Button';

const variants = {
    active: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
    inactive: 'bg-red-100 text-red-600 ring-1 ring-red-200',
};

/**
 * StatusBadge — renders a coloured pill based on boolean isActive.
 * @param {boolean} isActive
 * @param {string} [className]
 */
export default function StatusBadge({ isActive, className }) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
                isActive ? variants.active : variants.inactive,
                className,
            )}
        >
            <span
                className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`}
            />
            {isActive ? 'Active' : 'Inactive'}
        </span>
    );
}
