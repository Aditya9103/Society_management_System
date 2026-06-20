import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCreateSocietyAdminMutation, useListSocietiesForSelectQuery } from '../../../store/api/superAdminApi';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Alert from '../../../components/ui/Alert';
import FormField from '../../../components/ui/FormField';

export default function CreateSocietyAdminModal({ isOpen, onClose }) {
  const [createAdmin, { isLoading }] = useCreateSocietyAdminMutation();
  const { data: societiesData } = useListSocietiesForSelectQuery(undefined, { skip: !isOpen });
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const societies = societiesData?.data ?? [];

  const onSubmit = async (data) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await createAdmin(data).unwrap();
      setSuccessMsg('Society Admin created. Credentials sent via email.');
      setTimeout(() => { reset(); setSuccessMsg(null); onClose(); }, 2000);
    } catch (err) {
      setErrorMsg(err?.data?.message || 'Failed to create admin. Please try again.');
    }
  };

  const handleClose = () => { reset(); setErrorMsg(null); setSuccessMsg(null); onClose(); };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Assign Society Admin" description="Credentials will be emailed to the new admin">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errorMsg && <Alert type="error">{errorMsg}</Alert>}
        {successMsg && <Alert type="success">{successMsg}</Alert>}

        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="First Name" {...register('firstName', { required: 'Required' })} error={errors.firstName?.message} />
          <Input label="Last Name" {...register('lastName', { required: 'Required' })} error={errors.lastName?.message} />
        </div>
        <Input label="Email" type="email" {...register('email', { required: 'Email is required' })} error={errors.email?.message} />
        <Input label="Phone" {...register('phone', { required: 'Phone is required' })} error={errors.phone?.message} />

        <FormField label="Society" error={errors.societyId?.message} required>
          <Select {...register('societyId', { required: 'Please select a society' })}>
            <option value="">— Select a society —</option>
            {societies.map((s) => (
              <option key={s._id} value={s._id}>{s.name} ({s.city})</option>
            ))}
          </Select>
        </FormField>

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <Button type="button" variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button type="submit" isLoading={isLoading}>
            {isLoading ? 'Creating…' : 'Create Admin'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
