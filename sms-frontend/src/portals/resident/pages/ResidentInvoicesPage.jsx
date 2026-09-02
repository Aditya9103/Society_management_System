import React, { useState, useMemo } from 'react';
import { useGetMyInvoicesQuery } from '../../../store/api/residentApi';
import { RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { isPast, isSameYear } from 'date-fns';
import Alert from '../../../components/ui/Alert';

import { InvoiceStatsCards } from '../components/invoices/InvoiceStatsCards';
import { InvoiceTableFilters } from '../components/invoices/InvoiceTableFilters';
import { InvoiceTable } from '../components/invoices/InvoiceTable';

export default function ResidentInvoicesPage() {
    const { data, isLoading, isError, refetch, isFetching } = useGetMyInvoicesQuery();
    const invoices = data?.data ?? [];

    const [activeTab, setActiveTab] = useState('ALL'); // ALL, PAID, UNPAID
    const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, PAID, UNPAID, OVERDUE, DRAFT
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
    const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
    
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Handle Tab Click
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setStatusFilter(tab);
        setCurrentPage(1);
    };

    // Handle Dropdown Status
    const handleStatusDropdownChange = (status) => {
        setStatusFilter(status);
        if (['ALL', 'PAID', 'UNPAID'].includes(status)) {
            setActiveTab(status);
        } else {
            // If they pick OVERDUE, make activeTab UNPAID for visual sync
            if (status === 'OVERDUE' || status === 'DRAFT') setActiveTab('UNPAID');
        }
        setStatusDropdownOpen(false);
        setCurrentPage(1);
    };

    // Derived Statistics
    const stats = useMemo(() => {
        let totalOutstanding = 0;
        let unpaidCount = 0;
        let totalPaid = 0;
        let paidCount = 0;
        let paidThisYear = 0;
        let nextDueDate = null;

        const currentYear = new Date().getFullYear();

        invoices.forEach(inv => {
            const isUnpaid = ['DRAFT', 'SENT', 'OVERDUE', 'PARTIAL'].includes(inv.status);
            const isPaid = inv.status === 'PAID';

            if (isUnpaid) {
                totalOutstanding += inv.totalAmount;
                unpaidCount += 1;
                
                const dueDate = new Date(inv.dueDate);
                if (!nextDueDate || dueDate < nextDueDate) {
                    nextDueDate = dueDate;
                }
            } else if (isPaid) {
                totalPaid += inv.totalAmount;
                paidCount += 1;
                
                if (inv.paymentDate && isSameYear(new Date(inv.paymentDate), new Date())) {
                    paidThisYear += inv.totalAmount;
                }
            }
        });

        // Available years for the dropdown based on invoice dates
        const years = Array.from(new Set(invoices.map(inv => new Date(inv.billingPeriodStart).getFullYear()))).sort((a,b) => b-a);
        if (years.length === 0) years.push(currentYear);

        return {
            totalOutstanding, unpaidCount,
            totalPaid, paidCount,
            paidThisYear,
            nextDueDate,
            currentYear,
            availableYears: years
        };
    }, [invoices]);

    // Filtering
    const filteredInvoices = useMemo(() => {
        return invoices.filter(inv => {
            // Status Filter Logic
            let matchesStatus = true;
            if (statusFilter === 'PAID') matchesStatus = inv.status === 'PAID';
            else if (statusFilter === 'UNPAID') matchesStatus = ['DRAFT', 'SENT', 'OVERDUE', 'PARTIAL'].includes(inv.status);
            else if (statusFilter === 'OVERDUE') matchesStatus = inv.status === 'OVERDUE' || (['DRAFT', 'SENT', 'PARTIAL'].includes(inv.status) && isPast(new Date(inv.dueDate)));
            else if (statusFilter === 'DRAFT') matchesStatus = inv.status === 'DRAFT';

            // Date Filter Logic (Match billing year)
            const matchesYear = new Date(inv.billingPeriodStart).getFullYear() === selectedYear;

            return matchesStatus && matchesYear;
        }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [invoices, statusFilter, selectedYear]);

    // Pagination
    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage) || 1;
    const paginatedInvoices = filteredInvoices.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePayNow = (e) => {
        e.stopPropagation();
        toast('Payment gateway integration coming soon!', { icon: '💳' });
    };

    const handleDownload = (e) => {
        e.stopPropagation();
        toast('Downloading invoice...', { icon: '⬇️' });
    };

    // Formatters
    const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    
    const getStatusDisplay = (status) => {
        if (status === 'PAID') return { label: 'PAID', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
        if (status === 'OVERDUE') return { label: 'OVERDUE', color: 'text-red-400 bg-red-500/10 border-red-500/20' };
        if (['DRAFT', 'SENT', 'PARTIAL'].includes(status)) return { label: 'UNPAID', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
        return { label: status, color: 'text-white font-bold bg-slate-500/10 border-slate-500/20' };
    };

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 pb-20">
            {/* Custom Header Area to match mockup exactly */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Invoices & Billing</h1>
                    <p className="text-sm text-white font-bold">Your maintenance and society charges in one place.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handlePayNow} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-colors">
                        <span>+ Pay Now</span>
                    </button>
                    <button onClick={refetch} disabled={isFetching} className="p-2.5 bg-[#131525] border border-white/10 hover:border-white/20 text-white font-bold hover:text-white rounded-xl transition-colors">
                        <RefreshCw className={`w-5 h-5 ${isFetching ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {isError && (
                <Alert type="error">
                    Failed to load invoices. <button onClick={refetch} className="underline ml-1">Retry</button>
                </Alert>
            )}

            <InvoiceStatsCards stats={stats} formatCurrency={formatCurrency} onCardClick={handleTabChange} />

            {/* Main Table Section */}
            <div className="bg-[#131525] border border-white/5 rounded-3xl overflow-hidden flex flex-col">
                <InvoiceTableFilters 
                    activeTab={activeTab}
                    handleTabChange={handleTabChange}
                    statusFilter={statusFilter}
                    statusDropdownOpen={statusDropdownOpen}
                    setStatusDropdownOpen={setStatusDropdownOpen}
                    dateDropdownOpen={dateDropdownOpen}
                    setDateDropdownOpen={setDateDropdownOpen}
                    selectedYear={selectedYear}
                    setSelectedYear={setSelectedYear}
                    stats={stats}
                    handleStatusDropdownChange={handleStatusDropdownChange}
                    setCurrentPage={setCurrentPage}
                />
                
                <InvoiceTable 
                    isLoading={isLoading}
                    filteredInvoices={filteredInvoices}
                    paginatedInvoices={paginatedInvoices}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    totalPages={totalPages}
                    formatCurrency={formatCurrency}
                    getStatusDisplay={getStatusDisplay}
                    handlePayNow={handlePayNow}
                    handleDownload={handleDownload}
                />
            </div>
        </div>
    );
}
