/**
 * CreateStaffModal.jsx — Modal to create a new staff account.
 * Uses global components from src/components/ui/.
 */
import React from 'react';
import { useForm } from 'react-hook-form';
import { useCreateStaffMutation } from '../../../store/api/societyAdminApi';
import { Button } from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import FormField from '../../../components/ui/FormField';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import Alert from '../../../components/ui/Alert';

const ROLE_OPTIONS = [
    { value: 'COMMITTEE_MEMBER', label: 'Committee Member' },
    { value: 'ACCOUNTANT', label: 'Accountant' },
    { value: 'FACILITY_MANAGER', label: 'Facility Manager' },
    { value: 'HELP_DESK', label: 'Help Desk' },
    { value: 'SECURITY_GUARD', label: 'Security Guard' },
];

export default function CreateStaffModal({ isOpen, onClose }) {
    const [createStaff, { isLoading }] = useCreateStaffMutation();
    const [errorMsg, setErrorMsg] = React.useState(null);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const onSubmit = async (formData) => {
        setErrorMsg(null);
        try {
            await createStaff(formData).unwrap();
            reset();
            onClose();
        } catch (err) {
            setErrorMsg(err?.data?.message ?? 'Failed to create staff member.');
        }
    };

    const handleClose = () => { reset(); setErrorMsg(null); onClose(); };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Add Staff Member"
            description="Create an account for a new staff member. Login credentials will be emailed automatically."
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {errorMsg && <Alert type="error">{errorMsg}</Alert>}

                <div>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Personal Info</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormField label="First Name" error={errors.firstName?.message} required>
                            <Input placeholder="First name" {...register('firstName', { required: 'First name is required' })} />
                        </FormField>
                        <FormField label="Last Name" error={errors.lastName?.message} required>
                            <Input placeholder="Last name" {...register('lastName', { required: 'Last name is required' })} />
                        </FormField>
                    </div>
                </div>

                <div>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Contact</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormField label="Email Address" error={errors.email?.message} required>
                            <Input type="email" placeholder="staff@email.com" {...register('email', { required: 'Email is required' })} />
                        </FormField>
                        <FormField label="Phone Number" error={errors.phone?.message} required>
                            <Input placeholder="+91 XXXXXXXXXX" {...register('phone', { required: 'Phone is required' })} />
                        </FormField>
                    </div>
                </div>

                <FormField label="Role" error={errors.role?.message} required>
                    <Select {...register('role', { required: 'Role is required' })}>
                        <option value="">Select a role</option>
                        {ROLE_OPTIONS.map((r) => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                    </Select>
                </FormField>

                <Alert type="warning">
                    A temporary password will be auto-generated and emailed to the staff member.
                </Alert>

                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                    <Button type="button" variant="secondary" onClick={handleClose}>Cancel</Button>
                    <Button type="submit" isLoading={isLoading}>
                        {isLoading ? 'Creating…' : 'Create Staff Member'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
