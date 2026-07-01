import { useState } from 'react';
import {
    Dumbbell, Calendar, Clock, Users, CheckCircle2, XCircle,
    Hourglass, ChevronRight, Star, Info, AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
    useListAmenitiesQuery,
    useGetAvailabilityQuery,
    useListBookingsQuery,
    useCreateBookingMutation,
    useCancelBookingMutation,
    useSubmitFeedbackMutation,
} from '../../../store/api/facilityApi';
import { Button } from '../../../components/ui/Button';

// ── Helpers ───────────────────────────────────────────────────────────────────
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
    PENDING_PAYMENT: { label: 'Pending Payment', color: 'bg-orange-100 text-orange-700 border-orange-200' },
};

const fmt = (date) => new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const today = () => new Date().toISOString().slice(0, 10);

// ── Slot Chip ─────────────────────────────────────────────────────────────────
function SlotChip({ slot, selected, onClick }) {
    const avail = slot.available;
    return (
        <button
            onClick={() => avail && onClick(slot)}
            disabled={!avail}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${!avail
                ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                : selected
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'bg-white border-slate-300 text-slate-700 hover:border-indigo-400 hover:bg-indigo-50'
                }`}
        >
            {slot.startTime}–{slot.endTime}
            {!avail && <span className="ml-1.5 text-xs">(Full)</span>}
        </button>
    );
}

// ── Book Modal ────────────────────────────────────────────────────────────────
function BookModal({ amenity, onClose }) {
    const [date, setDate] = useState(today());
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const [purpose, setPurpose] = useState('');
    const [guests, setGuests] = useState(0);

    const hasConfiguredSlots = Object.values(amenity.availableSlots || {}).some(arr => arr.length > 0);

    const { data: availData, isLoading: availLoading } = useGetAvailabilityQuery(
        { amenityId: amenity._id, date },
        { skip: !date }
    );
    const [createBooking, { isLoading: creating }] = useCreateBookingMutation();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const slots = availData?.data?.slots ?? [];
    const availMsg = availData?.data?.reason;

    const handleBook = async () => {
        if (isSubmitting || creating) return;
        const start = hasConfiguredSlots ? selectedSlot?.startTime : customStart;
        const end = hasConfiguredSlots ? selectedSlot?.endTime : customEnd;
        if (!start || !end) { toast.error('Please select a time slot.'); return; }

        setIsSubmitting(true);
        let success = false;
        try {
            await createBooking({ amenityId: amenity._id, bookingDate: date, startTime: start, endTime: end, purpose, expectedGuests: guests }).unwrap();
            success = true;
        } catch (e) {
            console.error("Booking Error:", e);
            toast.error(e?.data?.message ?? e?.message ?? 'Failed to create booking.');
            setIsSubmitting(false);
        }
        if (success) onClose(true);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">{FACILITY_ICONS[amenity.facilityType] ?? '🏢'}</span>
                        <div>
                            <h2 className="text-xl font-bold">{amenity.name}</h2>
                            <p className="text-indigo-200 text-sm capitalize">{amenity.facilityType.replace(/_/g, ' ')}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                    {/* Date */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Booking Date</label>
                        <input
                            type="date"
                            value={date}
                            min={today()}
                            max={new Date(Date.now() + (amenity.advanceBookingDays ?? 30) * 86400000).toISOString().slice(0, 10)}
                            onChange={(e) => { setDate(e.target.value); setSelectedSlot(null); }}
                            className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Slots or custom time */}
                    {availLoading ? (
                        <div className="flex justify-center p-4"><div className="w-7 h-7 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>
                    ) : availMsg ? (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2 text-amber-700 text-sm">
                            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />{availMsg}
                        </div>
                    ) : hasConfiguredSlots ? (
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Select Slot</label>
                            {slots.length === 0 ? (
                                <p className="text-slate-500 text-sm">No slots configured for this day.</p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {slots.map((s, i) => (
                                        <SlotChip key={i} slot={s} selected={selectedSlot?.startTime === s.startTime && selectedSlot?.endTime === s.endTime} onClick={setSelectedSlot} />
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Start Time</label>
                                <input type="time" value={customStart} onChange={e => setCustomStart(e.target.value)}
                                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">End Time</label>
                                <input type="time" value={customEnd} onChange={e => setCustomEnd(e.target.value)}
                                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                        </div>
                    )}

                    {/* Purpose */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Purpose <span className="text-slate-400 font-normal">(optional)</span></label>
                        <input type="text" value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="e.g., Birthday party, workout..."
                            className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>

                    {/* Guests */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Expected Guests</label>
                        <input type="number" value={guests} min={0} max={amenity.capacity ?? 999} onChange={e => setGuests(Number(e.target.value))}
                            className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        {amenity.capacity && <p className="text-xs text-slate-400 mt-1">Capacity: {amenity.capacity}</p>}
                    </div>

                    {/* Info card */}
                    {amenity.isPaid && (
                        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-sm text-indigo-700 flex gap-2">
                            <Info className="w-4 h-4 mt-0.5 shrink-0" />
                            This amenity has a booking fee of ₹{amenity.hourlyRate}/hr. Admin will collect payment separately.
                        </div>
                    )}

                    {!amenity.autoApproval && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700 flex gap-2">
                            <Hourglass className="w-4 h-4 mt-0.5 shrink-0" />
                            This booking requires admin approval before confirmation.
                        </div>
                    )}
                </div>

                <div className="flex gap-3 p-6 border-t border-slate-100">
                    <button onClick={() => onClose(false)} className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                    <button onClick={handleBook} disabled={creating || isSubmitting}
                        className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50">
                        {(creating || isSubmitting) ? 'Booking…' : (amenity.autoApproval ? '✓ Confirm Booking' : 'Request Booking')}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Amenity Card ──────────────────────────────────────────────────────────────
function AmenityCard({ amenity, onBook }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-indigo-500 to-violet-500" />
            <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-2xl">
                            {FACILITY_ICONS[amenity.facilityType] ?? '🏢'}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-base leading-tight">{amenity.name}</h3>
                            <p className="text-xs text-slate-400 capitalize">{amenity.facilityType.replace(/_/g, ' ')}</p>
                        </div>
                    </div>
                    {amenity.isPaid && (
                        <span className="text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">Paid</span>
                    )}
                </div>
                {amenity.description && <p className="text-sm text-slate-500 mb-3 line-clamp-2">{amenity.description}</p>}
                <div className="flex flex-wrap gap-2 mb-4">
                    {amenity.capacity && (
                        <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2 py-1 rounded-full">
                            <Users className="w-3 h-3" />{amenity.capacity} max
                        </span>
                    )}
                    {!amenity.autoApproval && (
                        <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2 py-1 rounded-full">
                            <Hourglass className="w-3 h-3" />Approval needed
                        </span>
                    )}
                </div>
                <Button className="w-full" size="sm" onClick={() => onBook(amenity)}>
                    Book Now <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
            </div>
        </div>
    );
}

// ── Booking Row ───────────────────────────────────────────────────────────────
function BookingRow({ booking, onCancel }) {
    const s = STATUS_CONFIG[booking.status] ?? { label: booking.status, color: 'bg-slate-100 text-slate-600' };
    const canCancel = ['CONFIRMED', 'PENDING_APPROVAL'].includes(booking.status);
    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 hover:shadow-sm transition">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center text-xl shrink-0">
                {FACILITY_ICONS[booking.amenityId?.facilityType] ?? '🏢'}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 truncate">{booking.amenityId?.name ?? 'Amenity'}</p>
                <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                    <Calendar className="w-3 h-3" />{fmt(booking.bookingDate)}
                    <Clock className="w-3 h-3 ml-1" />{booking.startTime}–{booking.endTime}
                </p>
                {booking.bookingNumber && <p className="text-xs text-slate-400 mt-0.5">#{booking.bookingNumber}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${s.color}`}>{s.label}</span>
                {canCancel && (
                    <button onClick={() => onCancel(booking)} className="text-xs text-red-500 hover:text-red-700 font-medium transition">Cancel</button>
                )}
            </div>
        </div>
    );
}

