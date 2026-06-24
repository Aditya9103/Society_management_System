import React from 'react';
import { useGetMyInvoicesQuery } from '../../../store/api/residentApi';
import { Receipt } from 'lucide-react';
import PageHeader from '../../../components/ui/PageHeader';
import Alert from '../../../components/ui/Alert';
import EmptyState from '../../../components/ui/EmptyState';
import { InvoiceCard } from '../components/invoices/InvoiceCard';

export default function ResidentInvoicesPage() {
    const { data, isLoading, isError, refetch, isFetching } = useGetMyInvoicesQuery();
    const invoices = data?.data ?? [];

    return (
        <div className="space-y-5">
            <PageHeader
                title="Invoices & Billing"
                subtitle="Your maintenance and society charges"
                onRefresh={refetch}
                isFetching={isFetching}
            />

            {isError && (
                <Alert type="error">
                    Failed to load invoices.{' '}
                    <button onClick={refetch} className="underline ml-1">Retry</button>
                </Alert>
            )}

            {isLoading ? (
                <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-200" />)}</div>
            ) : !isError && invoices.length === 0 ? (
                <EmptyState
                    icon={Receipt}
                    title="No invoices yet"
                    description="Your billing history will appear here."
                />
            ) : (
                <div className="space-y-3">{invoices.map(inv => <InvoiceCard key={inv._id} invoice={inv} />)}</div>
            )}
        </div>
    );
}
