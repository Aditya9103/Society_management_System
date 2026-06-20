import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
    useSendOtpMutation,
    useLoginWithOtpMutation,
    useLoginWithPasswordMutation
} from '../store/api/authApi';
import { setCredentials } from '../store/slices/authSlice';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { AuthCard } from '../components/ui/AuthCard';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
    const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'otp'
    const [otpSent, setOtpSent] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [sendOtp, { isLoading: isSendingOtp }] = useSendOtpMutation();
    const [loginWithPassword, { isLoading: isLoggingInWithPassword }] = useLoginWithPasswordMutation();
    const [loginWithOtp, { isLoading: isLoggingInWithOtp }] = useLoginWithOtpMutation();

    const loading = isSendingOtp || isLoggingInWithPassword || isLoggingInWithOtp;

    const { register, handleSubmit, formState: { errors }, watch } = useForm();
    const emailVal = watch('email');

    const onSendOtp = async () => {
        if (!emailVal) {
            setErrorMsg("Please enter your email first");
            return;
        }
        setErrorMsg(null);
        try {
            await sendOtp({ email: emailVal, purpose: 'LOGIN' }).unwrap();
            setOtpSent(true);
        } catch (err) {
            setErrorMsg(err.data?.error || err.data?.message || 'Failed to send OTP');
        }
    };

    const onSubmit = async (formData) => {
        setErrorMsg(null);
        try {
            let data;
            if (loginMethod === 'password') {
                data = await loginWithPassword({
                    identifier: formData.email,
                    password: formData.password
                }).unwrap();
            } else {
                data = await loginWithOtp({
                    email: formData.email,
                    otp: formData.otp
                }).unwrap();
            }

            // Extract actual payload nested inside data layer from backend standard response
            const authData = data.data;

            dispatch(setCredentials({
                user: authData.user,
                accessToken: authData.accessToken
            }));

            // Redirect based on user role
            if (authData.user.role === 'SUPER_ADMIN') {
                navigate('/super-admin');
            } else if (authData.user.role === 'SOCIETY_ADMIN') {
                navigate('/admin');
            } else if (authData.user.role === 'RESIDENT') {
                navigate('/resident');
            } else if (authData.user.role === 'SECURITY_GUARD') {
                // Guard has its own dedicated portal
                navigate('/guard');
            } else {
                // COMMITTEE_MEMBER | ACCOUNTANT | FACILITY_MANAGER | HELP_DESK
                navigate('/staff');
            }
        } catch (err) {
            setErrorMsg(err.data?.message || err.data?.error || 'Login failed');
        }
    };

    return (
        <AuthCard
            title="Welcome back"
            subtitle="Please sign in to your account"
        >
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    {errorMsg && (
                        <div className="rounded-md bg-red-50 p-4">
                            <p className="text-sm text-red-700">{errorMsg}</p>
                        </div>
                    )}

                    <div className="space-y-4 text-left">
                        <Input
                            id="email"
                            label="Email Address"
                            type="email"
                            autoComplete="username"
                            {...register('email', { required: 'Email is required' })}
                            error={errors.email?.message}
                        />

                        {loginMethod === 'password' && (
                            <div className="relative text-left">
                                <Input
                                    id="password"
                                    label="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    {...register('password', { required: 'Password is required' })}
                                    error={errors.password?.message}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-9 text-gray-400 hover:text-gray-500"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        )}

                        {loginMethod === 'otp' && otpSent && (
                            <Input
                                id="otp"
                                label="Enter OTP"
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                {...register('otp', { required: 'OTP is required' })}
                                error={errors.otp?.message}
                            />
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => {
                                setLoginMethod(loginMethod === 'password' ? 'otp' : 'password');
                                setOtpSent(false);
                                setErrorMsg(null);
                            }}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                        >
                            {loginMethod === 'password' ? 'Login with OTP instead' : 'Login with Password instead'}
                        </button>
                        {loginMethod === 'password' && (
                            <Link to="/auth/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                                Forgot password?
                            </Link>
                        )}
                    </div>

                    <div className="flex flex-col gap-3">
                        {loginMethod === 'otp' && !otpSent ? (
                            <Button type="button" onClick={onSendOtp} disabled={loading} className="w-full">
                                {loading ? 'Sending...' : 'Send OTP'}
                            </Button>
                        ) : (
                            <Button type="submit" disabled={loading} className="w-full">
                                {loading ? 'Signing in...' : 'Sign in'}
                            </Button>
                        )}
                    </div>
                </form>

                <p className="mt-4 text-center text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link to="/auth/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                        Sign up
                    </Link>
                </p>
        </AuthCard>
    );
}
