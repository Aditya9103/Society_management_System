/**
 * user.repository.js — Data access layer for the User collection.
 *
 * All direct MongoDB/Mongoose interactions for User documents live here.
 * Services call repository methods — they never touch the model directly.
 * This keeps business logic separate from DB concerns and simplifies testing.
 */

import User from './user.model.js';
import { ACCOUNT_SECURITY } from '../../config/constants.js';

/**
 * Find a user by their MongoDB ObjectId.
 *
 * @param {string} id - User ObjectId
 * @param {boolean} [withPassword=false] - Include the passwordHash field
 * @returns {Promise<UserDocument|null>}
 */
export const findById = (id, withPassword = false) => {
    const query = User.findById(id);
    if (withPassword) query.select('+passwordHash');
    return query.lean();
};


/**
 * Find a user by their phone number.
 *
 * @param {string} phone
 * @param {boolean} [withPassword=false] - Include the passwordHash field
 * @returns {Promise<UserDocument|null>}
 */
export const findByPhone = (phone, withPassword = false) => {
    const query = User.findOne({ phone });
    if (withPassword) query.select('+passwordHash');
    return query.lean();
};

/**
 * Find a user by their email address.
 *
 * @param {string} email
 * @param {boolean} [withPassword=false]
 * @returns {Promise<UserDocument|null>}
 */
export const findByEmail = (email, withPassword = false) => {
    const query = User.findOne({ email: email.toLowerCase().trim() });
    if (withPassword) query.select('+passwordHash');
    return query.lean(); //optimization - Returns document as plain JS object {email: "[EMAIL_ADDRESS]" }, skipping Mongoose model overhead wich contain Methods, Virtuals, Metadata, Getters, Setters
};

/**
 * Find a user by phone or email (used during login).
 *
 * @param {string} identifier - Phone number or email address
 * @param {boolean} [withPassword=false]
 * @returns {Promise<UserDocument|null>}
 */
export const findByPhoneOrEmail = (identifier, withPassword = false) => {
    const isEmail = identifier.includes('@');
    const query = isEmail
        ? User.findOne({ email: identifier.toLowerCase().trim() })
        : User.findOne({ phone: identifier });
    if (withPassword) query.select('+passwordHash');
    return query.lean();
};

/**
 * Find users by their roles in a given society.
 * 
 * @param {string} societyId
 * @param {string[]} roles
 * @returns {Promise<UserDocument[]>}
 */
export const findByRoleInSociety = (societyId, roles) => {
    return User.find({ societyId, role: { $in: roles } }).lean();
};

/**
 * Create a new user document.
 *
 * @param {object} data - User fields
 * @returns {Promise<UserDocument>}
 */
export const createUser = (data) => {
    return User.create(data);
};

/**
 * Update a user document by ID.
 *
 * @param {string} id
 * @param {object} updates - Fields to update
 * @returns {Promise<UserDocument|null>} Updated document
 */
export const updateUser = (id, updates) => {
    return User.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).lean();
};

/**
 * Increment the failed login counter for an account.
 * If the threshold is reached, lock the account for LOCK_DURATION_MINUTES.
 *
 * @param {string} id - User ObjectId
 * @returns {Promise<UserDocument|null>}
 */
export const incrementFailedLogin = async (id) => {
    const user = await User.findByIdAndUpdate(
        id,
        { $inc: { failedLoginCount: 1 } },
        { new: true },
    );

    // Lock the account if max attempts reached
    if (user && user.failedLoginCount >= ACCOUNT_SECURITY.MAX_FAILED_LOGINS) {
        const lockUntil = new Date(
            Date.now() + ACCOUNT_SECURITY.LOCK_DURATION_MINUTES * 60 * 1000,
        );
        return User.findByIdAndUpdate(id, { lockedUntil: lockUntil }, { new: true }).lean();
    }

    return user;
};

/**
 * Reset failed login counter and remove account lock.
 *
 * @param {string} id - User ObjectId
 * @returns {Promise<void>}
 */
export const resetFailedLogin = (id) => {
    return User.findByIdAndUpdate(id, {
        failedLoginCount: 0,
        lockedUntil: null,
    });
};

/**
 * Update the lastLoginAt timestamp to now.
 *
 * @param {string} id - User ObjectId
 * @returns {Promise<void>}
 */
export const updateLastLogin = (id) => {
    return User.findByIdAndUpdate(id, { lastLoginAt: new Date() });
};

/**
 * Add an FCM push token to the user's token list (deduplicating).
 *
 * @param {string} id       - User ObjectId
 * @param {string} fcmToken - Firebase Cloud Messaging token
 * @returns {Promise<void>}
 */
export const addFcmToken = (id, fcmToken) => {
    return User.findByIdAndUpdate(id, { $addToSet: { fcmTokens: fcmToken } });
};

/**
 * Remove an FCM token (e.g. on logout from a specific device).
 *
 * @param {string} id       - User ObjectId
 * @param {string} fcmToken - Firebase Cloud Messaging token
 * @returns {Promise<void>}
 */
export const removeFcmToken = (id, fcmToken) => {
    return User.findByIdAndUpdate(id, { $pull: { fcmTokens: fcmToken } });
};

/**
 * Append a hashed password to the user's password history.
 * Keeps only the last N entries (ACCOUNT_SECURITY.PASSWORD_HISTORY_COUNT).
 *
 * @param {string} id         - User ObjectId
 * @param {string} hashedPass - Bcrypt hashed password
 * @returns {Promise<void>}
 */
export const addToPasswordHistory = async (id, hashedPass) => {
    const user = await User.findById(id).select('+passwordHistory');
    if (!user) return;

    const history = user.passwordHistory ?? [];
    // Keep only the last N-1 so the new one fits within the limit
    const trimmed = history.slice(-(ACCOUNT_SECURITY.PASSWORD_HISTORY_COUNT - 1));
    trimmed.push(hashedPass);

    await User.findByIdAndUpdate(id, { passwordHistory: trimmed });
};

/**
 * Retrieve a user's password history (for reuse prevention check).
 *
 * @param {string} id - User ObjectId
 * @returns {Promise<string[]>} Array of bcrypt hashed passwords
 */
export const getPasswordHistory = async (id) => {
    const user = await User.findById(id).select('+passwordHistory');
    return user?.passwordHistory ?? [];
};