// ── Rating Modal ──────────────────────────────────────────────────────────────
function RatingModal({ booking, onClose }) {
    const [rating, setRating] = useState(5);
    const [feedback, setFeedback] = useState('');
    const [submitFeedback, { isLoading }] = useSubmitFeedbackMutation();

    const handleSubmit = async () => {
        try {
            await submitFeedback({ id: booking._id, rating, feedback }).unwrap();
            toast.success('Feedback submitted successfully!');
            onClose();
        } catch (e) {
            toast.error(e?.data?.message ?? 'Failed to submit feedback.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
                <h2 className="text-lg font-bold text-slate-800">Rate Your Experience</h2>
                <p className="text-sm text-slate-500">{booking.amenityId?.name}</p>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(n => (
                        <button key={n} onClick={() => setRating(n)} className="text-2xl transition-transform hover:scale-110">
                            {n <= rating ? '⭐' : '☆'}
                        </button>
                    ))}
                </div>
                <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={3}
                    placeholder="Any comments?" className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50">Skip</button>
                    <button onClick={handleSubmit} disabled={isLoading}
                        className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
                        {isLoading ? 'Submitting…' : 'Submit'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Cancel Confirm ────────────────────────────────────────────────────────────
function CancelConfirm({ booking, onClose }) {
    const [reason, setReason] = useState('');
    const [cancelBooking, { isLoading }] = useCancelBookingMutation();

    const handleCancel = async () => {
        try {
            await cancelBooking({ id: booking._id, reason }).unwrap();
            onClose(true);
        } catch (e) {
            toast.error(e?.data?.message ?? 'Failed to cancel booking.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
                <div className="flex items-center gap-3 text-red-600">
                    <XCircle className="w-6 h-6" />
                    <h2 className="text-lg font-bold">Cancel Booking?</h2>
                </div>
                <p className="text-sm text-slate-600">
                    Cancel booking for <strong>{booking.amenityId?.name}</strong> on {fmt(booking.bookingDate)}?
                </p>
                <input type="text" value={reason} onChange={e => setReason(e.target.value)}
                    placeholder="Reason (optional)" className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                <div className="flex gap-3">
                    <button onClick={() => onClose(false)} className="flex-1 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50">Keep</button>
                    <button onClick={handleCancel} disabled={isLoading}
                        className="flex-1 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-50">
                        {isLoading ? 'Cancelling…' : 'Cancel Booking'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ResidentAmenitiesPage() {
    const [tab, setTab] = useState('browse'); // 'browse' | 'my'
    const [bookTarget, setBookTarget] = useState(null);
    const [cancelTarget, setCancelTarget] = useState(null);
    const [rateTarget, setRateTarget] = useState(null);

    const { data: amenityData, isLoading: amenLoading, refetch: refetchAmenities } = useListAmenitiesQuery({ isActive: true });
    const { data: bookingData, isLoading: bookLoading, refetch: refetchBookings } = useListBookingsQuery({}, { skip: tab !== 'my' });

    const amenities = amenityData?.data?.amenities ?? [];
    const bookings = bookingData?.data?.bookings ?? [];

    const handleBookClose = (success) => {
        setBookTarget(null);
        if (success) {
            refetchBookings();
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Dumbbell className="w-6 h-6 text-indigo-600" /> Amenities
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Book society facilities for your use</p>
                </div>
                <div className="flex gap-2 bg-slate-100 rounded-xl p-1">
                    {[['browse', 'Browse'], ['my', 'My Bookings']].map(([key, label]) => (
                        <button key={key} onClick={() => setTab(key)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${tab === key ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Browse Tab */}
            {tab === 'browse' && (
                amenLoading ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {[...Array(6)].map((_, i) => <div key={i} className="h-44 animate-pulse rounded-2xl bg-slate-200" />)}
                    </div>
                ) : amenities.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                        <div className="text-5xl mb-3">🏢</div>
                        <p className="text-slate-600 font-semibold">No amenities available</p>
                        <p className="text-slate-400 text-sm mt-1">Check back later or contact your society admin.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {amenities.map(a => <AmenityCard key={a._id} amenity={a} onBook={setBookTarget} />)}
                    </div>
                )
            )}

            {/* My Bookings Tab */}
            {tab === 'my' && (
                bookLoading ? (
                    <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-200" />)}</div>
                ) : bookings.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                        <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-600 font-semibold">No bookings yet</p>
                        <p className="text-slate-400 text-sm mt-1">Browse amenities and make your first booking.</p>
                        <button onClick={() => setTab('browse')} className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                            Browse Amenities →
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {bookings.map(b => (
                            <div key={b._id}>
                                <BookingRow booking={b} onCancel={setCancelTarget} />
                                {b.status === 'COMPLETED' && !b.residentRating && (
                                    <button onClick={() => setRateTarget(b)} className="ml-14 mt-1 text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
                                        <Star className="w-3 h-3" />Rate this experience
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )
            )}

            {bookTarget && <BookModal amenity={bookTarget} onClose={handleBookClose} />}
            {cancelTarget && <CancelConfirm booking={cancelTarget} onClose={(r) => { setCancelTarget(null); if (r) refetchBookings(); }} />}
            {rateTarget && <RatingModal booking={rateTarget} onClose={() => { setRateTarget(null); refetchBookings(); }} />}
        </div>
    );
}
