/**
 * CreateTowerModal.jsx — Modal to provision a new Tower (with auto-floor generation) or Edit.
 * Uses global components from src/components/ui/.
 */
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useCreateTowerMutation, useUpdateTowerMutation } from '../../../store/api/societyAdminApi';
import { Button } from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import FormField from '../../../components/ui/FormField';
import { Input } from '../../../components/ui/Input';
import Alert from '../../../components/ui/Alert';

export default function CreateTowerModal({ isOpen, onClose, initialData = null }) {
    const isEdit = !!initialData;
    const [createTower, { isLoading: isCreating }] = useCreateTowerMutation();
    const [updateTower, { isLoading: isUpdating }] = useUpdateTowerMutation();
    const isLoading = isCreating || isUpdating;

    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [errorMsg, setErrorMsg] = React.useState(null);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                reset({
                    name: initialData.name,
                    code: initialData.code,
                    totalFloors: initialData.totalFloors,
                    hasBasement: initialData.hasBasement,
                    basementLevels: initialData.basementLevels,
                    amenities: initialData.amenities?.join(', ') || '',
                });
            } else {
                reset({
                    name: '',
                    code: '',
                    totalFloors: '',
                    hasBasement: true,
                    basementLevels: 0,
                    amenities: '',
                });
            }
        }
    }, [isOpen, initialData, reset]);

    const onSubmit = async (formData) => {
        setErrorMsg(null);
        try {
            const payload = {
                name: formData.name,
                code: formData.code.toUpperCase(),
                totalFloors: Number(formData.totalFloors),
                hasBasement: !!formData.hasBasement,
                basementLevels: Number(formData.basementLevels) || 0,
                amenities: formData.amenities
                    ? formData.amenities.split(',').map((a) => a.trim()).filter(Boolean)
                    : [],
            };

            if (isEdit) {
                await updateTower({ id: initialData._id, ...payload }).unwrap();
            } else {
                await createTower({ ...payload, autoCreateFloors: !!formData.hasBasement }).unwrap();
            }
            
            reset();
            onClose();
        } catch (err) {
            setErrorMsg(err?.data?.message ?? `Failed to ${isEdit ? 'update' : 'create'} tower. Please try again.`);
        }
    };

    const handleClose = () => { reset(); setErrorMsg(null); onClose(); };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={handleClose} 
            title={isEdit ? "Edit Tower" : "Create New Tower"} 
            description={isEdit ? "Update tower metadata." : "Add a new building tower. Floors will be auto-generated."}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {errorMsg && <Alert type="error">{errorMsg}</Alert>}

                <div>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Tower Details</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormField label="Tower Name" error={errors.name?.message} required>
                            <Input placeholder="e.g. Tower A" {...register('name', { required: 'Tower name is required' })} />
                        </FormField>
                        <FormField label="Short Code" error={errors.code?.message} required>
                            <Input placeholder="e.g. A or T1" {...register('code', { required: 'Code is required' })} />
                        </FormField>
                        <FormField label="Total Floors (above ground)" error={errors.totalFloors?.message} required>
                            <Input
                                type="number" min={1} placeholder="e.g. 12"
                                {...register('totalFloors', { required: 'Required', min: { value: 1, message: 'Min 1' } })}
                            />
                        </FormField>
                        <FormField label="Basement Levels (0 if none)">
                            <Input type="number" min={0} defaultValue={0} {...register('basementLevels')} />
                        </FormField>
                    </div>
                </div>

                <FormField label="Amenities (comma-separated, optional)">
                    <Input placeholder="e.g. Gym, Pool, Clubhouse, Lift" {...register('amenities')} />
                </FormField>

                {!isEdit && (
                    <div className="flex items-start gap-3 rounded-xl bg-violet-50 p-3 ring-1 ring-violet-100">
                        <input
                            id="autoFloors"
                            type="checkbox"
                            defaultChecked
                            className="mt-0.5 h-4 w-4 accent-violet-600"
                            {...register('hasBasement')}
                        />
                        <div>
                            <label htmlFor="autoFloors" className="cursor-pointer text-sm font-medium text-slate-800">
                                Auto-generate all floors
                            </label>
                            <p className="mt-0.5 text-xs text-slate-500">
                                Generates Ground + all upper floors + basement levels automatically.
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                    <Button type="button" variant="secondary" onClick={handleClose}>Cancel</Button>
                    <Button type="submit" isLoading={isLoading}>
                        {isLoading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Tower'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
