/**
 * CreateUnitModal.jsx — Modal to create a new unit in a floor or edit an existing one.
 * Uses global components from src/components/ui/.
 */
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
    useCreateUnitMutation,
    useUpdateUnitMutation,
    useListTowersQuery,
    useListFloorsQuery,
} from '../../../store/api/societyAdminApi';
import { Button } from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import FormField from '../../../components/ui/FormField';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import Alert from '../../../components/ui/Alert';

const BHK_TYPES = ['1RK', '1BHK', '2BHK', '3BHK', '4BHK', '5BHK', 'VILLA', 'DUPLEX', 'PENTHOUSE'];
const UNIT_TYPES = ['RESIDENTIAL', 'COMMERCIAL', 'SHOP', 'OFFICE'];

export default function CreateUnitModal({ isOpen, onClose, initialData = null }) {
    const isEdit = !!initialData;
    const [createUnit, { isLoading: isCreating }] = useCreateUnitMutation();
    const [updateUnit, { isLoading: isUpdating }] = useUpdateUnitMutation();
    const isLoading = isCreating || isUpdating;

    const [errorMsg, setErrorMsg] = useState(null);
    const [selectedTowerId, setSelectedTowerId] = useState('');
    const [isBulk, setIsBulk] = useState(false);

    const { data: towersData } = useListTowersQuery();
    const towers = Array.isArray(towersData?.data) ? towersData.data : [];

    const { data: floorsData } = useListFloorsQuery(selectedTowerId, { skip: !selectedTowerId });
    const floors = Array.isArray(floorsData?.data) ? floorsData.data : [];

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setSelectedTowerId(initialData.towerId?._id || initialData.towerId);
                reset({
                    towerId: initialData.towerId?._id || initialData.towerId,
                    floorId: initialData.floorId?._id || initialData.floorId,
                    unitNumber: initialData.unitNumber,
                    unitType: initialData.unitType || 'RESIDENTIAL',
                    bhkType: initialData.bhkType || '',
                    carpetAreaSqft: initialData.carpetAreaSqft || 0,
                    builtUpAreaSqft: initialData.builtUpAreaSqft || 0,
                    maintenanceAmount: initialData.maintenanceAmount || 0,
                    parkingSlots: initialData.parkingSlots || 0,
                });
                setIsBulk(false);
            } else {
                setSelectedTowerId('');
                reset({
                    towerId: '',
                    floorId: '',
                    unitNumber: '',
                    unitType: 'RESIDENTIAL',
                    bhkType: '',
                    carpetAreaSqft: '',
                    builtUpAreaSqft: '',
                    maintenanceAmount: '',
                    parkingSlots: '',
                });
            }
        }
    }, [isOpen, initialData, reset]);

    const onSubmit = async (formData) => {
        setErrorMsg(null);
        try {
            const createSingleUnit = (unitNum) => {
                return createUnit({
                    towerId: formData.towerId,
                    floorId: formData.floorId,
                    unitNumber: unitNum,
                    unitType: formData.unitType,
                    bhkType: formData.bhkType || null,
                    carpetAreaSqft: Number(formData.carpetAreaSqft) || 0,
                    builtUpAreaSqft: Number(formData.builtUpAreaSqft) || 0,
                    maintenanceAmount: Number(formData.maintenanceAmount) || 0,
                    parkingSlots: Number(formData.parkingSlots) || 0,
                }).unwrap();
            };

            if (isEdit) {
                await updateUnit({
                    id: initialData._id,
                    towerId: formData.towerId,
                    floorId: formData.floorId,
                    unitNumber: formData.unitNumber,
                    unitType: formData.unitType,
                    bhkType: formData.bhkType || null,
                    carpetAreaSqft: Number(formData.carpetAreaSqft) || 0,
                    builtUpAreaSqft: Number(formData.builtUpAreaSqft) || 0,
                    maintenanceAmount: Number(formData.maintenanceAmount) || 0,
                    parkingSlots: Number(formData.parkingSlots) || 0,
                }).unwrap();
            } else {
                if (isBulk) {
                    const start = parseInt(formData.startNumber, 10);
                    const end = parseInt(formData.endNumber, 10);

                    if (isNaN(start) || isNaN(end)) {
                        setErrorMsg('Start and End numbers must be valid integers.');
                        return;
                    }
                    if (start > end) {
                        setErrorMsg('Start number must be less than or equal to end number.');
                        return;
                    }
                    if (end - start >= 50) {
                        setErrorMsg('You can create up to 50 units at a time to prevent timeout.');
                        return;
                    }

                    const prefix = formData.unitPrefix || '';

                    // We'll run them sequentially to avoid overwhelming the server or DB constraints in parallel
                    for (let i = start; i <= end; i++) {
                        const numStr = i.toString().padStart(formData.startNumber.length, '0');
                        await createSingleUnit(`${prefix}${numStr}`);
                    }
                } else {
                    await createSingleUnit(formData.unitNumber);
                }
            }

            reset();
            setSelectedTowerId('');
            setIsBulk(false);
            onClose();
        } catch (err) {
            setErrorMsg(err?.data?.message ?? `Failed to ${isEdit ? 'update' : 'create'} unit(s). Please try again.`);
        }
    };

    const handleClose = () => {
        reset();
        setErrorMsg(null);
        setSelectedTowerId('');
        setIsBulk(false);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={isEdit ? "Edit Unit" : "Create New Unit(s)"}
            description={isEdit ? "Update unit details." : "Add one or multiple flats/units to a floor."}
            size="lg"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {errorMsg && <Alert type="error">{errorMsg}</Alert>}

                {/* Location */}
                <div>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Location</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormField label="Tower" error={errors.towerId?.message} required>
                            <Select
                                {...register('towerId', {
                                    required: 'Select a tower',
                                    onChange: (e) => setSelectedTowerId(e.target.value),
                                })}
                            >
                                <option value="">Select tower</option>
                                {towers.map((t) => (
                                    <option key={t._id} value={t._id}>{t.name} ({t.code})</option>
                                ))}
                            </Select>
                        </FormField>
                        <FormField label="Floor" error={errors.floorId?.message} required>
                            <Select {...register('floorId', { required: 'Select a floor' })} disabled={!selectedTowerId}>
                                <option value="">Select floor</option>
                                {floors.map((f) => (
                                    <option key={f._id} value={f._id}>{f.floorName}</option>
                                ))}
                            </Select>
                        </FormField>
                    </div>
                </div>

                {/* Unit Info */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Unit Details</p>
                        {!isEdit && (
                            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={isBulk}
                                    onChange={(e) => setIsBulk(e.target.checked)}
                                    className="h-4 w-4 accent-violet-600 rounded"
                                />
                                Bulk Creation (Range)
                            </label>
                        )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        {!isBulk ? (
                            <FormField label="Unit Number" error={errors.unitNumber?.message} required>
                                <Input placeholder="e.g. 101, A-201" {...register('unitNumber', { required: !isBulk ? 'Unit number is required' : false })} />
                            </FormField>
                        ) : (
                            <>
                                <FormField label="Prefix (Optional)" error={errors.unitPrefix?.message}>
                                    <Input placeholder="e.g. A-" {...register('unitPrefix')} />
                                </FormField>
                                <FormField label="Start Number" error={errors.startNumber?.message} required>
                                    <Input placeholder="e.g. 101" {...register('startNumber', { required: isBulk ? 'Start number is required' : false })} />
                                </FormField>
                                <FormField label="End Number" error={errors.endNumber?.message} required>
                                    <Input placeholder="e.g. 105" {...register('endNumber', { required: isBulk ? 'End number is required' : false })} />
                                </FormField>
                            </>
                        )}

                        <FormField label="Unit Type">
                            <Select {...register('unitType')}>
                                {UNIT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                            </Select>
                        </FormField>
                        <FormField label="BHK Type">
                            <Select {...register('bhkType')}>
                                <option value="">None / N.A.</option>
                                {BHK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                            </Select>
                        </FormField>
                        <FormField label="Maintenance Amount (₹)">
                            <Input type="number" min={0} placeholder="0" {...register('maintenanceAmount')} />
                        </FormField>
                        <FormField label="Carpet Area (sqft)">
                            <Input type="number" min={0} placeholder="0" {...register('carpetAreaSqft')} />
                        </FormField>
                        <FormField label="Built-up Area (sqft)">
                            <Input type="number" min={0} placeholder="0" {...register('builtUpAreaSqft')} />
                        </FormField>
                        <FormField label="Parking Slots">
                            <Input type="number" min={0} placeholder="0" {...register('parkingSlots')} />
                        </FormField>
                    </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-6">
                    <Button type="button" variant="secondary" onClick={handleClose}>Cancel</Button>
                    <Button type="submit" isLoading={isLoading}>
                        {isLoading ? 'Saving…' : isEdit ? 'Save Changes' : isBulk ? 'Create Units' : 'Create Unit'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
