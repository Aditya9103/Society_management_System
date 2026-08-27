import React from 'react';
import { Receipt, Wallet, CalendarDays, FileText } from 'lucide-react';
import { format } from 'date-fns';

export function InvoiceStatsCards({ stats, formatCurrency }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Outstanding */}
            <div className="bg-[#131525] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                    <Receipt className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                    <p className="text-xs text-slate-400 font-medium mb-1">Total Outstanding</p>
                    <p className="text-2xl font-bold text-white mb-1">{formatCurrency(stats.totalOutstanding)}</p>
                    <p className="text-[11px] font-medium text-rose-400">{stats.unpaidCount} Unpaid Invoices</p>
                </div>
            </div>

            {/* Total Paid */}
            <div className="bg-[#131525] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <Wallet className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                    <p className="text-xs text-slate-400 font-medium mb-1">Total Paid</p>
                    <p className="text-2xl font-bold text-white mb-1">{formatCurrency(stats.totalPaid)}</p>
                    <p className="text-[11px] font-medium text-emerald-400">{stats.paidCount} Paid Invoices</p>
                </div>
            </div>

            {/* Paid This Year */}
            <div className="bg-[#131525] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                    <CalendarDays className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                    <p className="text-xs text-slate-400 font-medium mb-1">Paid This Year</p>
                    <p className="text-2xl font-bold text-white mb-1">{formatCurrency(stats.paidThisYear)}</p>
                    <p className="text-[11px] font-medium text-slate-500">{stats.currentYear} - {stats.currentYear + 1}</p>
                </div>
            </div>

            {/* Next Due Date */}
            <div className="bg-[#131525] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                    <p className="text-xs text-slate-400 font-medium mb-1">Next Due Date</p>
                    <p className="text-2xl font-bold text-white mb-1">{stats.nextDueDate ? format(stats.nextDueDate, 'dd MMM yyyy') : '--'}</p>
                    <p className="text-[11px] font-medium text-blue-400">{stats.nextDueDate ? formatCurrency(stats.totalOutstanding) : 'No pending dues'}</p>
                </div>
            </div>
        </div>
    );
}
