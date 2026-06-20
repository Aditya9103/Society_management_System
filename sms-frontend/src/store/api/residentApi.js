/**
 * residentApi.js — RTK Query endpoints for the Resident portal.
 */
import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './baseApi';

export const residentApi = createApi({
    reducerPath: 'residentApi',
    baseQuery: axiosBaseQuery(),
    tagTypes: ['ResidentProfile', 'ResidentStatus', 'Complaint', 'Notice', 'Visitor', 'Invoice', 'FamilyMember'],
    endpoints: (builder) => ({

        // ── Profile ──────────────────────────────────────────────────────────

        getMyProfile: builder.query({
            query: () => ({ url: '/residents/profile/me', method: 'GET' }),
            providesTags: ['ResidentProfile'],
        }),

        updateMyProfile: builder.mutation({
            query: (data) => ({ url: '/residents/profile/me', method: 'PUT', data }),
            invalidatesTags: ['ResidentProfile'],
        }),

        getMe: builder.query({
            query: () => ({ url: '/auth/me', method: 'GET' }),
            providesTags: ['ResidentStatus'],
        }),

        // ── Family Members ────────────────────────────────────────────────────

        addFamilyMember: builder.mutation({
            query: (data) => ({ url: '/residents/family-members', method: 'POST', data }),
            invalidatesTags: ['ResidentProfile'],
        }),

        updateFamilyMember: builder.mutation({
            query: ({ memberId, ...data }) => ({ url: `/residents/family-members/${memberId}`, method: 'PUT', data }),
            invalidatesTags: ['ResidentProfile'],
        }),

        deleteFamilyMember: builder.mutation({
            query: (memberId) => ({ url: `/residents/family-members/${memberId}`, method: 'DELETE' }),
            invalidatesTags: ['ResidentProfile'],
        }),

        // ── Complaints ────────────────────────────────────────────────────────

        getMyComplaints: builder.query({
            query: (params = {}) => ({ url: '/complaints/my', method: 'GET', params }),
            providesTags: [{ type: 'Complaint', id: 'LIST' }],
        }),

        raiseComplaint: builder.mutation({
            query: (data) => ({ url: '/complaints', method: 'POST', data }),
            invalidatesTags: [{ type: 'Complaint', id: 'LIST' }],
        }),

        // ── Notices ───────────────────────────────────────────────────────────

        getMyNotices: builder.query({
            query: (params = {}) => ({ url: '/notices', method: 'GET', params }),
            providesTags: [{ type: 'Notice', id: 'LIST' }],
        }),

        getNoticeById: builder.query({
            query: (id) => ({ url: `/notices/${id}`, method: 'GET' }),
            providesTags: (r, e, id) => [{ type: 'Notice', id }],
        }),

        // ── Visitors ──────────────────────────────────────────────────────────

        getMyVisitors: builder.query({
            query: (params = {}) => ({ url: '/visitors/my', method: 'GET', params }),
            providesTags: [{ type: 'Visitor', id: 'LIST' }],
        }),

        createVisitorPass: builder.mutation({
            query: (data) => ({ url: '/visitors', method: 'POST', data }),
            invalidatesTags: [{ type: 'Visitor', id: 'LIST' }],
        }),

        cancelVisitorPass: builder.mutation({
            query: (id) => ({ url: `/visitors/${id}/cancel`, method: 'PATCH' }),
            invalidatesTags: [{ type: 'Visitor', id: 'LIST' }],
        }),

        // ── Invoices ──────────────────────────────────────────────────────────

        getMyInvoices: builder.query({
            query: (params = {}) => ({ url: '/invoices/my', method: 'GET', params }),
            providesTags: [{ type: 'Invoice', id: 'LIST' }],
        }),

        getInvoiceById: builder.query({
            query: (id) => ({ url: `/invoices/${id}`, method: 'GET' }),
            providesTags: (r, e, id) => [{ type: 'Invoice', id }],
        }),
    }),
});

export const {
    useGetMyProfileQuery,
    useUpdateMyProfileMutation,
    useGetMeQuery,
    useAddFamilyMemberMutation,
    useUpdateFamilyMemberMutation,
    useDeleteFamilyMemberMutation,
    useGetMyComplaintsQuery,
    useRaiseComplaintMutation,
    useGetMyNoticesQuery,
    useGetNoticeByIdQuery,
    useGetMyVisitorsQuery,
    useCreateVisitorPassMutation,
    useCancelVisitorPassMutation,
    useGetMyInvoicesQuery,
    useGetInvoiceByIdQuery,
} = residentApi;
