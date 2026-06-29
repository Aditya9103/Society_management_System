import React, { useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import { Input } from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import { Button } from '../../../../components/ui/Button';

export default function CreateSlotModal({ onClose, onCreate, isLoading }) {
    const [isBulk, setIsBulk] = useState(false);
    const [form, setForm] = useState({ 
        slotNumber: '', 
        prefix: '',
        startRange: 1,
        endRange: 10,
        floor: 'Ground', 
        type: 'RESIDENT' 
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isBulk) {
            const slots = [];
            for (let i = parseInt(form.startRange); i <= parseInt(form.endRange); i++) {
                slots.push({
                    slotNumber: `${form.prefix}${i}`.toUpperCase(),
                    floor: form.floor,
                    type: form.type
                });
            }
            onCreate(slots);
        } else {
            onCreate({
                slotNumber: form.slotNumber.toUpperCase(),
                floor: form.floor,
                type: form.type
            });
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={isBulk ? "Create Bulk Slots" : "Create Parking Slot"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-4 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" checked={!isBulk} onChange={() => setIsBulk(false)} className="text-indigo-600 focus:ring-indigo-500" />
                        <span className="text-sm font-medium text-slate-700">Single Slot</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" checked={isBulk} onChange={() => setIsBulk(true)} className="text-indigo-600 focus:ring-indigo-500" />
                        <span className="text-sm font-medium text-slate-700">Bulk Create</span>
                    </label>
                </div>

                {!isBulk ? (
                    <Input label="Slot Number *" value={form.slotNumber} onChange={e => setForm({...form, slotNumber: e.target.value.toUpperCase()})} required />
                ) : (
                    <div className="grid grid-cols-3 gap-4">
                        <Input label="Prefix (e.g. A-)" value={form.prefix} onChange={e => setForm({...form, prefix: e.target.value})} />
                        <Input type="number" label="Start *" value={form.startRange} onChange={e => setForm({...form, startRange: e.target.value})} required min="1" />
                        <Input type="number" label="End *" value={form.endRange} onChange={e => setForm({...form, endRange: e.target.value})} required min="1" />
                    </div>
                )}
                
                <Input label="Floor" value={form.floor} onChange={e => setForm({...form, floor: e.target.value})} />
                <Select label="Type" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    <option value="RESIDENT">Resident</option>
                    <option value="VISITOR">Visitor</option>
                    <option value="EV_CHARGING">EV Charging</option>
                    <option value="DISABLED">Disabled</option>
                </Select>
                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
                    <Button type="submit" isLoading={isLoading}>Create</Button>
                </div>
            </form>
        </Modal>
    );
}
