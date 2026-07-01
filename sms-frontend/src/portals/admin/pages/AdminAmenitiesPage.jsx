import { useState } from 'react';
import {
    Building2, Plus, Pencil, Trash2, CheckCircle2, XCircle,
    Clock, Users, ChevronDown, ChevronUp, Calendar, Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
    useListAmenitiesQuery,
    useCreateAmenityMutation,
    useUpdateAmenityMutation,
    useDeleteAmenityMutation,
    useListBookingsQuery,
    useApproveBookingMutation,
    useRejectBookingMutation,
    useCancelBookingMutation,
    useMarkCompletedMutation,
    useMarkNoShowMutation,
} from '../../../store/api/facilityApi';
import { Button } from '../../../components/ui/Button';

// ── Constants ─────────────────────────────────────────────────────────────────
const FACILITY_TYPES = [
    'CLUBHOUSE', 'SWIMMING_POOL', 'GYM', 'TENNIS_COURT', 'BADMINTON_COURT',
    'CRICKET_NET', 'PARTY_HALL', 'TERRACE', 'LIBRARY', 'KIDS_PLAY_AREA',
    'MEDITATION_ROOM', 'CONFERENCE_ROOM', 'BBQ_AREA', 'OTHER',
];

const FACILITY_ICONS = {
    CLUBHOUSE: '🏛️', SWIMMING_POOL: '🏊', GYM: '💪', TENNIS_COURT: '🎾',
    BADMINTON_COURT: '🏸', CRICKET_NET: '🏏', PARTY_HALL: '🎉', TERRACE: '🌆',
    LIBRARY: '📚', KIDS_PLAY_AREA: '🎠', MEDITATION_ROOM: '🧘', CONFERENCE_ROOM: '📊',
    BBQ_AREA: '🍖', OTHER: '🏢',
};

