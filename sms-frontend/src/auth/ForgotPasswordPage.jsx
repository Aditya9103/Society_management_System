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
import { Eye, EyeOff } from 'lucide-react';

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
                    {errorMsg && (
                        <div className="mb-4 rounded-md bg-red-50 p-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">{errorMsg}</h3>
                                </div>
                            </div>
                        </div>
                    )}
                    {successMsg && (
                        <div className="mb-4 rounded-md bg-green-50 p-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-green-800">{successMsg}</h3>
                                </div>
                            </div>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit(step === 1 ? handleSendOtp : handleResetPassword)}>
                        {step === 1 ? (
                            <div>
                                <Input
                                    id="email"
                                    label="Email address"
                                    type="email"
                                    autoComplete="email"
                                    {...register('email', {
                                        required: 'Email is required',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Invalid email address',
                                        },
                                    })}
                                    error={errors.email?.message}
                                />
                            </div>
                        ) : (
                            <>
                                <Input
                                    id="otp"
                                    label="Verification OTP"
                                    type="text"
                                    inputMode="numeric"
                                    {...register('otp', {
                                        required: 'OTP is required',
                                        pattern: {
                                            value: /^\d{6}$/,
                                            message: 'OTP must be 6 digits',
                                        },
                                    })}
                                    error={errors.otp?.message}
                                />

                                <div className="relative">
                                    <Input
                                        id="newPassword"
                                        label="New Password"
                                        type={showPassword ? 'text' : 'password'}
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
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>

                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        label="Confirm New Password"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        {...register('confirmPassword', {
                                            required: 'Please confirm your new password',
                                            validate: (value) =>
                                                value === newPassword || 'Passwords do not match',
                                        })}
                                        error={errors.confirmPassword?.message}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </>
                        )}

                        <div>
                            <Button type="submit" disabled={isSendingOtp || isResetting} className="w-full">
                                {step === 1
                                    ? isSendingOtp ? 'Sending...' : 'Send OTP'
                                    : isResetting ? 'Resetting...' : 'Reset Password'}
                            </Button>
                        </div>
                    </form>

                    <p className="mt-10 text-center text-sm text-gray-500">
                        Remember your password?{' '}
                        <Link to="/auth/login" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
                            Sign in
                        </Link>
                    </p>
        </AuthCard>
    );
}
