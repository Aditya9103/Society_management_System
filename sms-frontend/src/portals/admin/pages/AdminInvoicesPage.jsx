import React, { useState } from 'react';
import { useGetAllInvoicesQuery } from '../../../store/api/societyAdminApi';
import { Receipt } from 'lucide-react';
import PageHeader from '../../../components/ui/PageHeader';
import Alert from '../../../components/ui/Alert';
import EmptyState from '../../../components/ui/EmptyState';
import InvoiceRow from '../components/invoices/InvoiceRow';
import Select from '../../../components/ui/Select';

const STATUS_STYLES = {
    DRAFT: 'Draft',
    SENT: 'Sent',
    PAID: 'Paid',
    PARTIAL: 'Partial',
    OVERDUE: 'Overdue',
    CANCELLED: 'Cancelled',
};

export default function AdminInvoicesPage() {
    const [statusFilter, setStatusFilter] = useState('');
    const { data, isLoading, isError, refetch, isFetching } = useGetAllInvoicesQuery({ status: statusFilter || undefined });
    const invoices = data?.data ?? [];

    return (
        <div className="space-y-5">
            <PageHeader 
                title="Invoice Management"
                subtitle="All society invoices and billing"
                onRefresh={refetch}
                isFetching={isFetching}
                actions={
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                        <option value="">All Statuses</option>
                        {Object.keys(STATUS_STYLES).map(s => <option key={s} value={s}>{STATUS_STYLES[s]}</option>)}
                    </select>
                }
            />

            {isError && <Alert type="error">Failed to load invoices. <button onClick={refetch} className="underline ml-1">Retry</button></Alert>}

            {isLoading ? (
                <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-200" />)}</div>
            ) : invoices.length === 0 ? (
                <EmptyState 
                    icon={Receipt} 
                    title="No invoices found" 
                />
            ) : (
                <div className="space-y-3">{invoices.map(inv => <InvoiceRow key={inv._id} invoice={inv} />)}</div>
            )}
        </div>
    );
}
