/**
 * staffApi.js — RTK Query endpoints for all Staff role portals.
 *
 * Staff roles: COMMITTEE_MEMBER | ACCOUNTANT | FACILITY_MANAGER | SECURITY_GUARD | HELP_DESK
 *
 * Tags:
 *   'StaffDashboard' | 'SocietyInfo' | 'ResidentList' | 'UnitList' | 'StaffProfile'
 *   'StaffComplaint' | 'StaffNotice'
 */
import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './baseApi';

export const staffApi = createApi({
    reducerPath: 'staffApi',
    baseQuery: axiosBaseQuery(),
    tagTypes: ['StaffDashboard', 'SocietyInfo', 'ResidentList', 'UnitList', 'StaffProfile', 'StaffComplaint', 'StaffNotice'],

    endpoints: (builder) => ({

        // ── Own profile ───────────────────────────────────────────────────────

        /**
         * GET /api/v1/auth/me
         * Returns the logged-in staff member's own user record.
         */
        getStaffMe: builder.query({
            query: () => ({ url: '/auth/me', method: 'GET' }),
            providesTags: ['StaffProfile'],
        }),

        // ── Society profile (read-only) ───────────────────────────────────────

        /**
         * GET /api/v1/staff/society/profile
         * Read-only society profile for staff members.
         */
        getStaffSocietyProfile: builder.query({
            query: () => ({ url: '/staff/society/profile', method: 'GET' }),
            providesTags: ['SocietyInfo'],
        }),

        // ── Dashboard ─────────────────────────────────────────────────────────

        /**
         * GET /api/v1/staff/dashboard
         * Role-aware dashboard stats — backend returns different data per role.
         */
        getStaffDashboard: builder.query({
            query: () => ({ url: '/staff/dashboard', method: 'GET' }),
            providesTags: ['StaffDashboard'],
        }),

        // ── Residents (COMMITTEE_MEMBER, HELP_DESK) ───────────────────────────

        /**
         * GET /api/v1/staff/residents
         * Resident directory.
         */
        getStaffResidents: builder.query({
            query: (params = {}) => ({ url: '/staff/residents', method: 'GET', params }),
            providesTags: ['ResidentList'],
        }),

        // ── Units (COMMITTEE_MEMBER, FACILITY_MANAGER) ────────────────────────

        /**
         * GET /api/v1/staff/units
         * Unit directory.
         */
        getStaffUnits: builder.query({
            query: (params = {}) => ({ url: '/staff/units', method: 'GET', params }),
            providesTags: ['UnitList'],
        }),

        // ── Complaints (COMMITTEE, FACILITY_MGR, HELP_DESK, ACCOUNTANT) ───────

        /**
         * GET /api/v1/complaints
         * List all society complaints (staff view — role gated in backend).
         */
        getStaffComplaints: builder.query({
            query: (params = {}) => ({ url: '/complaints', method: 'GET', params }),
            providesTags: [{ type: 'StaffComplaint', id: 'LIST' }],
        }),

        /**
         * POST /api/v1/complaints
         * Raise a complaint on behalf of or for the society.
         */
        staffRaiseComplaint: builder.mutation({
            query: (data) => ({ url: '/complaints', method: 'POST', data }),
            invalidatesTags: [{ type: 'StaffComplaint', id: 'LIST' }],
        }),

        /**
         * PATCH /api/v1/complaints/:id/assign
         * Assign complaint to a staff member (FACILITY_MANAGER only).
         */
        staffAssignComplaint: builder.mutation({
            query: ({ id, assignedTo }) => ({ url: `/complaints/${id}/assign`, method: 'PATCH', data: { assignedTo } }),
            invalidatesTags: [{ type: 'StaffComplaint', id: 'LIST' }],
        }),

        // ── Notices (COMMITTEE_MEMBER can publish; HELP_DESK reads) ──────────

        /**
         * GET /api/v1/notices
         * List notices — COMMITTEE sees all statuses; HELP_DESK sees published only.
         */
        getStaffNotices: builder.query({
            query: (params = {}) => ({ url: '/notices', method: 'GET', params }),
            providesTags: [{ type: 'StaffNotice', id: 'LIST' }],
        }),

        /**
         * POST /api/v1/notices
         * Create a notice (COMMITTEE_MEMBER only).
         */
        staffCreateNotice: builder.mutation({
            query: (data) => ({ url: '/notices', method: 'POST', data }),
            invalidatesTags: [{ type: 'StaffNotice', id: 'LIST' }],
        }),

        /**
         * PATCH /api/v1/notices/:id/publish
         * Publish a draft notice (COMMITTEE_MEMBER only).
         */
        staffPublishNotice: builder.mutation({
            query: (id) => ({ url: `/notices/${id}/publish`, method: 'PATCH' }),
            invalidatesTags: [{ type: 'StaffNotice', id: 'LIST' }],
        }),
    }),
});

export const {
    useGetStaffMeQuery,
    useGetStaffSocietyProfileQuery,
    useGetStaffDashboardQuery,
    useGetStaffResidentsQuery,
    useGetStaffUnitsQuery,
    useGetStaffComplaintsQuery,
    useStaffRaiseComplaintMutation,
    useStaffAssignComplaintMutation,
    useGetStaffNoticesQuery,
    useStaffCreateNoticeMutation,
    useStaffPublishNoticeMutation,
} = staffApi;
