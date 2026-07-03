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
import { useDispatch, useSelector } from 'react-redux';
import {
    useRegisterResidentInitiateMutation,
    useRegisterResidentVerifyMutation,
    useRegisterResidentProfileMutation,
    useGetPublicSocietiesQuery,
    useGetPublicUnitsQuery
} from '../store/api/authApi';
import { setCredentials, logout } from '../store/slices/authSlice';
import { Input } from '../components/ui/Input';
import { AuthCard } from '../components/ui/AuthCard';
import { Button } from '../components/ui/Button';
import { Eye, EyeOff, CheckCircle2, ArrowRight, Building2, Home, Upload, AlertCircle, Lock, Mail, User } from 'lucide-react';

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
    const { isAuthenticated, user, accessToken, refreshToken } = useSelector((state) => state.auth);
    const [step, setStep] = useState(() => {
        if (isAuthenticated && user?.registrationStatus === 'INCOMPLETE_PROFILE') return 3;
        return 1;
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [registrationEmail, setRegistrationEmail] = useState('');
    const [selectedSocietyId, setSelectedSocietyId] = useState('');
    const [selectedUnitId, setSelectedUnitId] = useState('');
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePhoto(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

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

            const { accessToken, refreshToken, user } = response.data;
            dispatch(setCredentials({ user, accessToken, refreshToken }));

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
            const data = new FormData();
            data.append('unitId', selectedUnitId);
            data.append('ownershipType', formData.ownershipType);
            if (profilePhoto) {
                data.append('profilePhoto', profilePhoto);
            }

            // Token is already in localStorage via setCredentials → axiosBaseQuery picks it up
            const res = await completeProfile({
                payload: data,
            }).unwrap();

            // The backend returns the updated user in res.data.user
            // We need to update Redux so the frontend knows they are now PENDING_APPROVAL
            if (res?.data?.user) {
                dispatch(setCredentials({
                    user: res.data.user,
                    accessToken: res.data.accessToken || accessToken,
                    refreshToken: res.data.refreshToken || refreshToken
                }));
            }

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
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600 font-medium leading-relaxed">{errorMsg}</p>
                </div>
            )}

            {/* ── Step 1: Account Details ── */}
            {step === 1 && (
                <form className="space-y-4" onSubmit={handleSubmit(onInitiate)}>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="First Name"
                            icon={User}
                            placeholder="John"
                            error={errors.firstName?.message}
                            {...register('firstName', { required: 'Required' })}
                        />
                        <Input
                            label="Last Name"
                            icon={User}
                            placeholder="Doe"
                            error={errors.lastName?.message}
                            {...register('lastName', { required: 'Required' })}
                        />
                    </div>
                    <Input
                        label="Email Address"
                        icon={Mail}
                        type="email"
                        placeholder="john@example.com"
                        error={errors.email?.message}
                        {...register('email', { required: 'Required' })}
                    />
                    <Input
                        label="Password"
                        icon={Lock}
                        type="password"
                        placeholder="Create a strong password"
                        error={errors.password?.message}
                        {...register('password', {
                            required: 'Required',
                            minLength: { value: 6, message: 'Min 6 chars' },
                        })}
                    />
                    <div className="pt-2">
                        <Button type="submit" className="w-full" disabled={isInitiating}>
                            {isInitiating ? 'Creating Account...' : 'Continue to Verify'}
                        </Button>
                    </div>
                </form>
            )}

            {/* ── Step 2: OTP Verification ── */}
            {step === 2 && (
                <form className="space-y-6" onSubmit={handleSubmit(onVerify)}>
                    <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Check your email</h3>
                        <p className="text-sm text-slate-500">
                            We've sent a 6-digit verification code to <br />
                            <span className="font-medium text-slate-700">{registrationEmail}</span>
                        </p>
                    </div>
                    <Input
                        label="Verification Code"
                        icon={CheckCircle2}
                        type="text"
                        placeholder="123456"
                        maxLength={6}
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

                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center justify-center space-y-3 mb-6">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-10 h-10 text-slate-400" />
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 rounded-full text-white cursor-pointer hover:bg-indigo-700 shadow-md transition-colors">
                                <Upload className="w-4 h-4" />
                                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                            </label>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">Upload Profile Photo (Optional)</p>
                    </div>

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
                    {isAuthenticated && (
                        <button
                            type="button"
                            onClick={() => {
                                dispatch(logout());
                                setStep(1);
                            }}
                            className="w-full mt-3 text-sm text-slate-500 hover:text-indigo-600 transition-colors"
                        >
                            Not you? Start over
                        </button>
                    )}
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
