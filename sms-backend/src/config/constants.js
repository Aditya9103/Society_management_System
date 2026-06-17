/**
 * constants.js — Application-wide constants.
 *
 * Single source of truth for enums, config values, and permission strings.
 * Import from here instead of scattering magic strings throughout the codebase.
 */

// ── User Roles ────────────────────────────────────────────────────────────────
export const ROLES = Object.freeze({
    SUPER_ADMIN: 'SUPER_ADMIN',
    SOCIETY_ADMIN: 'SOCIETY_ADMIN',
    COMMITTEE_MEMBER: 'COMMITTEE_MEMBER',
    ACCOUNTANT: 'ACCOUNTANT',
    FACILITY_MANAGER: 'FACILITY_MANAGER',
    SECURITY_GUARD: 'SECURITY_GUARD',
    RESIDENT: 'RESIDENT',
});

// ── All roles in hierarchy order (highest privilege first) ────────────────────
export const ALL_ROLES = [
    ROLES.SUPER_ADMIN,
    ROLES.SOCIETY_ADMIN,
    ROLES.COMMITTEE_MEMBER,
    ROLES.ACCOUNTANT,
    ROLES.FACILITY_MANAGER,
    ROLES.SECURITY_GUARD,
    ROLES.RESIDENT,
];

// ── Fine-Grained Permission Strings ──────────────────────────────────────────
// Format: resource:action (or resource:action:scope)
export const PERMISSIONS = Object.freeze({
    // Visitor
    VISITOR_CREATE: 'visitor:create',
    VISITOR_READ: 'visitor:read',
    VISITOR_APPROVE: 'visitor:approve',

    // Complaint
    COMPLAINT_CREATE: 'complaint:create',
    COMPLAINT_READ: 'complaint:read',
    COMPLAINT_ASSIGN: 'complaint:assign',
    COMPLAINT_CLOSE: 'complaint:close',

    // Payment
    PAYMENT_READ_OWN: 'payment:read:own',
    PAYMENT_READ_ALL: 'payment:read:all',
    PAYMENT_CREATE: 'payment:create',

    // Invoice
    INVOICE_GENERATE: 'invoice:generate',
    INVOICE_READ_OWN: 'invoice:read:own',
    INVOICE_READ_ALL: 'invoice:read:all',

    // Notice
    NOTICE_PUBLISH: 'notice:publish',
    NOTICE_READ: 'notice:read',

    // Poll
    POLL_CREATE: 'poll:create',
    POLL_VOTE: 'poll:vote',
    POLL_READ: 'poll:read',

    // Facility
    FACILITY_BOOK: 'facility:book',
    FACILITY_APPROVE: 'facility:approve',

    // Emergency
    EMERGENCY_TRIGGER: 'emergency:trigger',

    // Analytics
    ANALYTICS_VIEW: 'analytics:view',

    // Society
    SOCIETY_MANAGE: 'society:manage',
    SOCIETY_READ: 'society:read',

    // Resident
    RESIDENT_APPROVE: 'resident:approve',
    RESIDENT_READ: 'resident:read',
});

