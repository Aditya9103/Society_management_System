import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useGetAllVehiclesQuery, useAssignParkingSlotMutation } from '../../../../store/api/vehicleApi';
import Modal from '../../../../components/ui/Modal';
import Select from '../../../../components/ui/Select';
import { Button } from '../../../../components/ui/Button';

export default function AssignSlotModal({ slot, onClose }) {
    const { data } = useGetAllVehiclesQuery();
    const [assignSlot, { isLoading }] = useAssignParkingSlotMutation();
    const [vehicleId, setVehicleId] = useState('');

    const vehicles = data?.data?.vehicles?.filter(v => v.status === 'ACTIVE') || [];

    const handleAssign = async () => {
        if (!vehicleId) return;
        try {
            await assignSlot({ slotId: slot._id, vehicleId }).unwrap();
            onClose();
        } catch (e) {
            toast.error('Failed to assign');
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={`Assign Slot ${slot.slotNumber}`}>
            <div className="space-y-4">
                <Select label="Select Active Vehicle" value={vehicleId} onChange={e => setVehicleId(e.target.value)}>
                    <option value="">-- Choose Vehicle --</option>
                    {vehicles.map(v => (
                        <option key={v._id} value={v._id}>{v.vehicleNumber} ({v.residentId?.firstName})</option>
                    ))}
                </Select>
                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleAssign} isLoading={isLoading} disabled={!vehicleId}>Assign</Button>
                </div>
            </div>
        </Modal>
    );
}
