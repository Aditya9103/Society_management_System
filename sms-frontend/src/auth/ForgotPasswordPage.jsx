import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import {
    useSendOtpMutation,
    useResetPasswordMutation,
} from '../store/api/authApi';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { AuthCard } from '../components/ui/AuthCard';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const navigate = useNavigate();

    const [sendOtp, { isLoading: isSendingOtp }] = useSendOtpMutation();
    const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        trigger,
    } = useForm({
        mode: 'onChange',
    });

    const newPassword = watch('newPassword');

    const handleSendOtp = async () => {
        const isValid = await trigger('email');
        if (!isValid) return;

        setErrorMsg(null);
        setSuccessMsg(null);
        try {
            const emailValue = watch('email');
            await sendOtp({ email: emailValue, purpose: 'FORGOT_PASSWORD' }).unwrap();
            setEmail(emailValue);
            setStep(2);
            setSuccessMsg(`OTP sent to ${emailValue}`);
        } catch (err) {
            setErrorMsg(err?.data?.message || 'Failed to send OTP. Please try again.');
        }
    };

    const handleResetPassword = async (data) => {
        setErrorMsg(null);
        try {
            await resetPassword({
                email,
                otp: data.otp,
                newPassword: data.newPassword,
                confirmPassword: data.confirmPassword,
            }).unwrap();
            setSuccessMsg('Password has been reset successfully. Redirecting to login...');
            setTimeout(() => {
                navigate('/auth/login');
            }, 2000);
        } catch (err) {
            setErrorMsg(err?.data?.message || 'Failed to reset password. Please try again.');
        }
    };

    return (
        <AuthCard
            title="Forgot Password"
            subtitle={step === 1 ? 'Enter your email to receive an OTP' : 'Enter the OTP and your new password'}
        >
            <form className="space-y-6" onSubmit={handleSubmit(step === 1 ? handleSendOtp : handleResetPassword)}>
                {errorMsg && (
                    <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
                        <p className="text-sm text-red-400 font-medium">{errorMsg}</p>
                    </div>
                )}
                {successMsg && (
                    <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-4">
                        <p className="text-sm text-green-400 font-medium">{successMsg}</p>
                    </div>
                )}

                <div className="space-y-5 text-left">
                    {step === 1 ? (
                        <Input
                            id="email"
                            label="Email Address"
                            type="email"
                            autoComplete="email"
                            theme="dark"
                            leftIcon={Mail}
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Invalid email address',
                                },
                            })}
                            error={errors.email?.message}
                        />
                    ) : (
                        <>
                            <Input
                                id="otp"
                                label="Verification OTP"
                                type="text"
                                inputMode="numeric"
                                theme="dark"
                                leftIcon={Lock}
                                {...register('otp', {
                                    required: 'OTP is required',
                                    pattern: {
                                        value: /^\d{6}$/,
                                        message: 'OTP must be 6 digits',
                                    },
                                })}
                                error={errors.otp?.message}
                            />

                            <Input
                                id="newPassword"
                                label="New Password"
                                type={showPassword ? 'text' : 'password'}
                                theme="dark"
                                leftIcon={Lock}
                                RightElement={
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-slate-400 hover:text-slate-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                }
                                {...register('newPassword', {
                                    required: 'New password is required',
                                    minLength: {
                                        value: 8,
                                        message: 'Password must be at least 8 characters',
                                    },
                                    pattern: {
                                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/,
                                        message: 'Must include uppercase, lowercase, number, and special character',
                                    },
                                })}
                                error={errors.newPassword?.message}
                            />

                            <Input
                                id="confirmPassword"
                                label="Confirm New Password"
                                type={showConfirmPassword ? 'text' : 'password'}
                                theme="dark"
                                leftIcon={Lock}
                                RightElement={
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="text-slate-400 hover:text-slate-300 transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                }
                                {...register('confirmPassword', {
                                    required: 'Please confirm your new password',
                                    validate: (value) =>
                                        value === newPassword || 'Passwords do not match',
                                })}
                                error={errors.confirmPassword?.message}
                            />
                        </>
                    )}
                </div>

                <div className="pt-2">
                    <Button type="submit" disabled={isSendingOtp || isResetting} className="w-full bg-indigo-600 hover:bg-indigo-800 text-white rounded-xl h-12 flex justify-center items-center gap-2 transition-colors">
                        {step === 1
                            ? isSendingOtp ? 'Sending...' : 'Send OTP'
                            : isResetting ? 'Resetting...' : 'Reset Password'}
                        <ArrowRight size={18} />
                    </Button>
                </div>
            </form>

            <p className="mt-8 text-center text-sm text-slate-400 font-medium">
                Remember your password?{' '}
                <Link to="/auth/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                    Sign in
                </Link>
            </p>
        </AuthCard>
    );
}
