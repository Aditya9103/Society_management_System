import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useCreateFloorMutation, useUpdateFloorMutation } from '../../../../store/api/societyAdminApi';
import { Button } from '../../../../components/ui/Button';
import Modal from '../../../../components/ui/Modal';
import FormField from '../../../../components/ui/FormField';
import { Input } from '../../../../components/ui/Input';
import Alert from '../../../../components/ui/Alert';

export default function FloorModal({ tower, initialData, isOpen, onClose }) {
    const isEdit = !!initialData;
    const [createFloor, { isLoading: isCreating }] = useCreateFloorMutation();
    const [updateFloor, { isLoading: isUpdating }] = useUpdateFloorMutation();
    const isLoading = isCreating || isUpdating;

    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [errorMsg, setErrorMsg] = useState(null);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                reset({
                    floorNumber: initialData.floorNumber,
                    floorName: initialData.floorName,
                });
            } else {
                reset({ floorNumber: '', floorName: '' });
            }
        }
    }, [isOpen, initialData, reset]);

    const onSubmit = async (formData) => {
        setErrorMsg(null);
        try {
            if (isEdit) {
                await updateFloor({
                    towerId: tower._id,
                    floorId: initialData._id,
                    floorNumber: Number(formData.floorNumber),
                    floorName: formData.floorName,
                }).unwrap();
            } else {
                await createFloor({
                    towerId: tower._id,
                    floorNumber: Number(formData.floorNumber),
                    floorName: formData.floorName,
                }).unwrap();
            }
            reset();
            onClose(true); // true indicates success
        } catch (err) {
            setErrorMsg(err?.data?.message ?? `Failed to ${isEdit ? 'update' : 'add'} floor.`);
        }
    };

    const handleClose = () => { reset(); setErrorMsg(null); onClose(false); };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={isEdit ? `Edit Floor — ${tower?.name ?? ''}` : `Add Floor — ${tower?.name ?? ''}`}
            description={isEdit ? "Update floor metadata." : "Add a new floor to this tower."}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {errorMsg && <Alert type="error">{errorMsg}</Alert>}
                <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label="Floor Number (negative = basement)" error={errors.floorNumber?.message}>
                        <Input
                            type="number"
                            placeholder="e.g. 13 or -1"
                            {...register('floorNumber', { required: 'Required' })}
                        />
                    </FormField>
                    <FormField label="Floor Name" error={errors.floorName?.message}>
                        <Input
                            placeholder="e.g. Floor 13"
                            {...register('floorName', { required: 'Required' })}
                        />
                    </FormField>
                </div>
                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                    <Button type="button" variant="secondary" onClick={handleClose}>Cancel</Button>
                    <Button type="submit" isLoading={isLoading}>{isEdit ? 'Save Changes' : 'Add Floor'}</Button>
                </div>
            </form>
        </Modal>
    );
}
