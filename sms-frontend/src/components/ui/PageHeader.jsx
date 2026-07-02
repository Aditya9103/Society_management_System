/**
 * PageHeader.jsx — Standard page header: title, subtitle, refresh, actions.
 * Uses cn utility.
 */
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from './Button';

export default function PageHeader({ title, subtitle, onRefresh, isFetching, actions, className }) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-3', className)}>
      <div className="min-w-0">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">{title}</h1>
        {subtitle && <p className="mt-1 text-sm font-medium text-slate-500">{subtitle}</p>}
      </div>
      <div className="flex w-full sm:w-auto shrink-0 items-center gap-2">
        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Refresh"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-800 active:scale-[0.98]"
          >
            <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin text-indigo-600')} />
          </button>
        )}
        <div className="flex-1 sm:flex-none w-full">{actions}</div>
      </div>
    </div>
  );
}
