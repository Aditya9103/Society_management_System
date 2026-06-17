import crypto from 'crypto';
import { OTP_CONFIG } from '../config/constants.js';

/**
 * Generate a numeric OTP of configured length.
 * Uses crypto.randomInt for cryptographic randomness.
 *
 * @returns {string} Zero-padded OTP string (e.g. '042891')
 */
export const generateOtp = () => {
    const max = Math.pow(10, OTP_CONFIG.LENGTH);
    const otp = crypto.randomInt(0, max);
    return otp.toString().padStart(OTP_CONFIG.LENGTH, '0');
};
