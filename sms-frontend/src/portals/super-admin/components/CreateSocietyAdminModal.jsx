import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import {
    useCreateSocietyAdminMutation,
    useListSocietiesForSelectQuery,
} from '../../../store/api/superAdminApi';

/**
 * CreateSocietyAdminModal — modal for assigning a SOCIETY_ADMIN to an existing society.
 * @param {{ isOpen: boolean, onClose: () => void }} props
 */
export default function CreateSocietyAdminModal({ isOpen, onClose }) {
    const [createAdmin, { isLoading }] = useCreateSocietyAdminMutation();
    const { data: societiesData } = useListSocietiesForSelectQuery(undefined, { skip: !isOpen });
    const [errorMsg, setErrorMsg] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();

    const societies = societiesData?.data ?? [];

    const onSubmit = async (data) => {
        setErrorMsg(null);
        setSuccessMsg(null);
        try {
            await createAdmin(data).unwrap();
            setSuccessMsg('Society Admin provisioned successfully. Credentials sent via email.');
            setTimeout(() => {
                reset();
                setSuccessMsg(null);
                onClose();
            }, 2000);
        } catch (err) {
            setErrorMsg(err?.data?.message || 'Failed to create admin. Please try again.');
        }
    };

    const handleClose = () => {
        reset();
        setErrorMsg(null);
        setSuccessMsg(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            <div className="relative z-10 mx-4 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Assign Society Admin</h2>
                        <p className="text-sm text-gray-500">Credentials will be emailed to the new admin</p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="px-6 py-5 space-y-4">
                        {errorMsg && (
                            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
                                {errorMsg}
                            </div>
                        )}
                        {successMsg && (
                            <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-200">
                                {successMsg}
                            </div>
                        )}

                        <div className="grid gap-4 sm:grid-cols-2">
                            <Input
                                label="First Name"
                                {...register('firstName', { required: 'Required' })}
                                error={errors.firstName?.message}
                            />
                            <Input
                                label="Last Name"
                                {...register('lastName', { required: 'Required' })}
                                error={errors.lastName?.message}
                            />
                        </div>
                        <Input
                            label="Email"
                            type="email"
                            {...register('email', { required: 'Email is required' })}
                            error={errors.email?.message}
                        />
                        <Input
                            label="Phone"
                            {...register('phone', { required: 'Phone is required' })}
                            error={errors.phone?.message}
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Society
                            </label>
                            <select
                                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                {...register('societyId', { required: 'Please select a society' })}
                            >
                                <option value="">— Select a society —</option>
                                {societies.map((s) => (
                                    <option key={s._id} value={s._id}>
                                        {s.name} ({s.city})
                                    </option>
                                ))}
                            </select>
                            {errors.societyId && (
                                <p className="mt-1 text-sm text-red-500">{errors.societyId.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
                        <Button type="button" variant="secondary" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isLoading}>
                            {isLoading ? 'Creating...' : 'Create Admin'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
