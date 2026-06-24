import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import StatusBadge from '../../../../components/ui/StatusBadge';

const STATUS_MAP = {
    DRAFT: 'NEUTRAL',
    SENT: 'WARNING',
    PAID: 'SUCCESS',
    PARTIAL: 'INFO',
    OVERDUE: 'ERROR',
    CANCELLED: 'NEUTRAL',
};

const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n ?? 0);

export default function InvoiceRow({ invoice }) {
    const [expanded, setExpanded] = useState(false);
    const statusType = STATUS_MAP[invoice.status] || 'NEUTRAL';

    return (
        <Card>
            <Card.Body>
                <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                        <p className="font-semibold text-slate-900 font-mono text-sm">{invoice.invoiceNumber}</p>
                        <p className="text-xs text-slate-400">Due: {new Date(invoice.dueDate).toLocaleDateString('en-IN')}</p>
                    </div>
                    <StatusBadge status={invoice.status} type={statusType} />
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
            </Card.Body>
        </Card>
    );
}
