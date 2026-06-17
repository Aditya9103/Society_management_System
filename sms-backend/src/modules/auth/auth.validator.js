/**
 * auth.validator.js — Joi validation schemas for all auth endpoints.
 *
 * Each schema validates a specific endpoint's request body/params/query.
 * Schemas are passed to the `validate` middleware in routes.
 *
 * All phone numbers are expected in Indian mobile format (+91XXXXXXXXXX or 10-digit).
 */

import Joi from 'joi';
import { OTP_CONFIG } from '../../config/constants.js';

// ── Reusable field validators ─────────────────────────────────────────────────

/**
 * Email address validation
 */
const emailField = Joi.string()
    .email()
    .required()
    .messages({
        'string.email': 'Email must be a valid email address',
        'any.required': 'Email is required',
    });

/** OTP: exactly N digits (as per OTP_CONFIG.LENGTH) */
const otpField = Joi.string()
    .length(OTP_CONFIG.LENGTH)
    .pattern(/^\d+$/)
    .required()
    .messages({
        'string.length': `OTP must be exactly ${OTP_CONFIG.LENGTH} digits`,
        'string.pattern.base': 'OTP must contain digits only',
        'any.required': 'OTP is required',
    });

/**
 * Strong password:
 *  - Min 8 characters
 *  - At least one uppercase, one lowercase, one digit, one special char
 */
const passwordField = Joi.string()
    .min(8)
    .max(20)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
    .required()
    .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.max': 'Password must not exceed 20 characters',
        'string.pattern.base':
            'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'Password is required',
    });

// ── Schemas ───────────────────────────────────────────────────────────────────

/**
 * POST /auth/otp/send
 * Send an OTP to a phone number for a given purpose.
 */
export const sendOtpSchema = {
    body: Joi.object({
        // User's email to send OTP to
        email: emailField,

        // Why the OTP is being sent
        purpose: Joi.string()
            .valid(...Object.values(OTP_CONFIG.PURPOSES))
            .required()
            .messages({
                'any.only': `Purpose must be one of: ${Object.values(OTP_CONFIG.PURPOSES).join(', ')}`,
            }),
    }),
};

/**
 * POST /auth/otp/verify
 * Verify a submitted OTP (without logging in — used for flows like registration).
 */
export const verifyOtpSchema = {
    body: Joi.object({
        // Email the OTP was sent to
        email: emailField,

        // The OTP submitted by the user
        otp: otpField,

        // The purpose this OTP was requested for
        purpose: Joi.string()
            .valid(...Object.values(OTP_CONFIG.PURPOSES))
            .required(),
    }),
};

/**
 * POST /auth/login/otp
 * Login using phone + OTP.
 */
export const loginOtpSchema = {
    body: Joi.object({
        // User's registered email
        email: emailField,

        // OTP sent to this phone
        otp: otpField,

        // Optional device info for refresh token tracking
        fcmToken: Joi.string().optional().allow('').description('Firebase push token for this device'),
        deviceFingerprint: Joi.string().optional().allow('').description('Client-side device fingerprint'),
    }),
};

/**
 * POST /auth/login/password
 * Login using phone/email + password.
 */
export const loginPasswordSchema = {
    body: Joi.object({
        // Phone OR email — either is valid
        identifier: Joi.string().required().messages({
            'any.required': 'Phone number or email is required',
        }),

        // Plain-text password (compared against bcrypt hash)
        password: Joi.string().required().messages({
            'any.required': 'Password is required',
        }),

        // Optional device registration token
        fcmToken: Joi.string().optional().allow(''),
        deviceFingerprint: Joi.string().optional().allow(''),
    }),
};

/**
 * POST /auth/refresh
 * Exchange a valid refresh token for a new token pair.
 */
export const refreshTokenSchema = {
    body: Joi.object({
        // The opaque refresh token previously issued
        refreshToken: Joi.string().required().messages({
            'any.required': 'Refresh token is required',
        }),
    }),
};

/**
 * PATCH /auth/change-password
 * Change password for the currently authenticated user.
 */
export const changePasswordSchema = {
    body: Joi.object({
        // Current password to authenticate the change
        oldPassword: Joi.string().required().messages({
            'any.required': 'Current password is required',
        }),

        // New password (must meet strength requirements)
        newPassword: passwordField,

        // Confirm to prevent typos
        confirmPassword: Joi.string()
            .valid(Joi.ref('newPassword'))
            .required()
            .messages({
                'any.only': 'Passwords do not match',
                'any.required': 'Password confirmation is required',
            }),
    }),
};

/**
 * POST /auth/register/resident/initiate
 * Step 1: Initiate resident registration
 */
export const initiateResidentRegistrationSchema = {
    body: Joi.object({
        firstName: Joi.string().trim().max(50).required().messages({
            'any.required': 'First name is required',
        }),
        lastName: Joi.string().trim().max(50).required().messages({
            'any.required': 'Last name is required',
        }),
        email: emailField,
        password: passwordField,
    }),
};

/**
 * POST /auth/register/resident/verify
 * Step 2: Verify resident registration OTP
 */
export const verifyResidentRegistrationSchema = {
    body: Joi.object({
        email: emailField,
        otp: otpField,
        fcmToken: Joi.string().optional().allow(''),
        deviceFingerprint: Joi.string().optional().allow(''),
    }),
};

/**
 * POST /auth/forgot-password/reset
 * Reset password via OTP
 */
export const resetPasswordSchema = {
    body: Joi.object({
        email: emailField,
        otp: otpField,
        newPassword: passwordField,
        confirmPassword: Joi.string()
            .valid(Joi.ref('newPassword'))
            .required()
            .messages({
                'any.only': 'Passwords do not match',
                'any.required': 'Password confirmation is required',
            }),
    }),
};
