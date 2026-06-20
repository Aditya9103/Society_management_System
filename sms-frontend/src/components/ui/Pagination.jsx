/**
 * Pagination.jsx — Page navigation controls using cn utility.
 */
import { cn } from './Button';

export default function Pagination({ pagination, page, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { total, limit, totalPages } = pagination;
  const from = Math.min((page - 1) * limit + 1, total);
  const to   = Math.min(page * limit, total);

  const btnCls = cn(
    'rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600',
    'hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40'
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
      <p>
        <span className="font-medium text-slate-700">{from}–{to}</span>
        {' '}of{' '}
        <span className="font-medium text-slate-700">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        <button disabled={page <= 1} onClick={() => onPageChange(page - 1)} className={btnCls}>
          Previous
        </button>
        <span className="text-xs">Page {page}/{totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} className={btnCls}>
          Next
        </button>
      </div>
    </div>
  );
}
