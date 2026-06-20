/**
 * Table.jsx — Reusable data table using cn utility.
 *
 * Compound sub-components:
 *   Table           — outer scroll wrapper + border
 *   Table.Head      — <thead>
 *   Table.HeadCell  — <th>
 *   Table.Body      — <tbody>
 *   Table.Row       — <tr>
 *   Table.Cell      — <td>
 *   Table.Loader    — skeleton rows while loading
 */
import React from 'react';
import { cn } from './Button';

function Table({ children, className }) {
  return (
    <div className={cn('overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100', className)}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-max text-left text-sm">
          {children}
        </table>
      </div>
    </div>
  );
}

Table.Head = function TableHead({ children, className }) {
  return (
    <thead className={cn('border-b border-slate-100 bg-slate-50/70', className)}>
      <tr>{children}</tr>
    </thead>
  );
};

Table.HeadCell = function TableHeadCell({ children, className }) {
  return (
    <th className={cn('px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500', className)}>
      {children}
    </th>
  );
};

Table.Body = function TableBody({ children, className }) {
  return (
    <tbody className={cn('divide-y divide-slate-50 bg-white', className)}>
      {children}
    </tbody>
  );
};

Table.Row = function TableRow({ children, className }) {
  return (
    <tr className={cn('transition-colors hover:bg-slate-50/60', className)}>
      {children}
    </tr>
  );
};

Table.Cell = function TableCell({ children, className }) {
  return (
    <td className={cn('px-5 py-3.5', className)}>
      {children}
    </td>
  );
};

Table.Loader = function TableLoader({ rows = 6, cols = 4 }) {
  return (
    <tbody className="divide-y divide-slate-50 bg-white">
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-5 py-4">
              <div className={cn('h-4 animate-pulse rounded bg-slate-100', j === 0 ? 'w-32' : 'w-20')} />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
};

export { Table };
export default Table;
