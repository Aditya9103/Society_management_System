import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { AlertTriangle } from 'lucide-react';
import { useGetAvailabilityQuery, useCreateBookingMutation } from '../../../../store/api/facilityApi';
import { DarkModal, DarkInput, DarkButton } from '../profile/DarkUI';

const today = () => new Date().toISOString().slice(0, 10);

function SlotChip({ slot, selected, onClick }) {
    const avail = slot.available;
    return (
        <button
            type="button"
            onClick={() => avail && onClick(slot)}
            disabled={!avail}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${!avail
                ? 'bg-slate-800/50 border-slate-700/50 text-slate-500 cursor-not-allowed'
                : selected
                    ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/20'
                    : 'bg-[#151822] border-slate-700 text-slate-300 hover:border-purple-500/50 hover:bg-slate-800'
                }`}
        >
            {slot.startTime}–{slot.endTime}
            {!avail && <span className="ml-1.5 text-[9px] opacity-70">(Full)</span>}
        </button>
    );
}

export function BookModal({ amenity, onClose }) {
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

    const handleBook = async (e) => {
        e.preventDefault();
        if (isSubmitting || creating) return;
        const start = hasConfiguredSlots ? selectedSlot?.startTime : customStart;
        const end = hasConfiguredSlots ? selectedSlot?.endTime : customEnd;
        if (!start || !end) { toast.error('Please select a time slot.'); return; }

        setIsSubmitting(true);
        try {
            await createBooking({ amenityId: amenity._id, bookingDate: date, startTime: start, endTime: end, purpose, expectedGuests: Number(guests) }).unwrap();
            toast.success('Booking requested successfully!');
            onClose(true);
        } catch (e) {
            console.error("Booking Error:", e);
            toast.error(e?.data?.message ?? e?.message ?? 'Failed to create booking.');
            setIsSubmitting(false);
        }
    };

    return (
        <DarkModal isOpen={true} onClose={() => onClose()} title={`Book ${amenity.name}`}>
            <form onSubmit={handleBook} className="space-y-5">
                <DarkInput
                    type="date"
                    label="Booking Date"
                    value={date}
                    min={today()}
                    max={new Date(Date.now() + (amenity.advanceBookingDays ?? 30) * 86400000).toISOString().slice(0, 10)}
                    onChange={(e) => { setDate(e.target.value); setSelectedSlot(null); }}
                />

                {/* Slots or custom time */}
                {availLoading ? (
                    <div className="flex justify-center p-4"><div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>
                ) : availMsg ? (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex gap-2 text-amber-400 text-sm">
                        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />{availMsg}
                    </div>
                ) : hasConfiguredSlots ? (
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-2">Select Slot</label>
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
                        <DarkInput type="time" label="Start Time" value={customStart} onChange={e => setCustomStart(e.target.value)} />
                        <DarkInput type="time" label="End Time" value={customEnd} onChange={e => setCustomEnd(e.target.value)} />
                    </div>
                )}

                <DarkInput label="Purpose" value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="e.g. Birthday Party (Optional)" />
                <DarkInput type="number" label="Expected Guests" value={guests} onChange={e => setGuests(e.target.value)} min="0" max={amenity.maxCapacity ?? 100} />
                
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/80">
                    <DarkButton type="button" variant="secondary" onClick={() => onClose()}>Cancel</DarkButton>
                    <DarkButton type="submit" variant="primary" isLoading={creating || isSubmitting}>Confirm Booking</DarkButton>
                </div>
            </form>
        </DarkModal>
    );
}
