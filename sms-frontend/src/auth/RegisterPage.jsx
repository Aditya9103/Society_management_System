/**
 * RegisterPage.jsx — 4-step resident self-registration flow.
 *
 * Step 1: Account details (name, email, password)   → POST /auth/register/resident/initiate
 * Step 2: OTP verification                          → POST /auth/register/resident/verify
 *         ↳ receives { accessToken, user } — token stored in Redux
 * Step 3: Flat selection & ownership type           → POST /residents/profile (authenticated)
 * Step 4: Success screen
 */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
    useRegisterResidentInitiateMutation,
    useRegisterResidentVerifyMutation,
    useRegisterResidentProfileMutation,
    useGetPublicSocietiesQuery,
    useGetPublicUnitsQuery,
} from '../store/api/authApi';
import { setCredentials } from '../store/slices/authSlice';
import { Input } from '../components/ui/Input';
import { AuthCard } from '../components/ui/AuthCard';
import { Button } from '../components/ui/Button';
import { Eye, EyeOff, CheckCircle2, ArrowRight, Building2, Home } from 'lucide-react';

// ── Step indicator ────────────────────────────────────────────────────────────
function StepDot({ n, current }) {
    const done = current > n;
    const active = current === n;
    return (
        <div className="flex items-center gap-1.5">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${done ? 'bg-indigo-600 text-white' :
                    active ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-400' :
                        'bg-slate-100 text-slate-400'
                }`}>
                {done ? <CheckCircle2 className="h-4 w-4" /> : n}
            </div>
            {n < 3 && <div className={`h-0.5 w-6 rounded ${current > n ? 'bg-indigo-400' : 'bg-slate-200'}`} />}
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function RegisterPage() {
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [registrationEmail, setRegistrationEmail] = useState('');
    const [selectedSocietyId, setSelectedSocietyId] = useState('');
    const [selectedUnitId, setSelectedUnitId] = useState('');

    const navigate = useNavigate();
    const dispatch = useDispatch();

    // ── Mutations ──────────────────────────────────────────────────────────────
    const [initiate, { isLoading: isInitiating }] = useRegisterResidentInitiateMutation();
    const [verify, { isLoading: isVerifying }] = useRegisterResidentVerifyMutation();
    const [completeProfile, { isLoading: isCompleting }] = useRegisterResidentProfileMutation();

    // ── Public data for Step 3 ─────────────────────────────────────────────────
    const { data: societiesRes, isLoading: isLoadingSocieties } = useGetPublicSocietiesQuery(
        undefined,
        { skip: step < 3 }
    );
    const { data: unitsRes, isLoading: isLoadingUnits } = useGetPublicUnitsQuery(
        selectedSocietyId,
        { skip: !selectedSocietyId }
    );

    // axiosBaseQuery returns { data: axiosResponseBody }
    // axiosResponseBody = { success, data: [...societies], message }
    // So societiesRes.data = the societies array
    const societies = Array.isArray(societiesRes?.data)
        ? societiesRes.data
        : (societiesRes?.data?.data ?? []);
    const groupedUnits = unitsRes?.data?.grouped ?? {};

    const { register, handleSubmit, formState: { errors }, getValues } = useForm();

    // ── Step 1: Initiate ───────────────────────────────────────────────────────
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
            setErrorMsg(err?.data?.message ?? 'Failed to initiate registration. Please try again.');
        }
    };

    // ── Step 2: Verify OTP & store token in Redux ──────────────────────────────
    const onVerify = async (formData) => {
        setErrorMsg(null);
        try {
            const response = await verify({
                email: registrationEmail,
                otp: formData.otp,
            }).unwrap();

            // Backend returns: { success, data: { accessToken, refreshToken, user }, message }
            const { accessToken, user } = response.data;

            // Persist token so subsequent authenticated calls (step 3) work
            dispatch(setCredentials({ user, accessToken }));

            setStep(3);
        } catch (err) {
            setErrorMsg(err?.data?.message ?? 'Invalid or expired OTP. Please try again.');
        }
    };

    // ── Step 3: Complete profile ───────────────────────────────────────────────
    const onCompleteProfile = async (formData) => {
        setErrorMsg(null);
        if (!selectedUnitId) {
            setErrorMsg('Please select a valid unit before submitting.');
            return;
        }
        try {
            // Token is already in localStorage via setCredentials → axiosBaseQuery picks it up
            await completeProfile({
                payload: {
                    unitId: selectedUnitId,
                    ownershipType: formData.ownershipType,
                },
            }).unwrap();
            setStep(4);
        } catch (err) {
            setErrorMsg(err?.data?.message ?? 'Failed to complete profile. Please try again.');
        }
    };

    const STEP_TITLES = ['', 'Account Details', 'Email Verification', 'Flat Details'];

    return (
        <AuthCard
            title="Resident Registration"
            subtitle={`Step ${Math.min(step, 3)} of 3 — ${STEP_TITLES[Math.min(step, 3)]}`}
        >
            {/* Progress dots */}
            {step < 4 && (
                <div className="mb-6 flex items-center justify-center gap-0">
                    {[1, 2, 3].map((n) => <StepDot key={n} n={n} current={step} />)}
                </div>
            )}

            {/* Error banner */}
            {errorMsg && (
                <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
                    {errorMsg}
                </div>
            )}

            {/* ── Step 1: Account Details ── */}
            {step === 1 && (
                <form className="space-y-4" onSubmit={handleSubmit(onInitiate)}>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="First Name"
                            autoFocus
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
                        label="Email Address"
                        type="email"
                        autoComplete="email"
                        {...register('email', { required: 'Required' })}
                        error={errors.email?.message}
                    />
                    <div className="relative">
                        <Input
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            {...register('password', {
                                required: 'Required',
                                minLength: { value: 8, message: 'Minimum 8 characters' },
                            })}
                            error={errors.password?.message}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((s) => !s)}
                            className="absolute right-3 top-9 text-gray-400 hover:text-gray-500"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    <Button type="submit" disabled={isInitiating} className="w-full" isLoading={isInitiating}>
                        Continue <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Button>
                </form>
            )}

            {/* ── Step 2: OTP Verification ── */}
            {step === 2 && (
                <form className="space-y-4" onSubmit={handleSubmit(onVerify)}>
                    <p className="text-center text-sm text-gray-500">
                        We sent a 6-digit code to <span className="font-semibold text-gray-800">{registrationEmail}</span>
                    </p>
                    <Input
                        label="Enter 6-digit OTP"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        className="text-center text-2xl tracking-[0.5em]"
                        autoFocus
                        {...register('otp', {
                            required: 'Required',
                            minLength: { value: 6, message: 'Enter all 6 digits' },
                        })}
                        error={errors.otp?.message}
                    />
                    <Button type="submit" disabled={isVerifying} className="w-full" isLoading={isVerifying}>
                        Verify Email <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Button>
                    <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="w-full text-center text-sm text-indigo-600 hover:text-indigo-500"
                    >
                        ← Change email address
                    </button>
                </form>
            )}

            {/* ── Step 3: Flat Details ── */}
            {step === 3 && (
                <form className="space-y-4" onSubmit={handleSubmit(onCompleteProfile)}>
                    {/* Society */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            <Building2 className="mr-1 inline h-4 w-4 text-indigo-500" /> Select Society
                        </label>
                        <select
                            className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            value={selectedSocietyId}
                            onChange={(e) => { setSelectedSocietyId(e.target.value); setSelectedUnitId(''); }}
                            disabled={isLoadingSocieties}
                            required
                        >
                            <option value="">— Choose your society —</option>
                            {societies.map((s) => (
                                <option key={s._id} value={s._id}>
                                    {s.name} {s.city ? `· ${s.city}` : ''}
                                </option>
                            ))}
                        </select>
                        {isLoadingSocieties && <p className="mt-1 text-xs text-slate-400">Loading societies…</p>}
                    </div>

                    {/* Unit — shown only after society selected */}
                    {selectedSocietyId && (
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                <Home className="mr-1 inline h-4 w-4 text-indigo-500" /> Select Unit / Flat
                            </label>
                            <select
                                className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                value={selectedUnitId}
                                onChange={(e) => setSelectedUnitId(e.target.value)}
                                disabled={isLoadingUnits}
                                required
                            >
                                <option value="">— Choose a vacant unit —</option>
                                {Object.entries(groupedUnits).map(([towerName, floors]) =>
                                    Object.entries(floors).map(([floorName, units]) =>
                                        units.map((unit) => (
                                            <option key={unit._id} value={unit._id}>
                                                {towerName} · {floorName} · Unit {unit.unitNumber}
                                                {unit.bhkType ? ` (${unit.bhkType})` : ''}
                                            </option>
                                        ))
                                    )
                                )}
                            </select>
                            {isLoadingUnits && <p className="mt-1 text-xs text-slate-400">Loading units…</p>}
                            {!isLoadingUnits && Object.keys(groupedUnits).length === 0 && (
                                <p className="mt-1 text-xs text-red-500">No vacant units found in this society.</p>
                            )}
                        </div>
                    )}

                    {/* Ownership type */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Ownership Type</label>
                        <select
                            className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            {...register('ownershipType', { required: 'Required' })}
                        >
                            <option value="">— Choose —</option>
                            <option value="OWNER">Owner</option>
                            <option value="TENANT"> Renter</option>
                        </select>
                        {errors.ownershipType && (
                            <p className="mt-1 text-xs text-red-500">{errors.ownershipType.message}</p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        disabled={isCompleting || !selectedUnitId}
                        className="w-full"
                        isLoading={isCompleting}
                    >
                        Submit for Approval <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Button>
                </form>
            )}

            {/* ── Step 4: Success ── */}
            {step === 4 && (
                <div className="space-y-4 py-6 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                        <CheckCircle2 className="h-9 w-9 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Registration Submitted!</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                        Your profile has been submitted to the <strong>Society Admin</strong> for review.
                        You will receive an email confirmation once your account is approved.
                        This typically takes 1–2 business days.
                    </p>
                    <Button onClick={() => navigate('/auth/login')} className="mt-2 w-full">
                        Return to Login
                    </Button>
                </div>
            )}

            {/* Footer link */}
            {step < 4 && (
                <p className="mt-5 text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link to="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                        Sign in
                    </Link>
                </p>
            )}
        </AuthCard>
    );
}
