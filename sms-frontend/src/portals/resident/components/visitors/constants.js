export const STATUS_STYLES = {
    PENDING:   { cls: 'bg-amber-100 text-amber-700',   label: 'Pending' },
    APPROVED:  { cls: 'bg-emerald-100 text-emerald-700', label: 'Approved' },
    INSIDE:    { cls: 'bg-blue-100 text-blue-700',     label: 'Inside' },
    EXITED:    { cls: 'bg-slate-100 text-slate-500',   label: 'Exited' },
    DENIED:    { cls: 'bg-red-100 text-red-600',       label: 'Denied' },
    CANCELLED: { cls: 'bg-slate-100 text-slate-400',   label: 'Cancelled' },
    EXPIRED:   { cls: 'bg-slate-100 text-slate-400',   label: 'Expired' },
};

export const VISITOR_TYPES = ['GUEST', 'DELIVERY', 'SERVICE', 'DOMESTIC_STAFF', 'VENDOR', 'OFFICIAL', 'CONTRACTOR'];
