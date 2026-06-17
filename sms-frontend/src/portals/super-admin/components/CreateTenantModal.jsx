import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useCreateTenantWithSocietyMutation, useListSocietiesForSelectQuery } from '../../../store/api/superAdminApi';

/**
 * CreateTenantModal — slide-in modal for provisioning a new Tenant + Society.
 * @param {{ isOpen: boolean, onClose: () => void }} props
 */
export default function CreateTenantModal({ isOpen, onClose }) {
    // const [createTenant, { isLoading }] = useCreateTenantWithSocietyMutation();
    // const [errorMsg, setErrorMsg] = useState(null);
    const [createTenant, { isLoading }] = useCreateTenantWithSocietyMutation();
    const [errorMsg, setErrorMsg] = useState(null)


    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        setErrorMsg(null);
        try {
            await createTenant(data).unwrap();
            reset();
            onClose();
        } catch (err) {
            setErrorMsg(err?.data?.message || 'Failed to create tenant. Please try again.');
        }
    };

    const handleClose = () => {
        reset();
        setErrorMsg(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative z-10 mx-4 w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Provision New Tenant</h2>
                        <p className="text-sm text-gray-500">Create a new tenant and their first society</p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="max-h-[70vh] overflow-y-auto px-6 py-5 space-y-6">
                        {errorMsg && (
                            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
                                {errorMsg}
                            </div>
                        )}

                        {/* Tenant Details */}
                        <div>
                            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
                                Tenant Details
                            </h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Input
                                    label="Organization Name"
                                    placeholder="e.g. Green Valley Housing"
                                    {...register('tenantName', { required: 'Organization name is required' })}
                                    error={errors.tenantName?.message}
                                />
                                <Input
                                    label="URL Slug"
                                    placeholder="e.g. green-valley"
                                    {...register('tenantSlug', {
                                        required: 'Slug is required',
                                        pattern: {
                                            value: /^[a-z0-9-]+$/,
                                            message: 'Lowercase letters, numbers, hyphens only',
                                        },
                                    })}
                                    error={errors.tenantSlug?.message}
                                />
                                <Input
                                    label="Contact Name"
                                    placeholder="Primary contact person"
                                    {...register('contactName', { required: 'Contact name is required' })}
                                    error={errors.contactName?.message}
                                />
                                <Input
                                    label="Contact Email"
                                    type="email"
                                    placeholder="admin@example.com"
                                    {...register('contactEmail', { required: 'Email is required' })}
                                    error={errors.contactEmail?.message}
                                />
                                <Input
                                    label="Contact Phone"
                                    placeholder="+91 98765 43210"
                                    {...register('contactPhone', { required: 'Phone is required' })}
                                    error={errors.contactPhone?.message}
                                />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        {...register('plan')}
                                    >
                                        <option value="BASIC">Basic</option>
                                        <option value="STANDARD">Standard</option>
                                        <option value="ENTERPRISE">Enterprise</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Society Details */}
                        <div>
                            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
                                Society Details
                            </h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <Input
                                        label="Society Name"
                                        placeholder="e.g. Green Valley Apartments"
                                        {...register('societyName', { required: 'Society name is required' })}
                                        error={errors.societyName?.message}
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <Input
                                        label="Address Line 1"
                                        placeholder="Street address"
                                        {...register('addressLine1', { required: 'Address is required' })}
                                        error={errors.addressLine1?.message}
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <Input
                                        label="Address Line 2 (optional)"
                                        placeholder="Landmark, area"
                                        {...register('addressLine2')}
                                    />
                                </div>
                                <Input
                                    label="City"
                                    {...register('city', { required: 'City is required' })}
                                    error={errors.city?.message}
                                />
                                <Input
                                    label="State"
                                    {...register('state', { required: 'State is required' })}
                                    error={errors.state?.message}
                                />
                                <Input
                                    label="Pincode"
                                    placeholder="6-digit pincode"
                                    {...register('pincode', {
                                        required: 'Pincode is required',
                                        pattern: { value: /^\d{6}$/, message: 'Must be 6 digits' },
                                    })}
                                    error={errors.pincode?.message}
                                />
                                <Input
                                    label="Country"
                                    defaultValue="India"
                                    {...register('country')}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
                        <Button type="button" variant="secondary" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isLoading}>
                            {isLoading ? 'Provisioning...' : 'Provision Tenant'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
