/**
 * AdminInvoicesPage.jsx — View all society invoices (admin / accountant view).
 */
import React, { useState } from 'react';
import { useGetAllInvoicesQuery } from '../../../store/api/societyAdminApi';
import { Receipt, AlertCircle, RefreshCw, ChevronDown, ChevronUp, IndianRupee } from 'lucide-react';

const STATUS_STYLES = {
    DRAFT:     { cls: 'bg-slate-100 text-slate-500',    label: 'Draft' },
    SENT:      { cls: 'bg-amber-100 text-amber-700',    label: 'Sent' },
    PAID:      { cls: 'bg-emerald-100 text-emerald-700', label: 'Paid' },
    PARTIAL:   { cls: 'bg-blue-100 text-blue-700',      label: 'Partial' },
    OVERDUE:   { cls: 'bg-red-100 text-red-700',        label: 'Overdue' },
    CANCELLED: { cls: 'bg-slate-100 text-slate-400',    label: 'Cancelled' },
};

const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n ?? 0);

function InvoiceRow({ invoice }) {
    const [expanded, setExpanded] = useState(false);
    const s = STATUS_STYLES[invoice.status] ?? STATUS_STYLES.SENT;

    return (
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                    <p className="font-semibold text-slate-900 font-mono text-sm">{invoice.invoiceNumber}</p>
                    <p className="text-xs text-slate-400">Due: {new Date(invoice.dueDate).toLocaleDateString('en-IN')}</p>
                </div>
                <span className={`text-xs font-semibold rounded-full px-2.5 py-0.5 shrink-0 ${s.cls}`}>{s.label}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
                <p className="text-lg font-bold text-slate-900">{fmt(invoice.totalAmount)}</p>
                {invoice.balanceAmount > 0 && (
                    <p className="text-sm text-amber-600 font-semibold">Due: {fmt(invoice.balanceAmount)}</p>
                )}
            </div>
            <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">Resident: <span className="font-medium text-slate-600">{invoice.residentId?.residentCode ?? '—'}</span> · Unit: <span className="font-medium text-slate-600">{invoice.unitId?.unitNumber ?? '—'}</span></p>
                {invoice.lineItems?.length > 0 && (
                    <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                        {expanded ? <><ChevronUp className="h-3.5 w-3.5" /> Hide</> : <><ChevronDown className="h-3.5 w-3.5" /> Details</>}
                    </button>
                )}
            </div>
            {expanded && (
                <div className="mt-4 border-t border-slate-100 pt-4 space-y-1.5">
                    {invoice.lineItems?.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                            <span className="text-slate-600">{item.description}</span>
                            <span className="font-medium text-slate-800">{fmt(item.amount)}</span>
                        </div>
                    ))}
                    <div className="flex justify-between text-sm font-bold text-slate-900 pt-1.5 border-t border-slate-100">
                        <span>Total</span><span>{fmt(invoice.totalAmount)}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AdminInvoicesPage() {
    const [statusFilter, setStatusFilter] = useState('');
    const { data, isLoading, isError, refetch } = useGetAllInvoicesQuery({ status: statusFilter || undefined });
    const invoices = data?.data ?? [];

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Invoice Management</h1>
                    <p className="text-sm text-slate-500 mt-0.5">All society invoices and billing</p>
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                    <option value="">All Statuses</option>
                    {Object.keys(STATUS_STYLES).map(s => <option key={s} value={s}>{STATUS_STYLES[s].label}</option>)}
                </select>
            </div>

            {isError && (
                <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-600 ring-1 ring-red-200">
                    <AlertCircle className="h-5 w-5 shrink-0" /> Failed to load invoices. <button onClick={refetch} className="underline ml-1">Retry</button>
                </div>
            )}

            {isLoading ? (
                <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-200" />)}</div>
            ) : invoices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50"><Receipt className="h-8 w-8 text-indigo-400" /></div>
                    <p className="font-semibold text-slate-700">No invoices found</p>
                </div>
            ) : (
                <div className="space-y-3">{invoices.map(inv => <InvoiceRow key={inv._id} invoice={inv} />)}</div>
            )}
        </div>
    );
}
