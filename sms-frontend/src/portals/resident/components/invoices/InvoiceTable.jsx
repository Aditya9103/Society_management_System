import React from 'react';
import { FileText, MoreVertical, Download, ChevronLeft, ChevronRight, Receipt } from 'lucide-react';
import { format, isPast } from 'date-fns';

export function InvoiceTable({
    isLoading,
    filteredInvoices,
    paginatedInvoices,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    totalPages,
    formatCurrency,
    getStatusDisplay,
    handlePayNow,
    handleDownload
}) {
    return (
        <>
            <div className="overflow-x-auto">
                {isLoading ? (
                    <div className="p-8 space-y-4">
                        {[...Array(5)].map((_, i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-white/5" />)}
                    </div>
                ) : filteredInvoices.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                            <Receipt className="w-8 h-8 text-slate-600" />
                        </div>
                        <h3 className="text-lg font-bold text-white">No invoices found</h3>
                        <p className="text-sm text-slate-500 mt-1">There are no invoices matching your current filters.</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="px-6 py-4 text-[10px] font-bold tracking-wider text-slate-500 uppercase whitespace-nowrap">Invoice ID</th>
                                <th className="px-6 py-4 text-[10px] font-bold tracking-wider text-slate-500 uppercase whitespace-nowrap">Description</th>
                                <th className="px-6 py-4 text-[10px] font-bold tracking-wider text-slate-500 uppercase whitespace-nowrap">Billing Period</th>
                                <th className="px-6 py-4 text-[10px] font-bold tracking-wider text-slate-500 uppercase whitespace-nowrap">Due Date</th>
                                <th className="px-6 py-4 text-[10px] font-bold tracking-wider text-slate-500 uppercase whitespace-nowrap">Amount</th>
                                <th className="px-6 py-4 text-[10px] font-bold tracking-wider text-slate-500 uppercase whitespace-nowrap">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold tracking-wider text-slate-500 uppercase whitespace-nowrap text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {paginatedInvoices.map((inv) => {
                                const { label, color } = getStatusDisplay(inv.status);
                                const isPaid = label === 'PAID';
                                const primaryCharge = inv.lineItems?.[0]?.description || 'Maintenance Charge';
                                const secondaryText = inv.lineItems?.[0]?.chargeType === 'SINKING_FUND' ? 'Quarterly Contribution' : 
                                                    inv.lineItems?.[0]?.chargeType === 'WATER_CHARGES' ? 'Water Consumption' : 'Monthly Maintenance';
                                
                                const dueDate = new Date(inv.dueDate);
                                const isOverdue = isPast(dueDate) && !isPaid;

                                return (
                                    <tr key={inv._id} className="hover:bg-white/[0.02] transition-colors group">
                                        {/* Invoice ID */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg border ${isPaid ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : isOverdue ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}>
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-200">{inv.invoiceNumber}</p>
                                                    <p className="text-xs text-slate-500">{format(new Date(inv.invoiceDate), 'dd MMM yyyy')}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Description */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="text-sm font-bold text-slate-200">{primaryCharge}</p>
                                            <p className="text-xs text-slate-500">{secondaryText}</p>
                                        </td>

                                        {/* Billing Period */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="text-sm font-medium text-slate-300">{format(new Date(inv.billingPeriodStart), 'MMM yyyy')}</p>
                                            <p className="text-xs text-slate-500">
                                                {format(new Date(inv.billingPeriodStart), 'dd MMM')} - {format(new Date(inv.billingPeriodEnd), 'dd MMM')}
                                            </p>
                                        </td>

                                        {/* Due Date */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="text-sm font-medium text-slate-300">{format(dueDate, 'dd MMM yyyy')}</p>
                                            {isOverdue && <p className="text-xs font-bold text-rose-400">Overdue</p>}
                                        </td>

                                        {/* Amount */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="text-sm font-bold text-white">{formatCurrency(inv.totalAmount)}</p>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center justify-center px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-md border ${color}`}>
                                                {label}
                                            </span>
                                        </td>

                                        {/* Action */}
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {!isPaid ? (
                                                    <button 
                                                        onClick={handlePayNow}
                                                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                                                    >
                                                        Pay Now
                                                    </button>
                                                ) : (
                                                    <button 
                                                        onClick={handleDownload}
                                                        className="p-1.5 border border-white/10 hover:border-white/20 text-slate-400 hover:text-white rounded-lg transition-colors"
                                                        title="Download PDF"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button className="p-1.5 text-slate-500 hover:text-white rounded-lg transition-colors">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination Footer */}
            {filteredInvoices.length > 0 && (
                <div className="border-t border-white/5 p-4 flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredInvoices.length)} of {filteredInvoices.length} invoices
                    </span>
                    <div className="flex items-center gap-1.5">
                        <button 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-1.5 rounded-lg border border-white/5 text-slate-400 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold border transition-colors ${
                                    currentPage === i + 1 
                                    ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400' 
                                    : 'border-transparent text-slate-400 hover:bg-white/5'
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-1.5 rounded-lg border border-white/5 text-slate-400 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
