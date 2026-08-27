import React from 'react';
import { ChevronDown, CalendarClock, Download } from 'lucide-react';

export function InvoiceTableFilters({
    activeTab,
    handleTabChange,
    statusFilter,
    statusDropdownOpen,
    setStatusDropdownOpen,
    dateDropdownOpen,
    setDateDropdownOpen,
    selectedYear,
    setSelectedYear,
    stats,
    handleStatusDropdownChange,
    setCurrentPage
}) {
    return (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-white/5 p-4 md:p-6 gap-4">
            {/* Tabs */}
            <div className="flex items-center gap-6 border-b border-transparent md:border-b-0 w-full md:w-auto">
                {['ALL', 'PAID', 'UNPAID'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => handleTabChange(tab)}
                        className={`pb-3 md:pb-0 text-sm font-semibold transition-colors relative ${activeTab === tab ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-300'}`}
                    >
                        {tab === 'ALL' ? 'All Invoices' : tab === 'PAID' ? 'Paid Invoices' : 'Unpaid Invoices'}
                        {activeTab === tab && (
                            <div className="absolute -bottom-[18px] md:-bottom-6 left-0 right-0 h-0.5 bg-indigo-500 rounded-t-full shadow-[0_-2px_8px_rgba(99,102,241,0.5)]" />
                        )}
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                
                {/* Status Dropdown */}
                <div className="relative flex-1 md:flex-none">
                    <button 
                        onClick={() => { setStatusDropdownOpen(!statusDropdownOpen); setDateDropdownOpen(false); }}
                        className="w-full flex items-center justify-between gap-3 px-4 py-2 bg-[#0B0D17] border border-white/5 rounded-xl text-xs text-slate-300 hover:border-white/10 transition-colors"
                    >
                        <span>{statusFilter === 'ALL' ? 'All Status' : statusFilter === 'UNPAID' ? 'Unpaid' : statusFilter === 'PAID' ? 'Paid' : statusFilter === 'OVERDUE' ? 'Overdue' : 'Draft'}</span>
                        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${statusDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {statusDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1A1C2A] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 py-1">
                            {['ALL', 'PAID', 'UNPAID', 'OVERDUE', 'DRAFT'].map(s => (
                                <button 
                                    key={s}
                                    onClick={() => handleStatusDropdownChange(s)}
                                    className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-white/5 ${statusFilter === s ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-300'}`}
                                >
                                    {s === 'ALL' ? 'All Status' : s === 'UNPAID' ? 'Unpaid' : s === 'PAID' ? 'Paid' : s === 'OVERDUE' ? 'Overdue' : 'Draft'}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Date/Year Dropdown */}
                <div className="relative flex-1 md:flex-none">
                    <button 
                        onClick={() => { setDateDropdownOpen(!dateDropdownOpen); setStatusDropdownOpen(false); }}
                        className="w-full flex items-center justify-between gap-3 px-4 py-2 bg-[#0B0D17] border border-white/5 rounded-xl text-xs text-slate-300 hover:border-white/10 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <CalendarClock className="w-4 h-4 text-slate-500" />
                            <span>Apr {selectedYear} - Mar {selectedYear + 1}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${dateDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {dateDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1A1C2A] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 py-1 min-w-[160px]">
                            {stats.availableYears.map(year => (
                                <button 
                                    key={year}
                                    onClick={() => { setSelectedYear(year); setDateDropdownOpen(false); setCurrentPage(1); }}
                                    className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-white/5 ${selectedYear === year ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-300'}`}
                                >
                                    Apr {year} - Mar {year + 1}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <button className="p-2 bg-[#0B0D17] border border-white/5 rounded-xl text-slate-400 hover:text-white hover:border-white/10 transition-colors shrink-0">
                    <Download className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
