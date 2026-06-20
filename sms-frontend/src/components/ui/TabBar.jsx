import React from 'react';
import { cn } from './Button';

export default function TabBar({ tabs, value, onChange, className }) {
  return (
    <div className={cn('flex overflow-x-auto rounded-lg bg-gray-100 p-1', className)} role="tablist">
      {tabs.map((tab) => {
        const isActive = tab.value === value;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all',
              isActive ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn(
                'rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none',
                isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-500'
              )}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
