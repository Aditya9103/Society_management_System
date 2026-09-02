import React from 'react';
import { Receipt, Wallet, CalendarDays, FileText } from 'lucide-react';
import { format } from 'date-fns';

const StatCard = ({ icon: Icon, title, value, subtitle, iconBg, gradient, onClick }) => (
    <div 
        onClick={onClick}
        className={`relative overflow-hidden rounded-[20px] bg-gradient-to-br ${gradient} border border-white/5 p-5 flex flex-col justify-between transition-transform hover:scale-[1.02] shadow-lg ${onClick ? 'cursor-pointer' : ''}`}
    >
        {/* Abstract Background Waves (CSS based) */}
        <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none">
            <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 80C30 50 60 80 120 20L120 80H0Z" fill="currentColor" className="text-white" />
                <path d="M20 80C50 40 80 70 120 0L120 80H20Z" fill="currentColor" className="text-white opacity-50" />
            </svg>
        </div>
        
        <div className="relative z-10 flex items-start gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg} shrink-0 backdrop-blur-md`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-[12px] font-semibold text-white font-bold mb-0.5 tracking-wide">{title}</p>
                <div className="text-2xl font-bold text-white tracking-tight mb-1">{value}</div>
                <p className="text-[10px] text-white font-bold font-bold">{subtitle}</p>
            </div>
        </div>
    </div>
);

export function InvoiceStatsCards({ stats, formatCurrency, onCardClick }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
                icon={Receipt}
                title="Total Outstanding"
                value={formatCurrency(stats.totalOutstanding)}
                subtitle={`${stats.unpaidCount} Unpaid Invoices`}
                iconBg="bg-[#3e248a]/50 text-[#b388ff]"
                gradient="from-[#2e1d5e]/80 to-[#1c1439]"
                onClick={onCardClick ? () => onCardClick('UNPAID') : undefined}
            />
            <StatCard 
                icon={Wallet}
                title="Total Paid"
                value={formatCurrency(stats.totalPaid)}
                subtitle={`${stats.paidCount} Paid Invoices`}
                iconBg="bg-[#1a4d35]/50 text-[#4ade80]"
                gradient="from-[#123625]/80 to-[#0a1f15]"
                onClick={onCardClick ? () => onCardClick('PAID') : undefined}
            />
            <StatCard 
                icon={CalendarDays}
                title="Paid This Year"
                value={formatCurrency(stats.paidThisYear)}
                subtitle={`${stats.currentYear} - ${stats.currentYear + 1}`}
                iconBg="bg-[#6b4819]/50 text-[#f59e0b]"
                gradient="from-[#4a3212]/80 to-[#261909]"
            />
            <StatCard 
                icon={FileText}
                title="Next Due Date"
                value={stats.nextDueDate ? format(stats.nextDueDate, 'dd MMM yyyy') : '--'}
                subtitle={stats.nextDueDate ? formatCurrency(stats.totalOutstanding) : 'No pending dues'}
                iconBg="bg-[#1d488c]/50 text-[#60a5fa]"
                gradient="from-[#143261]/80 to-[#0b1c36]"
            />
        </div>
    );
}
