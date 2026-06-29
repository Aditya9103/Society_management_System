import React, { useState } from 'react';
import { useGetParkingSlotsQuery, useCreateParkingSlotMutation, useAssignParkingSlotMutation, useUnassignParkingSlotMutation, useGetAllVehiclesQuery } from '../../../store/api/vehicleApi';
import { MapPin, Plus, Car, Trash2, Link } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import CreateSlotModal from '../components/vehicles/CreateSlotModal';
import AssignSlotModal from '../components/vehicles/AssignSlotModal';
import { toast } from 'react-hot-toast';

export default function AdminParkingPage() {
    const { data: slotsData, isLoading: slotsLoading } = useGetParkingSlotsQuery();
    const [createSlot, { isLoading: isCreating }] = useCreateParkingSlotMutation();
    const [unassignSlot] = useUnassignParkingSlotMutation();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [assignModalSlot, setAssignModalSlot] = useState(null);

    const slots = slotsData?.data?.slots || [];

    const handleUnassign = async (id) => {
        if (window.confirm('Remove assigned vehicle from this slot?')) {
            try {
                await unassignSlot(id).unwrap();
                toast.success('Vehicle unassigned');
            } catch (err) {
                toast.error('Failed to unassign vehicle');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Parking Management</h1>
                    <p className="text-slate-500">Manage parking slots and assign vehicles.</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                    <Plus className="h-4 w-4" /> Create Slot
                </Button>
            </div>

            {slotsLoading ? (
                <div className="p-8 text-center">Loading...</div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {slots.map(slot => (
                        <div key={slot._id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-black text-slate-800">{slot.slotNumber}</h3>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider 
                                    ${slot.type === 'VISITOR' ? 'bg-amber-100 text-amber-700' :
                                      slot.type === 'EV_CHARGING' ? 'bg-emerald-100 text-emerald-700' :
                                      slot.type === 'DISABLED' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                                    {slot.type}
                                </span>
                            </div>
                            
                            <div className="text-sm text-slate-500 mb-4 flex-1">
                                <div className="flex items-center gap-1 mb-1"><MapPin className="h-3.5 w-3.5" /> Floor: {slot.floor}</div>
                                {slot.tower && <div className="text-xs">Tower: {slot.tower}</div>}
                            </div>

                            <div className="mt-auto border-t border-slate-100 pt-3">
                                {slot.assignedVehicleId ? (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-indigo-700 font-semibold text-sm">
                                            <Car className="h-4 w-4" /> {slot.assignedVehicleId.vehicleNumber}
                                        </div>
                                        <button onClick={() => handleUnassign(slot._id)} className="text-slate-400 hover:text-red-600" title="Unassign">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <Button variant="outline" className="w-full text-xs h-8" onClick={() => setAssignModalSlot(slot)}>
                                        <Link className="h-3 w-3 mr-1" /> Assign Vehicle
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showCreateModal && (
                <CreateSlotModal 
                    onClose={() => setShowCreateModal(false)}
                    onCreate={async (data) => { 
                        try {
                            await createSlot(data).unwrap(); 
                            toast.success(Array.isArray(data) ? `${data.length} slots created` : 'Slot created');
                            setShowCreateModal(false);
                        } catch (err) {
                            toast.error('Failed to create slot(s)');
                        }
                    }}
                    isLoading={isCreating}
                />
            )}

            {assignModalSlot && (
                <AssignSlotModal 
                    slot={assignModalSlot} 
                    onClose={() => setAssignModalSlot(null)} 
                />
            )}
        </div>
    );
}


