/**
 * CreateTenantModal.jsx — Provision a new Tenant + Society.
 * Migrated to use global Modal, FormField, Input, Select, Alert components.
 */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import FormField from '../../../components/ui/FormField';
import Alert from '../../../components/ui/Alert';
import { useCreateTenantWithSocietyMutation } from '../../../store/api/superAdminApi';

export default function CreateTenantModal({ isOpen, onClose }) {
    const [createTenant, { isLoading }] = useCreateTenantWithSocietyMutation();
    const [errorMsg, setErrorMsg] = useState(null);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

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

    const handleClose = () => { reset(); setErrorMsg(null); onClose(); };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Provision New Tenant" description="Create a new tenant and their first society" size="lg">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col" style={{ maxHeight: '75vh' }}>

                {/* ── Scrollable body ── */}
                <div className="flex-1 overflow-y-auto space-y-6 px-1 pb-2">
                    {errorMsg && <Alert type="error">{errorMsg}</Alert>}

                    {/* Tenant Details */}
                    <div>
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Tenant Details</p>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField label="Organization Name" error={errors.tenantName?.message} required>
                                <Input placeholder="e.g. Green Valley Housing" {...register('tenantName', { required: 'Organization name is required' })} />
                            </FormField>
                            <FormField label="URL Slug" error={errors.tenantSlug?.message} required hint="Lowercase letters, numbers, hyphens only">
                                <Input placeholder="e.g. green-valley" {...register('tenantSlug', {
                                    required: 'Slug is required',
                                    pattern: { value: /^[a-z0-9-]+$/, message: 'Lowercase letters, numbers, hyphens only' },
                                })} />
                            </FormField>
                            <FormField label="Contact Name" error={errors.contactName?.message} required>
                                <Input placeholder="Primary contact person" {...register('contactName', { required: 'Contact name is required' })} />
                            </FormField>
                            <FormField label="Contact Email" error={errors.contactEmail?.message} required>
                                <Input type="email" placeholder="admin@example.com" {...register('contactEmail', { required: 'Email is required' })} />
                            </FormField>
                            <FormField label="Contact Phone" error={errors.contactPhone?.message} required>
                                <Input placeholder="+91 98765 43210" {...register('contactPhone', { required: 'Phone is required' })} />
                            </FormField>
                            <FormField label="Plan">
                                <Select {...register('plan')}>
                                    <option value="BASIC">Basic</option>
                                    <option value="STANDARD">Standard</option>
                                    <option value="ENTERPRISE">Enterprise</option>
                                </Select>
                            </FormField>
                        </div>
                    </div>

                    {/* Society Details */}
                    <div>
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Society Details</p>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <FormField label="Society Name" error={errors.societyName?.message} required>
                                    <Input placeholder="e.g. Green Valley Apartments" {...register('societyName', { required: 'Society name is required' })} />
                                </FormField>
                            </div>
                            <div className="sm:col-span-2">
                                <FormField label="Address Line 1" error={errors.addressLine1?.message} required>
                                    <Input placeholder="Street address" {...register('addressLine1', { required: 'Address is required' })} />
                                </FormField>
                            </div>
                            <div className="sm:col-span-2">
                                <FormField label="Address Line 2 (optional)">
                                    <Input placeholder="Landmark, area" {...register('addressLine2')} />
                                </FormField>
                            </div>
                            <FormField label="City" error={errors.city?.message} required>
                                <Input {...register('city', { required: 'City is required' })} />
                            </FormField>
                            <FormField label="State" error={errors.state?.message} required>
                                <Input {...register('state', { required: 'State is required' })} />
                            </FormField>
                            <FormField label="Pincode" error={errors.pincode?.message} required>
                                <Input placeholder="6-digit pincode" {...register('pincode', {
                                    required: 'Pincode is required',
                                    pattern: { value: /^\d{6}$/, message: 'Must be 6 digits' },
                                })} />
                            </FormField>
                            <FormField label="Country">
                                <Input defaultValue="India" {...register('country')} />
                            </FormField>
                        </div>
                    </div>
                </div>

                {/* ── Pinned footer — always visible ── */}
                <div className="flex shrink-0 justify-end gap-3 border-t border-slate-100 pt-4">
                    <Button type="button" variant="secondary" onClick={handleClose}>Cancel</Button>
                    <Button type="submit" isLoading={isLoading}>
                        {isLoading ? 'Provisioning…' : 'Provision Tenant'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
