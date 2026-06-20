/**
 * ResidentInvoicesPage.jsx — View billing history and invoices.
 */
import React, { useState } from 'react';
import { useGetMyInvoicesQuery } from '../../../store/api/residentApi';
import { Receipt, AlertCircle, RefreshCw, ChevronDown, ChevronUp, CreditCard, Calendar, IndianRupee } from 'lucide-react';

const STATUS_STYLES = {
    DRAFT:     { cls: 'bg-slate-100 text-slate-500',   label: 'Draft' },
    SENT:      { cls: 'bg-amber-100 text-amber-700',   label: 'Due' },
    PAID:      { cls: 'bg-emerald-100 text-emerald-700', label: 'Paid' },
    PARTIAL:   { cls: 'bg-blue-100 text-blue-700',     label: 'Partial' },
    OVERDUE:   { cls: 'bg-red-100 text-red-700',       label: 'Overdue' },
    CANCELLED: { cls: 'bg-slate-100 text-slate-400',   label: 'Cancelled' },
    WAIVED:    { cls: 'bg-purple-100 text-purple-700', label: 'Waived' },
};

const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n ?? 0);

function InvoiceCard({ invoice }) {
    const [expanded, setExpanded] = useState(false);
    const s = STATUS_STYLES[invoice.status] ?? STATUS_STYLES.SENT;
    const isOverdue = invoice.status === 'OVERDUE';
    const isPaid = invoice.status === 'PAID';

    return (
        <div className={`rounded-2xl bg-white shadow-sm ring-1 transition ${isOverdue ? 'ring-red-200' : 'ring-slate-100'}`}>
            <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                        <p className="font-semibold text-slate-900">{invoice.invoiceNumber}</p>
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            Due: {new Date(invoice.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                    </div>
                    <span className={`text-xs font-semibold rounded-full px-2.5 py-0.5 shrink-0 ${s.cls}`}>{s.label}</span>
                </div>

                <div className="flex items-center justify-between mb-3">
                    <div>
                        <p className="text-xs text-slate-400">Total Amount</p>
                        <p className="text-xl font-bold text-slate-900">{fmt(invoice.totalAmount)}</p>
                    </div>
                    {!isPaid && invoice.balanceAmount > 0 && (
                        <div className="text-right">
                            <p className="text-xs text-slate-400">Balance Due</p>
                            <p className={`text-lg font-bold ${isOverdue ? 'text-red-600' : 'text-amber-600'}`}>{fmt(invoice.balanceAmount)}</p>
                        </div>
                    )}
                    {isPaid && (
                        <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-semibold">
                            <CreditCard className="h-4 w-4" /> Paid
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between">
                    <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                        {expanded ? <><ChevronUp className="h-3.5 w-3.5" /> Hide details</> : <><ChevronDown className="h-3.5 w-3.5" /> View line items</>}
                    </button>
                    {!isPaid && invoice.balanceAmount > 0 && (
                        <button className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition"
                            onClick={() => alert('Razorpay integration coming soon!')}>
                            <IndianRupee className="h-3.5 w-3.5" /> Pay Now
                        </button>
                    )}
                </div>

                {expanded && invoice.lineItems?.length > 0 && (
                    <div className="mt-4 border-t border-slate-100 pt-4">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Line Items</p>
                        <div className="space-y-2">
                            {invoice.lineItems.map((item, i) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600">{item.description}</span>
                                    <span className="font-semibold text-slate-800">{fmt(item.amount)}</span>
                                </div>
                            ))}
                        </div>
                        {invoice.taxAmount > 0 && (
                            <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-slate-100">
                                <span className="text-slate-500">Tax ({invoice.taxPercentage}%)</span>
                                <span className="text-slate-600">{fmt(invoice.taxAmount)}</span>
                            </div>
                        )}
                        <div className="flex items-center justify-between text-sm font-bold text-slate-900 mt-2 pt-2 border-t border-slate-200">
                            <span>Total</span>
                            <span>{fmt(invoice.totalAmount)}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ResidentInvoicesPage() {
    const { data, isLoading, isError, refetch } = useGetMyInvoicesQuery();
    const invoices = data?.data ?? [];

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Invoices & Billing</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Your maintenance and society charges</p>
                </div>
                <button onClick={refetch} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 transition">
                    <RefreshCw className="h-4 w-4" /> Refresh
                </button>
            </div>

            {isError && (
                <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-600 ring-1 ring-red-200">
                    <AlertCircle className="h-5 w-5 shrink-0" /> Failed to load invoices. <button onClick={refetch} className="underline ml-1">Retry</button>
                </div>
            )}

            {isLoading ? (
                <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-200" />)}</div>
            ) : invoices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
                        <Receipt className="h-8 w-8 text-indigo-400" />
                    </div>
                    <p className="font-semibold text-slate-700">No invoices yet</p>
                    <p className="text-sm text-slate-400 mt-1">Your billing history will appear here.</p>
                </div>
            ) : (
                <div className="space-y-3">{invoices.map(inv => <InvoiceCard key={inv._id} invoice={inv} />)}</div>
            )}
        </div>
    );
}
