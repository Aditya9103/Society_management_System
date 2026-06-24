import React from 'react';
import { cn } from './Button';

const STATUS_MAP = {
  // Registration
  APPROVED:           'bg-green-100 text-green-700 ring-green-200/60',
  PENDING_APPROVAL:   'bg-amber-100 text-amber-700 ring-amber-200/60',
  REJECTED:           'bg-red-100 text-red-700 ring-red-200/60',
  UNVERIFIED:         'bg-gray-100 text-gray-600 ring-gray-200/60',
  INCOMPLETE_PROFILE: 'bg-blue-100 text-blue-700 ring-blue-200/60',
  // General
  ACTIVE:             'bg-green-100 text-green-700 ring-green-200/60',
  INACTIVE:           'bg-gray-100 text-gray-500 ring-gray-200/60',
  // Unit occupancy
  VACANT:             'bg-sky-100 text-sky-700 ring-sky-200/60',
  OWNER_OCCUPIED:     'bg-indigo-100 text-indigo-700 ring-indigo-200/60',
  RENTED:             'bg-purple-100 text-purple-700 ring-purple-200/60',
  // Unit types
  RESIDENTIAL:        'bg-indigo-100 text-indigo-700 ring-indigo-200/60',
  COMMERCIAL:         'bg-orange-100 text-orange-700 ring-orange-200/60',
  // Roles
  SOCIETY_ADMIN:      'bg-indigo-100 text-indigo-700 ring-indigo-200/60',
  ACCOUNTANT:         'bg-teal-100 text-teal-700 ring-teal-200/60',
  FACILITY_MGR:       'bg-cyan-100 text-cyan-700 ring-cyan-200/60',
  COMMITTEE:          'bg-violet-100 text-violet-700 ring-violet-200/60',
  HELPDESK:           'bg-pink-100 text-pink-700 ring-pink-200/60',
  GUARD:              'bg-amber-100 text-amber-700 ring-amber-200/60',
  RESIDENT:           'bg-emerald-100 text-emerald-700 ring-emerald-200/60',
  // Complaints
  OPEN:               'bg-amber-100 text-amber-700 ring-amber-200/60',
  IN_PROGRESS:        'bg-blue-100 text-blue-700 ring-blue-200/60',
  RESOLVED:           'bg-emerald-100 text-emerald-700 ring-emerald-200/60',
  CLOSED:             'bg-slate-100 text-slate-500 ring-slate-200/60',
  // Visitors / Invoices (shared)
  PENDING:            'bg-amber-100 text-amber-700 ring-amber-200/60',
  INSIDE:             'bg-blue-100 text-blue-700 ring-blue-200/60',
  EXITED:             'bg-slate-100 text-slate-500 ring-slate-200/60',
  DENIED:             'bg-red-100 text-red-600 ring-red-200/60',
  CANCELLED:          'bg-slate-100 text-slate-400 ring-slate-200/60',
  EXPIRED:            'bg-slate-100 text-slate-400 ring-slate-200/60',
  // Invoices
  DRAFT:              'bg-slate-100 text-slate-500 ring-slate-200/60',
  SENT:               'bg-amber-100 text-amber-700 ring-amber-200/60',
  PAID:               'bg-emerald-100 text-emerald-700 ring-emerald-200/60',
  PARTIAL:            'bg-blue-100 text-blue-700 ring-blue-200/60',
  OVERDUE:            'bg-red-100 text-red-700 ring-red-200/60',
  // Notices (Types)
  GENERAL:            'bg-slate-100 text-slate-600 ring-slate-200/60',
  MAINTENANCE:        'bg-amber-100 text-amber-700 ring-amber-200/60',
  FINANCIAL:          'bg-emerald-100 text-emerald-700 ring-emerald-200/60',
  EMERGENCY:          'bg-red-100 text-red-700 ring-red-200/60',
  EVENT:              'bg-purple-100 text-purple-700 ring-purple-200/60',
  LEGAL:              'bg-blue-100 text-blue-700 ring-blue-200/60',
  PARKING:            'bg-indigo-100 text-indigo-700 ring-indigo-200/60',
  MEETING:            'bg-cyan-100 text-cyan-700 ring-cyan-200/60',
  // Priorities
  LOW:                'bg-slate-100 text-slate-500 ring-slate-200/60',
  NORMAL:             'bg-blue-100 text-blue-600 ring-blue-200/60',
  HIGH:               'bg-orange-100 text-orange-700 ring-orange-200/60',
  URGENT:             'bg-red-100 text-red-700 ring-red-200/60',
};

export default function StatusBadge({ status, className }) {
  const colorClass = STATUS_MAP[status] ?? 'bg-gray-100 text-gray-500 ring-gray-200/60';
  const label = status?.replace(/_/g, ' ') ?? '—';
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1', colorClass, className)}>
      {label}
    </span>
  );
}
