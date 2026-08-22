export const STATUS_STYLES = {
    DRAFT:           { cls: 'bg-slate-500/20 text-slate-400 border border-slate-500/30 shadow-[0_0_8px_rgba(100,116,139,0.3)]',     label: 'Draft' },
    OPEN:            { cls: 'bg-red-500/10 text-red-400 border border-red-500/30 shadow-[0_0_10px_rgba(248,113,113,0.2)]',   label: 'Open' },
    ASSIGNED:        { cls: 'bg-blue-500/10 text-blue-400 border border-blue-500/30 shadow-[0_0_10px_rgba(96,165,250,0.2)]',     label: 'Assigned' },
    IN_PROGRESS:     { cls: 'bg-orange-500/10 text-orange-400 border border-orange-500/30 shadow-[0_0_10px_rgba(251,146,60,0.2)]', label: 'In Progress' },
    PENDING_RESIDENT:{ cls: 'bg-pink-500/10 text-pink-400 border border-pink-500/30 shadow-[0_0_10px_rgba(244,114,182,0.2)]',     label: 'Needs Info' },
    RESOLVED:        { cls: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(52,211,153,0.2)]', label: 'Resolved' },
    CLOSED:          { cls: 'bg-slate-800/80 text-slate-400 border border-slate-700 shadow-[0_0_10px_rgba(148,163,184,0.1)]',   label: 'Closed' },
    ESCALATED:       { cls: 'bg-rose-500/10 text-rose-400 border border-rose-500/30 shadow-[0_0_10px_rgba(251,113,133,0.2)]',       label: 'Escalated' },
    REJECTED:        { cls: 'bg-rose-500/10 text-rose-400 border border-rose-500/30 shadow-[0_0_10px_rgba(251,113,133,0.2)]',       label: 'Rejected' },
    REOPENED:        { cls: 'bg-purple-500/10 text-purple-400 border border-purple-500/30 shadow-[0_0_10px_rgba(192,132,252,0.2)]', label: 'Reopened' },
};

export const PRIORITY_STYLES = {
    LOW:    'text-emerald-400',
    MEDIUM: 'text-orange-400',
    HIGH:   'text-red-400',
    URGENT: 'text-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]',
};

export const COMPLAINT_CATEGORIES = {
    ELECTRICAL: ['Power outage', 'Short circuit', 'Streetlight', 'Common area lighting', 'Other'],
    PLUMBING: ['Water leakage', 'Drain blockage', 'Water supply issue', 'Tank cleaning', 'Other'],
    SECURITY: ['Unauthorized person', 'Suspicious activity', 'CCTV issue', 'Gate malfunction', 'Other'],
    HOUSEKEEPING: ['Common area cleanliness', 'Garbage disposal', 'Pest control', 'Other'],
    LIFT_ELEVATOR: ['Not working', 'Slow', 'Noise', 'Safety concern', 'Other'],
    PARKING: ['Unauthorized parking', 'Parking damage', 'Parking light', 'Other'],
    GARDEN_LANDSCAPE: ['Tree cutting', 'Garden maintenance', 'Sprinkler issue', 'Other'],
    STRUCTURAL: ['Wall crack', 'Seepage', 'Terrace issue', 'Staircase', 'Other'],
    NOISE_NUISANCE: ['Loud noise', 'Pet issues', 'Smoke', 'Anti-social behavior', 'Other'],
    AMENITY: ['Club house', 'Gym equipment', 'Pool', 'Sports court', 'Other'],
    ADMINISTRATIVE: ['NOC request', 'Documents', 'General query', 'Other'],
    OTHER: ['Other'],
};
