import React, { useState } from 'react';
import { Calendar, ChevronDown, ChevronUp, CreditCard, IndianRupee } from 'lucide-react';
import StatusBadge from '../../../../components/ui/StatusBadge';
import { Button } from '../../../../components/ui/Button';

const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n ?? 0);

export function InvoiceCard({ invoice }) {
    const [expanded, setExpanded] = useState(false);
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
                    <StatusBadge status={invoice.status} />
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
                        <Button size="sm" onClick={() => alert('Razorpay integration coming soon!')}>
                            <IndianRupee className="h-3.5 w-3.5 mr-1" /> Pay Now
                        </Button>
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
