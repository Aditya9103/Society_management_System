import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useCreateFloorMutation, useUpdateFloorMutation } from '../../../../store/api/societyAdminApi';
import { Button } from '../../../../components/ui/Button';
import Modal from '../../../../components/ui/Modal';
import Alert from '../../../../components/ui/Alert';

export default function FloorModal({ tower, floor, isOpen, onClose }) {
    const initialData = floor;
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
            title={isEdit ? `Edit Floor` : `Add Floor`}
            description={isEdit ? `Update floor in ${tower?.name ?? ''}` : `Add a new floor to ${tower?.name ?? ''}`}
            maxWidth="max-w-md"
            theme="dark"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                {errorMsg && <Alert type="error" className="mb-4">{errorMsg}</Alert>}
                
                <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-1.5">Floor Number <span className="text-red-500">*</span></label>
                    <input 
                        type="number"
                        className={`w-full bg-[#131525] border ${errors.floorNumber ? 'border-red-500' : 'border-slate-800'} text-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#6338f0]`} 
                        placeholder="e.g. 13 or -1 for basement" 
                        {...register('floorNumber', { required: 'Required' })} 
                    />
                    {errors.floorNumber && <p className="text-xs text-red-500 mt-1">{errors.floorNumber.message}</p>}
                    <p className="text-xs text-slate-500 mt-1">Use negative numbers for basement levels.</p>
                </div>
                
                <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-1.5">Floor Name <span className="text-red-500">*</span></label>
                    <input 
                        className={`w-full bg-[#131525] border ${errors.floorName ? 'border-red-500' : 'border-slate-800'} text-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#6338f0]`} 
                        placeholder="e.g. Floor 13" 
                        {...register('floorName', { required: 'Required' })} 
                    />
                    {errors.floorName && <p className="text-xs text-red-500 mt-1">{errors.floorName.message}</p>}
                </div>

                <div className="flex justify-between border-t border-slate-800/50 pt-6 mt-6">
                    <Button type="button" variant="secondary" onClick={handleClose} className="bg-transparent border-none text-slate-400 hover:text-white">Cancel</Button>
                    <Button type="submit" isLoading={isLoading} className="bg-[#6338f0] hover:bg-[#5225e2] text-white shadow-lg shadow-indigo-600/20">
                        {isLoading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Floor'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