const STATUS_CONFIG = {
    CONFIRMED: { label: 'Confirmed', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    PENDING_APPROVAL: { label: 'Pending', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-600 border-red-200' },
    COMPLETED: { label: 'Completed', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
    NO_SHOW: { label: 'No Show', color: 'bg-slate-100 text-slate-600 border-slate-200' },
};

const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

// ── DAYS OF WEEK ──────────────────────────────────────────────────────────────
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ── Slot Editor ───────────────────────────────────────────────────────────────
function SlotEditor({ slots, onChange }) {
    // slots: { "0": [{startTime, endTime, maxBookings}], ... }
    const [expanded, setExpanded] = useState(null);

    const addSlot = (day) => {
        const daySlots = slots[day] ?? [];
        onChange({ ...slots, [day]: [...daySlots, { startTime: '09:00', endTime: '10:00', maxBookings: 1 }] });
    };
    const removeSlot = (day, idx) => {
        const daySlots = [...(slots[day] ?? [])];
        daySlots.splice(idx, 1);
        onChange({ ...slots, [day]: daySlots });
    };
    const updateSlot = (day, idx, field, value) => {
        const daySlots = [...(slots[day] ?? [])];
        daySlots[idx] = { ...daySlots[idx], [field]: value };
        onChange({ ...slots, [day]: daySlots });
    };

    return (
        <div className="space-y-2">
            {DAYS.map((dayName, d) => {
                const dayKey = d.toString();
                const daySlots = slots[dayKey] ?? [];
                const isOpen = expanded === d;
                return (
                    <div key={d} className="border border-slate-200 rounded-xl overflow-hidden">
                        <button type="button"
                            onClick={() => setExpanded(isOpen ? null : d)}
                            className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">
                            <span>{dayName} {daySlots.length > 0 && <span className="ml-1 text-indigo-600 text-xs font-normal">({daySlots.length} slot{daySlots.length > 1 ? 's' : ''})</span>}</span>
                            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        {isOpen && (
                            <div className="p-3 space-y-2 bg-white">
                                {daySlots.map((slot, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <input type="time" value={slot.startTime} onChange={e => updateSlot(dayKey, idx, 'startTime', e.target.value)}
                                            className="border border-slate-300 rounded-lg px-2 py-1 text-sm" />
                                        <span className="text-slate-400 text-sm">to</span>
                                        <input type="time" value={slot.endTime} onChange={e => updateSlot(dayKey, idx, 'endTime', e.target.value)}
                                            className="border border-slate-300 rounded-lg px-2 py-1 text-sm" />
                                        <input type="number" min={1} max={50} value={slot.maxBookings} onChange={e => updateSlot(dayKey, idx, 'maxBookings', Number(e.target.value))}
                                            className="w-16 border border-slate-300 rounded-lg px-2 py-1 text-sm" title="Max bookings" />
                                        <span className="text-xs text-slate-400">max</span>
                                        <button type="button" onClick={() => removeSlot(dayKey, idx)} className="text-red-500 hover:text-red-700 ml-1">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => addSlot(dayKey)} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-1">
                                    <Plus className="w-3 h-3" />Add Slot
                                </button>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ── Amenity Form Modal ────────────────────────────────────────────────────────
function AmenityFormModal({ existing, onClose }) {
    const [form, setForm] = useState({
        name: existing?.name ?? '',
        facilityType: existing?.facilityType ?? 'CLUBHOUSE',
        customAmenityType: existing?.customAmenityType ?? '',
        description: existing?.description ?? '',
        capacity: existing?.capacity ?? '',
        isPaid: existing?.isPaid ?? false,
        hourlyRate: existing?.hourlyRate ?? 0,
        fullDayRate: existing?.fullDayRate ?? 0,
        refundableDeposit: existing?.refundableDeposit ?? 0,
        autoApproval: existing?.autoApproval ?? true,
        advanceBookingDays: existing?.advanceBookingDays ?? 30,
        minDurationHours: existing?.minDurationHours ?? 1,
        maxDurationHours: existing?.maxDurationHours ?? '',
        cancellationDeadlineHours: existing?.cancellationDeadlineHours ?? 24,
        cancellationPolicy: existing?.cancellationPolicy ?? '',
        availableSlots: existing?.availableSlots ?? {},
        isActive: existing?.isActive ?? true,
    });
    const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

    const [createAmenity, { isLoading: creating }] = useCreateAmenityMutation();
    const [updateAmenity, { isLoading: updating }] = useUpdateAmenityMutation();
    const saving = creating || updating;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...form,
            customAmenityType: form.facilityType === 'OTHER' ? form.customAmenityType : null,
            capacity: form.capacity ? Number(form.capacity) : null,
            hourlyRate: Number(form.hourlyRate),
            fullDayRate: Number(form.fullDayRate),
            refundableDeposit: Number(form.refundableDeposit),
            advanceBookingDays: Number(form.advanceBookingDays),
            minDurationHours: Number(form.minDurationHours),
            maxDurationHours: form.maxDurationHours ? Number(form.maxDurationHours) : null,
            cancellationDeadlineHours: Number(form.cancellationDeadlineHours),
        };
        try {
            if (existing) {
                await updateAmenity({ id: existing._id, ...payload }).unwrap();
                toast.success('Amenity updated successfully!');
            } else {
                await createAmenity(payload).unwrap();
                toast.success('Amenity created successfully!');
            }
            onClose(true);
        } catch (e) {
            toast.error(e?.data?.message ?? 'Failed to save amenity.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 rounded-t-2xl text-white">
                    <h2 className="text-xl font-bold">{existing ? 'Edit' : 'Add'} Amenity</h2>
                </div>
                <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                    {/* Name & type */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Name *</label>
                            <input required value={form.name} onChange={set('name')} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Type *</label>
                            <select value={form.facilityType} onChange={set('facilityType')} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                {FACILITY_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                            </select>
                        </div>
                        {form.facilityType === 'OTHER' && (
                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Custom Type *</label>
                                <input required value={form.customAmenityType} onChange={set('customAmenityType')} placeholder="e.g. Yoga Studio" className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                        )}
                    </div>
                    {/* Description & Capacity */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                            <textarea value={form.description} onChange={set('description')} rows={2} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Capacity</label>
                            <input type="number" min={0} value={form.capacity} onChange={set('capacity')} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                    </div>
                    {/* Toggles */}
                    <div className="flex flex-wrap gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={form.isPaid} onChange={set('isPaid')} className="w-4 h-4 rounded accent-indigo-600" />
                            <span className="text-sm font-semibold text-slate-700">Paid Amenity</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={form.autoApproval} onChange={set('autoApproval')} className="w-4 h-4 rounded accent-indigo-600" />
                            <span className="text-sm font-semibold text-slate-700">Auto Approval</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={form.isActive} onChange={set('isActive')} className="w-4 h-4 rounded accent-indigo-600" />
                            <span className="text-sm font-semibold text-slate-700">Active</span>
                        </label>
                    </div>
                    {/* Rates (conditional) */}
                    {form.isPaid && (
                        <div className="grid grid-cols-3 gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                            <div>
                                <label className="block text-xs font-semibold text-amber-700 mb-1">Hourly Rate (₹)</label>
                                <input type="number" min={0} value={form.hourlyRate} onChange={set('hourlyRate')} className="w-full border border-amber-300 rounded-lg px-3 py-1.5 text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-amber-700 mb-1">Full Day Rate (₹)</label>
                                <input type="number" min={0} value={form.fullDayRate} onChange={set('fullDayRate')} className="w-full border border-amber-300 rounded-lg px-3 py-1.5 text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-amber-700 mb-1">Deposit (₹)</label>
                                <input type="number" min={0} value={form.refundableDeposit} onChange={set('refundableDeposit')} className="w-full border border-amber-300 rounded-lg px-3 py-1.5 text-sm" />
                            </div>
                        </div>
                    )}
                    {/* Booking settings */}
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Advance Days</label>
                            <input type="number" min={1} max={365} value={form.advanceBookingDays} onChange={set('advanceBookingDays')} className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Min Hrs</label>
                            <input type="number" min={0.5} step={0.5} value={form.minDurationHours} onChange={set('minDurationHours')} className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Max Hrs</label>
                            <input type="number" min={0.5} step={0.5} value={form.maxDurationHours} onChange={set('maxDurationHours')} placeholder="None" className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm" />
                        </div>
                    </div>
                    {/* Cancellation */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Cancel Deadline (hrs before)</label>
                            <input type="number" min={0} value={form.cancellationDeadlineHours} onChange={set('cancellationDeadlineHours')} className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Cancellation Policy</label>
                            <input value={form.cancellationPolicy} onChange={set('cancellationPolicy')} placeholder="e.g., No refund after 24hrs" className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm" />
                        </div>
                    </div>
                    {/* Slots */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Available Slots (per day)</label>
                        <p className="text-xs text-slate-400 mb-2">Leave empty to allow flexible booking times.</p>
                        <SlotEditor slots={form.availableSlots} onChange={(s) => setForm(p => ({ ...p, availableSlots: s }))} />
                    </div>
                </div>
                <div className="flex gap-3 p-6 border-t border-slate-100">
                    <button type="button" onClick={() => onClose(false)} className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                    <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
                        {saving ? 'Saving…' : (existing ? 'Update Amenity' : 'Create Amenity')}
                    </button>
                </div>
            </form>
        </div>
    );
}

// ── Booking Table ─────────────────────────────────────────────────────────────
function BookingTable() {
    const [filterStatus, setFilterStatus] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const { data, isLoading, refetch } = useListBookingsQuery({ status: filterStatus || undefined, date: filterDate || undefined });
    const [approve] = useApproveBookingMutation();
    const [reject] = useRejectBookingMutation();
    const [cancel] = useCancelBookingMutation();
    const [complete] = useMarkCompletedMutation();
    const [noShow] = useMarkNoShowMutation();
    const [rejectId, setRejectId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    const bookings = data?.data?.bookings ?? [];

    const act = async (fn, arg, successMsg) => {
        try {
            await fn(arg).unwrap();
            toast.success(successMsg);
            refetch();
        } catch (e) {
            toast.error(e?.data?.message ?? 'Action failed');
        }
    };

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex gap-3 flex-wrap items-center">
                <Filter className="w-4 h-4 text-slate-400" />
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-slate-300 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">All Statuses</option>
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="border border-slate-300 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                {(filterStatus || filterDate) && <button onClick={() => { setFilterStatus(''); setFilterDate(''); }} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">Clear</button>}
            </div>

            {isLoading ? (
                <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-200" />)}</div>
            ) : bookings.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
                    <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm font-medium">No bookings found</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                            <tr>
                                <th className="px-4 py-3 text-left">Booking #</th>
                                <th className="px-4 py-3 text-left">Amenity</th>
                                <th className="px-4 py-3 text-left">Resident</th>
                                <th className="px-4 py-3 text-left">Date & Time</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {bookings.map(b => {
                                const s = STATUS_CONFIG[b.status] ?? { label: b.status, color: 'bg-slate-100 text-slate-600 border-slate-200' };
                                return (
                                    <tr key={b._id} className="hover:bg-slate-50 transition">
                                        <td className="px-4 py-3 font-mono text-xs text-slate-500">{b.bookingNumber}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span>{FACILITY_ICONS[b.amenityId?.facilityType] ?? '🏢'}</span>
                                                <span className="font-semibold text-slate-800">{b.amenityId?.name ?? '—'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-slate-700">{b.residentId?.residentCode ?? '—'}</p>
                                            <p className="text-xs text-slate-400">{b.unitId?.unitNumber ?? ''}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-slate-700">{fmt(b.bookingDate)}</p>
                                            <p className="text-xs text-slate-400">{b.startTime}–{b.endTime}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${s.color}`}>{s.label}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1">
                                                {b.status === 'PENDING_APPROVAL' && <>
                                                    <button onClick={() => act(approve, { id: b._id }, 'Booking approved!')} className="text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-2 py-1 rounded-lg font-medium transition flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3" />Approve
                                                    </button>
                                                    <button onClick={() => setRejectId(b._id)} className="text-xs bg-red-100 text-red-600 hover:bg-red-200 px-2 py-1 rounded-lg font-medium transition flex items-center gap-1">
                                                        <XCircle className="w-3 h-3" />Reject
                                                    </button>
                                                </>}
                                                {b.status === 'CONFIRMED' && <>
                                                    <button onClick={() => act(complete, b._id, 'Marked as completed!')} className="text-xs bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-2 py-1 rounded-lg font-medium transition">Done</button>
                                                    <button onClick={() => act(noShow, b._id, 'Marked as no show!')} className="text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 px-2 py-1 rounded-lg font-medium transition">No Show</button>
                                                    <button onClick={() => act(cancel, { id: b._id, reason: 'Cancelled by admin' }, 'Booking cancelled!')} className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-2 py-1 rounded-lg font-medium transition">Cancel</button>
                                                </>}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Reject modal */}
            {rejectId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
                        <h2 className="text-lg font-bold text-slate-800">Reason for Rejection</h2>
                        <input value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Reason (required)" className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                        <div className="flex gap-3">
                            <button onClick={() => { setRejectId(null); setRejectReason(''); }} className="flex-1 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                            <button onClick={async () => {
                                if (!rejectReason.trim()) {
                                    toast.error('Rejection reason is required');
                                    return;
                                }
                                await act(reject, { id: rejectId, reason: rejectReason }, 'Booking rejected!');
                                setRejectId(null); setRejectReason('');
                            }} className="flex-1 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700">Reject</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Main Admin Page ───────────────────────────────────────────────────────────
export default function AdminAmenitiesPage() {
    const [tab, setTab] = useState('amenities');
    const [formTarget, setFormTarget] = useState(undefined); // undefined = closed, null = create, object = edit
    const { data: amenityData, isLoading, refetch } = useListAmenitiesQuery({});
    const [deleteAmenity] = useDeleteAmenityMutation();
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const amenities = amenityData?.data?.amenities ?? [];

    const handleFormClose = (saved) => { setFormTarget(undefined); if (saved) refetch(); };
    const handleDelete = async (id) => {
        try {
            await deleteAmenity(id).unwrap();
            toast.success('Amenity deleted successfully!');
            refetch();
        } catch (e) {
            toast.error(e?.data?.message ?? 'Delete failed');
        }
        setDeleteConfirm(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Building2 className="w-6 h-6 text-indigo-600" /> Facility Management
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Manage amenities and approve bookings</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex gap-2 bg-slate-100 rounded-xl p-1">
                        {[['amenities', 'Amenities'], ['bookings', 'Bookings']].map(([k, l]) => (
                            <button key={k} onClick={() => setTab(k)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${tab === k ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                {l}
                            </button>
                        ))}
                    </div>
                    {tab === 'amenities' && (
                        <Button size="sm" onClick={() => setFormTarget(null)}>
                            <Plus className="w-4 h-4 mr-1" /> Add Amenity
                        </Button>
                    )}
                </div>
            </div>

            {/* Amenities Tab */}
            {tab === 'amenities' && (
                isLoading ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[...Array(6)].map((_, i) => <div key={i} className="h-44 animate-pulse rounded-2xl bg-slate-200" />)}</div>
                ) : amenities.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                        <div className="text-5xl mb-3">🏢</div>
                        <p className="text-slate-600 font-semibold">No amenities yet</p>
                        <button onClick={() => setFormTarget(null)} className="mt-3 text-sm text-indigo-600 font-semibold hover:text-indigo-700">+ Add first amenity</button>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {amenities.map(a => (
                            <div key={a._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
                                <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-violet-500" />
                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center text-xl">
                                                {FACILITY_ICONS[a.facilityType] ?? '🏢'}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800">{a.name}</h3>
                                                <p className="text-xs text-slate-400 capitalize">{a.facilityType.replace(/_/g, ' ')}</p>
                                            </div>
                                        </div>
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${a.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                            {a.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    {a.description && <p className="text-xs text-slate-500 mb-3 line-clamp-2">{a.description}</p>}
                                    <div className="flex flex-wrap gap-2 mb-4 text-xs text-slate-500">
                                        {a.capacity && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{a.capacity}</span>}
                                        {a.isPaid && <span className="flex items-center gap-1 text-amber-600">₹{a.hourlyRate}/hr</span>}
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{a.autoApproval ? 'Auto-approved' : 'Needs approval'}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setFormTarget(a)} className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl py-2 transition">
                                            <Pencil className="w-3.5 h-3.5" />Edit
                                        </button>
                                        <button onClick={() => setDeleteConfirm(a)} className="flex items-center justify-center gap-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl py-2 px-3 transition">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}

            {/* Bookings Tab */}
            {tab === 'bookings' && <BookingTable />}

            {/* Amenity Form Modal */}
            {formTarget !== undefined && (
                <AmenityFormModal existing={formTarget} onClose={handleFormClose} />
            )}

            {/* Delete Confirm */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
                        <div className="flex items-center gap-2 text-red-600">
                            <Trash2 className="w-5 h-5" />
                            <h2 className="text-lg font-bold">Delete Amenity?</h2>
                        </div>
                        <p className="text-sm text-slate-600">Delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                            <button onClick={() => handleDelete(deleteConfirm._id)} className="flex-1 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