// ── Role → Default Permissions Map ───────────────────────────────────────────
// Used when generating the JWT payload
export const ROLE_PERMISSIONS = Object.freeze({
    [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),

    [ROLES.SOCIETY_ADMIN]: [
        PERMISSIONS.VISITOR_CREATE, PERMISSIONS.VISITOR_READ, PERMISSIONS.VISITOR_APPROVE,
        PERMISSIONS.COMPLAINT_CREATE, PERMISSIONS.COMPLAINT_READ, PERMISSIONS.COMPLAINT_ASSIGN, PERMISSIONS.COMPLAINT_CLOSE,
        PERMISSIONS.PAYMENT_READ_ALL, PERMISSIONS.PAYMENT_CREATE,
        PERMISSIONS.INVOICE_GENERATE, PERMISSIONS.INVOICE_READ_ALL,
        PERMISSIONS.NOTICE_PUBLISH, PERMISSIONS.NOTICE_READ,
        PERMISSIONS.POLL_CREATE, PERMISSIONS.POLL_VOTE, PERMISSIONS.POLL_READ,
        PERMISSIONS.FACILITY_BOOK, PERMISSIONS.FACILITY_APPROVE,
        PERMISSIONS.EMERGENCY_TRIGGER,
        PERMISSIONS.ANALYTICS_VIEW,
        PERMISSIONS.SOCIETY_MANAGE, PERMISSIONS.SOCIETY_READ,
        PERMISSIONS.RESIDENT_APPROVE, PERMISSIONS.RESIDENT_READ,
    ],

    [ROLES.COMMITTEE_MEMBER]: [
        PERMISSIONS.VISITOR_READ,
        PERMISSIONS.COMPLAINT_CREATE, PERMISSIONS.COMPLAINT_READ,
        PERMISSIONS.PAYMENT_READ_ALL,
        PERMISSIONS.INVOICE_READ_ALL,
        PERMISSIONS.NOTICE_PUBLISH, PERMISSIONS.NOTICE_READ,
        PERMISSIONS.POLL_CREATE, PERMISSIONS.POLL_VOTE, PERMISSIONS.POLL_READ,
        PERMISSIONS.FACILITY_BOOK,
        PERMISSIONS.EMERGENCY_TRIGGER,
        PERMISSIONS.ANALYTICS_VIEW,
        PERMISSIONS.SOCIETY_READ,
        PERMISSIONS.RESIDENT_READ,
    ],

    [ROLES.ACCOUNTANT]: [
        PERMISSIONS.COMPLAINT_CREATE,
        PERMISSIONS.PAYMENT_READ_ALL, PERMISSIONS.PAYMENT_CREATE,
        PERMISSIONS.INVOICE_GENERATE, PERMISSIONS.INVOICE_READ_ALL,
        PERMISSIONS.EMERGENCY_TRIGGER,
        PERMISSIONS.ANALYTICS_VIEW,
    ],

    [ROLES.FACILITY_MANAGER]: [
        PERMISSIONS.COMPLAINT_CREATE, PERMISSIONS.COMPLAINT_READ, PERMISSIONS.COMPLAINT_ASSIGN,
        PERMISSIONS.FACILITY_BOOK, PERMISSIONS.FACILITY_APPROVE,
        PERMISSIONS.EMERGENCY_TRIGGER,
        PERMISSIONS.ANALYTICS_VIEW,
    ],

    [ROLES.SECURITY_GUARD]: [
        PERMISSIONS.VISITOR_READ, PERMISSIONS.VISITOR_APPROVE,
        PERMISSIONS.COMPLAINT_CREATE,
        PERMISSIONS.EMERGENCY_TRIGGER,
    ],

    [ROLES.RESIDENT]: [
        PERMISSIONS.VISITOR_CREATE,
        PERMISSIONS.COMPLAINT_CREATE, PERMISSIONS.COMPLAINT_READ,
        PERMISSIONS.PAYMENT_READ_OWN,
        PERMISSIONS.INVOICE_READ_OWN,
        PERMISSIONS.NOTICE_READ,
        PERMISSIONS.POLL_VOTE, PERMISSIONS.POLL_READ,
        PERMISSIONS.FACILITY_BOOK,
        PERMISSIONS.EMERGENCY_TRIGGER,
    ],
});

// ── OTP Configuration ─────────────────────────────────────────────────────────
export const OTP_CONFIG = Object.freeze({
    /** OTP digit length */
    LENGTH: 6,
    /** OTP validity in minutes */
    EXPIRES_IN_MINUTES: 10,
    /** Max verification attempts before OTP is invalidated */
    MAX_ATTEMPTS: 5,
    /** Max resend requests per OTP session */
    MAX_RESENDS: 3,
    /** Purpose enum values */
    PURPOSES: Object.freeze({
        LOGIN: 'LOGIN',
        REGISTER: 'REGISTER',
        FORGOT_PASSWORD: 'FORGOT_PASSWORD',
        CHANGE_EMAIL: 'CHANGE_EMAIL',
    }),
});

// ── JWT Configuration ─────────────────────────────────────────────────────────
export const JWT_CONFIG = Object.freeze({
    /** Access token lifetime (15 minutes) */
    ACCESS_EXPIRES: '15m',
    /** Refresh token lifetime (7 days) */
    REFRESH_EXPIRES: '7d',
    /** Refresh token lifetime in milliseconds (for DB expiry) */
    REFRESH_EXPIRES_MS: 7 * 24 * 60 * 60 * 1000,
    /** Issuer claim */
    ISSUER: 'sms-api',
    /** Audience claim */
    AUDIENCE: 'sms-client',
});

// ── Account Security ──────────────────────────────────────────────────────────
export const ACCOUNT_SECURITY = Object.freeze({
    /** Max consecutive failed logins before account lockout */
    MAX_FAILED_LOGINS: 5,
    /** Lock duration in minutes */
    LOCK_DURATION_MINUTES: 15,
    /** Number of previous passwords to store (prevent reuse) */
    PASSWORD_HISTORY_COUNT: 5,
    /** Bcrypt salt rounds */
    BCRYPT_SALT_ROUNDS: 12,
});

// ── Pagination Defaults ───────────────────────────────────────────────────────
export const PAGINATION = Object.freeze({
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
});
