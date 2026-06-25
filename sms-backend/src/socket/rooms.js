/**
 * Standardized room names for Socket.io.
 * These functions ensure consistency when broadcasting to specific groups.
 */

export const ROOMS = {
    // Individual user room (for direct notifications)
    USER: (userId) => `user_${userId}`,

    // Flat/Apartment room (for all residents/members belonging to a flat)
    FLAT: (flatId) => `flat_${flatId}`,

    // Broadcast room for all Society Administrators
    ADMIN: 'role_admin',

    // Broadcast room for all Security Guards
    GUARD: 'role_guard',

    // Global broadcast room for all connected users
    GLOBAL: 'global_broadcast',

    // Broadcast room for Staff Members
    STAFF: 'role_staff',

    // Broadcast room for Owners
    OWNER: 'role_owner',
};
