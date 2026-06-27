export const STATUS_STYLES = {
    DRAFT:           { cls: 'bg-gray-100 text-gray-700',     label: 'Draft' },
    OPEN:            { cls: 'bg-amber-100 text-amber-700',   label: 'Open' },
    ASSIGNED:        { cls: 'bg-blue-100 text-blue-700',     label: 'Assigned' },
    IN_PROGRESS:     { cls: 'bg-indigo-100 text-indigo-700', label: 'In Progress' },
    PENDING_RESIDENT:{ cls: 'bg-pink-100 text-pink-700',     label: 'Needs Info' },
    RESOLVED:        { cls: 'bg-emerald-100 text-emerald-700', label: 'Resolved' },
    CLOSED:          { cls: 'bg-slate-100 text-slate-600',   label: 'Closed' },
    ESCALATED:       { cls: 'bg-red-100 text-red-700',       label: 'Escalated' },
    REJECTED:        { cls: 'bg-red-100 text-red-700',       label: 'Rejected' },
    REOPENED:        { cls: 'bg-purple-100 text-purple-700', label: 'Reopened' },
};

export const PRIORITY_STYLES = {
    LOW:    'bg-slate-100 text-slate-500',
    MEDIUM: 'bg-yellow-100 text-yellow-700',
    HIGH:   'bg-orange-100 text-orange-700',
    URGENT: 'bg-red-100 text-red-700',
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
