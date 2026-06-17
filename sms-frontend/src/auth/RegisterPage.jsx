import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import {
  useRegisterResidentInitiateMutation,
  useRegisterResidentVerifyMutation,
  useRegisterResidentProfileMutation,
  useGetPublicSocietiesQuery,
  useGetPublicUnitsQuery
} from '../store/api/authApi';
import { Input } from '../components/ui/Input';
import { AuthCard } from '../components/ui/AuthCard';
import { Button } from '../components/ui/Button';
import { Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const [step, setStep] = useState(1); // 1: Initiate, 2: Verify, 3: Profile, 4: Success
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const navigate = useNavigate();

  // State between steps
  const [registrationEmail, setRegistrationEmail] = useState('');
  const [tempToken, setTempToken] = useState('');

  // Step 3 specific state
  const [selectedSocietyId, setSelectedSocietyId] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState('');

  // RTK Query Hooks
  const [initiate, { isLoading: isInitiating }] = useRegisterResidentInitiateMutation();
  const [verify, { isLoading: isVerifying }] = useRegisterResidentVerifyMutation();
  const [completeProfile, { isLoading: isCompleting }] = useRegisterResidentProfileMutation();

  const { data: societiesRes, isLoading: isLoadingSocieties } = useGetPublicSocietiesQuery(undefined, { skip: step < 3 });
  const { data: unitsRes, isLoading: isLoadingUnits } = useGetPublicUnitsQuery(selectedSocietyId, { skip: !selectedSocietyId });

  const societies = societiesRes?.data || [];
  const unitsData = unitsRes?.data?.grouped || {};

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onInitiate = async (formData) => {
    setErrorMsg(null);
    try {
      await initiate({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      }).unwrap();

      setRegistrationEmail(formData.email);
      setStep(2);
    } catch (err) {
      setErrorMsg(err.data?.message || err.data?.error || 'Failed to initiate registration');
    }
  };

  const onVerify = async (formData) => {
    setErrorMsg(null);
    try {
      const response = await verify({
        email: registrationEmail,
        otp: formData.otp,
      }).unwrap();

      setTempToken(response.data.token);
      setStep(3);
    } catch (err) {
      setErrorMsg(err.data?.message || err.data?.error || 'Invalid OTP');
    }
  };

  const onCompleteProfile = async (formData) => {
    setErrorMsg(null);
    if (!selectedUnitId) {
      setErrorMsg("Please select a valid unit.");
      return;
    }
    try {
      await completeProfile({
        tempToken,
        payload: {
          unitId: selectedUnitId,
          ownershipType: formData.ownershipType,
        }
      }).unwrap();

      setStep(4);
    } catch (err) {
      setErrorMsg(err.data?.message || err.data?.error || 'Failed to complete profile');
    }
  };

  return (
    <AuthCard
        title="Resident Registration"
        subtitle={
            step === 1 ? 'Step 1: Account Details' :
            step === 2 ? 'Step 2: Email Verification' :
            step === 3 ? 'Step 3: Flat Details' :
            'Complete'
        }
    >
          {errorMsg && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{errorMsg}</p>
            </div>
          )}

          {step === 1 && (
            <form className="space-y-4" onSubmit={handleSubmit(onInitiate)}>
              <div className="grid grid-cols-2 gap-4">
                <Input label="First Name" {...register('firstName', { required: 'Required' })} error={errors.firstName?.message} />
                <Input label="Last Name" {...register('lastName', { required: 'Required' })} error={errors.lastName?.message} />
              </div>
              <Input
                label="Email Address"
                type="email"
                {...register('email', { required: 'Required' })}
                error={errors.email?.message}
              />
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: 'Required', minLength: { value: 8, message: 'Min 8 chars' } })}
                  error={errors.password?.message}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-400"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <Button type="submit" disabled={isInitiating} className="w-full">
                {isInitiating ? 'Sending OTP...' : 'Continue'}
              </Button>
            </form>
          )}

          {step === 2 && (
            <form className="space-y-4" onSubmit={handleSubmit(onVerify)}>
              <p className="text-sm text-gray-600 text-center mb-4">
                We sent a 6-digit code to {registrationEmail}.
              </p>
              <Input
                label="Enter OTP Code"
                type="text"
                maxLength={6}
                className="text-center text-2xl tracking-widest"
                {...register('otp', { required: 'Required', minLength: 6 })}
                error={errors.otp?.message}
              />
              <Button type="submit" disabled={isVerifying} className="w-full">
                {isVerifying ? 'Verifying...' : 'Verify Email'}
              </Button>
            </form>
          )}

          {step === 3 && (
            <form className="space-y-4" onSubmit={handleSubmit(onCompleteProfile)}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Society</label>
                <select
                  className="w-full h-10 rounded-md border border-gray-300 bg-white px-3"
                  value={selectedSocietyId}
                  onChange={(e) => setSelectedSocietyId(e.target.value)}
                  disabled={isLoadingSocieties}
                  required
                >
                  <option value="">-- Choose Society --</option>
                  {societies.map(s => (
                    <option key={s._id} value={s._id}>{s.name} ({s.city})</option>
                  ))}
                </select>
              </div>

              {selectedSocietyId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Flat / Unit</label>
                  <select
                    className="w-full h-10 rounded-md border border-gray-300 bg-white px-3"
                    value={selectedUnitId}
                    onChange={(e) => setSelectedUnitId(e.target.value)}
                    disabled={isLoadingUnits}
                    required
                  >
                    <option value="">-- Choose Unit --</option>
                    {Object.entries(unitsData).map(([tower, floors]) => (
                      <optgroup key={tower} label={`Tower ${tower}`}>
                        {Object.entries(floors).map(([floor, units]) => (
                          units.map(unit => (
                            <option key={unit._id} value={unit._id}>
                              {tower} - {floor} - Unit {unit.unitNumber} ({unit.bhkType})
                            </option>
                          ))
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ownership Type</label>
                <select
                  className="w-full h-10 rounded-md border border-gray-300 bg-white px-3"
                  {...register('ownershipType', { required: 'Required' })}
                >
                  <option value="">-- Choose --</option>
                  <option value="OWNER">Owner</option>
                  <option value="TENANT">Tenant</option>
                </select>
              </div>

              <Button type="submit" disabled={isCompleting || !selectedUnitId} className="w-full">
                {isCompleting ? 'Submitting...' : 'Submit Profile'}
              </Button>
            </form>
          )}

          {step === 4 && (
            <div className="text-center space-y-4 py-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Registration Complete</h3>
              <p className="text-sm text-gray-500">
                Your profile has been submitted to the Society Admin for approval. You will receive an email once you are approved.
              </p>
              <Button onClick={() => navigate('/auth/login')} className="mt-4 w-full">
                Return to Login
              </Button>
            </div>
          )}

        {step < 4 && (
          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </p>
        )}
    </AuthCard>
  );
}
