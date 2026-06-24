/**
 * residentApi.js — RTK Query endpoints for the Resident portal.
 */
import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './baseApi';
import { getSocket } from '../../socket/socketClient';

export const residentApi = createApi({
    reducerPath: 'residentApi',
    baseQuery: axiosBaseQuery(),
    tagTypes: ['ResidentProfile', 'ResidentStatus', 'Complaint', 'Notice', 'Visitor', 'Invoice', 'FamilyMember', 'DomesticStaff'],
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

        // ── Domestic Staff ────────────────────────────────────────────────────

        getMyDomesticStaff: builder.query({
            query: () => ({ url: '/residents/domestic-staff', method: 'GET' }),
            providesTags: ['DomesticStaff'],
        }),

        addDomesticStaff: builder.mutation({
            query: (data) => ({ url: '/residents/domestic-staff', method: 'POST', data }),
            invalidatesTags: ['DomesticStaff'],
        }),

        updateDomesticStaff: builder.mutation({
            query: ({ id, ...data }) => ({ url: `/residents/domestic-staff/${id}`, method: 'PUT', data }),
            invalidatesTags: ['DomesticStaff'],
        }),

        removeDomesticStaff: builder.mutation({
            query: (id) => ({ url: `/residents/domestic-staff/${id}`, method: 'DELETE' }),
            invalidatesTags: ['DomesticStaff'],
        }),

        // ── Complaints ────────────────────────────────────────────────────────

        getMyComplaints: builder.query({
            query: (params = {}) => ({ url: '/complaints/my', method: 'GET', params }),
            providesTags: [{ type: 'Complaint', id: 'LIST' }],
            async onCacheEntryAdded(arg, { dispatch, cacheDataLoaded, cacheEntryRemoved }) {
                const socket = getSocket();
                if (!socket) return;
                
                const listener = () => {
                    dispatch(residentApi.util.invalidateTags([{ type: 'Complaint', id: 'LIST' }]));
                };

                try {
                    await cacheDataLoaded;
                    socket.on('complaint_updated', listener);
                } catch {}

                await cacheEntryRemoved;
                socket.off('complaint_updated', listener);
            }
        }),

        raiseComplaint: builder.mutation({
            query: (data) => ({ url: '/complaints', method: 'POST', data }),
            invalidatesTags: [{ type: 'Complaint', id: 'LIST' }],
        }),

        changeComplaintStatus: builder.mutation({
            query: ({ id, ...data }) => ({ url: `/complaints/${id}/status`, method: 'PATCH', data }),
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

        acknowledgeNotice: builder.mutation({
            query: (id) => ({ url: `/notices/${id}/acknowledge`, method: 'POST' }),
            invalidatesTags: (r, e, id) => [{ type: 'Notice', id }, { type: 'Notice', id: 'LIST' }],
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

        // ── Real-Time Walk-in Actions ─────────────────────────────────────────

        approveWalkIn: builder.mutation({
            query: (id) => ({ url: `/visitors/${id}/approve`, method: 'PUT' }),
            invalidatesTags: [{ type: 'Visitor', id: 'LIST' }],
        }),

        denyWalkIn: builder.mutation({
            query: (id) => ({ url: `/visitors/${id}/deny`, method: 'PUT' }),
            invalidatesTags: [{ type: 'Visitor', id: 'LIST' }],
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
    useGetMyDomesticStaffQuery,
    useAddDomesticStaffMutation,
    useUpdateDomesticStaffMutation,
    useRemoveDomesticStaffMutation,
    useGetMyComplaintsQuery,
    useRaiseComplaintMutation,
    useChangeComplaintStatusMutation,
    useGetMyNoticesQuery,
    useGetNoticeByIdQuery,
    useAcknowledgeNoticeMutation,
    useGetMyVisitorsQuery,
    useCreateVisitorPassMutation,
    useCancelVisitorPassMutation,
    useGetMyInvoicesQuery,
    useGetInvoiceByIdQuery,
    useApproveWalkInMutation,
    useDenyWalkInMutation,
} = residentApi;
