import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    useSendOtpMutation,
    useLoginWithOtpMutation,
    useLoginWithPasswordMutation
} from '../store/api/authApi';
import { setCredentials } from '../store/slices/authSlice';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { AuthCard } from '../components/ui/AuthCard';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Smartphone } from 'lucide-react';

export default function LoginPage() {
    const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'otp'
    const [otpSent, setOtpSent] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.role === 'SUPER_ADMIN') navigate('/super-admin');
            else if (user.role === 'SOCIETY_ADMIN') navigate('/admin');
            else if (user.role === 'RESIDENT') navigate('/resident');
            else if (user.role === 'SECURITY_GUARD') navigate('/guard');
            else navigate('/staff');
        }
    }, [isAuthenticated, user, navigate]);

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
                accessToken: authData.accessToken,
                refreshToken: authData.refreshToken
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
            console.error("Login Error Response:", err);
            if (err?.data?.message) {
                setErrorMsg(err.data.message);
            } else if (err?.data?.error) {
                setErrorMsg(err.data.error);
            } else if (typeof err?.data === 'string') {
                setErrorMsg(err.data);
            } else if (typeof err?.error === 'string') {
                setErrorMsg(err.error);
            } else if (err?.message) {
                setErrorMsg(err.message);
            } else {
                setErrorMsg('An unexpected error occurred. Please try again later.');
            }
        }
    };

    return (
        <AuthCard
            title="Welcome back 👋"
            subtitle="Sign in to continue to your Resident Portal"
        >
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                {errorMsg && (
                    <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
                        <p className="text-sm text-red-400 font-medium">{errorMsg}</p>
                    </div>
                )}

                <div className="space-y-5 text-left">
                    <Input
                        id="email"
                        label="Email Address"
                        type="email"
                        autoComplete="username"
                        theme="dark"
                        leftIcon={Mail}
                        {...register('email', { required: 'Email is required' })}
                        error={errors.email?.message}
                    />

                    {loginMethod === 'password' && (
                        <Input
                            id="password"
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            theme="dark"
                            leftIcon={Lock}
                            RightElement={
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-slate-400 hover:text-slate-300 transition-colors"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            }
                            {...register('password', { required: 'Password is required' })}
                            error={errors.password?.message}
                        />
                    )}

                    {loginMethod === 'otp' && otpSent && (
                        <Input
                            id="otp"
                            label="Enter OTP"
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            theme="dark"
                            leftIcon={Lock}
                            {...register('otp', { required: 'OTP is required' })}
                            error={errors.otp?.message}
                        />
                    )}
                </div>

                {loginMethod === 'password' && (
                    <div className="flex items-center justify-between mt-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-white/5 text-indigo-500 focus:ring-indigo-500/20 focus:ring-offset-0" />
                            <span className="text-sm font-medium text-slate-300">Remember me</span>
                        </label>
                        <Link to="/auth/forgot-password" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                            Forgot password?
                        </Link>
                    </div>
                )}

                <div className="flex flex-col gap-4 mt-8">
                    {loginMethod === 'otp' && !otpSent ? (
                        <Button type="button" onClick={onSendOtp} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl h-12 flex justify-center items-center gap-2 transition-colors">
                            {loading ? 'Sending...' : 'Send OTP'} <ArrowRight size={18} />
                        </Button>
                    ) : (
                        <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl h-12 flex justify-center items-center gap-2 transition-colors">
                            {loading ? 'Signing in...' : 'Sign in'} <ArrowRight size={18} />
                        </Button>
                    )}

                    <div className="relative py-2 flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                        <span className="relative bg-[#0B0D17] px-4 text-xs text-slate-500 font-medium">or</span>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            setLoginMethod(loginMethod === 'password' ? 'otp' : 'password');
                            setOtpSent(false);
                            setErrorMsg(null);
                        }}
                        className="w-full border-white/10 bg-transparent hover:bg-white/5 text-slate-300 rounded-xl h-12 flex justify-center items-center gap-2 transition-colors"
                    >
                        <Smartphone size={18} /> {loginMethod === 'password' ? 'Login with OTP instead' : 'Login with Password instead'}
                    </Button>
                </div>
            </form>

            <p className="mt-8 text-center text-sm text-slate-400 font-medium">
                Don't have an account?{' '}
                <Link to="/auth/register" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                    Sign up
                </Link>
            </p>
        </AuthCard>
    );
}
