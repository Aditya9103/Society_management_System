/**
 * societyAdminApi.js — RTK Query API slice for all Society Admin endpoints.
 *
 * Tag-based cache invalidation keeps UI fresh after mutations.
 * Base URL: /api/v1/societies
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './baseApi';
import { getSocket } from '../../socket/socketClient';

export const societyAdminApi = createApi({
    reducerPath: 'societyAdminApi',
    baseQuery: axiosBaseQuery(),
    tagTypes: ['Society', 'Tower', 'Floor', 'Unit', 'Staff', 'Resident', 'DashboardStats', 'Complaint', 'Notice', 'Invoice'],

    endpoints: (builder) => ({

        // ── Dashboard ────────────────────────────────────────────────────────

        getAdminDashboard: builder.query({
            query: () => ({ url: '/societies/dashboard', method: 'GET' }),
            providesTags: ['DashboardStats'],
        }),

        // ── Society Profile ──────────────────────────────────────────────────

        getSocietyProfile: builder.query({
            query: () => ({ url: '/societies/profile', method: 'GET' }),
            providesTags: [{ type: 'Society', id: 'PROFILE' }],
        }),


        updateSocietyProfile: builder.mutation({
            query: (data) => ({ url: '/societies/profile', method: 'PATCH', data }),
            invalidatesTags: [{ type: 'Society', id: 'PROFILE' }, 'DashboardStats'],
        }),

        updateSocietyLogo: builder.mutation({
            query: (data) => ({ url: '/societies/profile/logo', method: 'PATCH', data }),
            invalidatesTags: [{ type: 'Society', id: 'PROFILE' }, 'DashboardStats'],
        }),

        // ── Staff ────────────────────────────────────────────────────────────

        listStaff: builder.query({
            query: (params = {}) => ({ url: '/societies/staff', method: 'GET', params }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.data.map(({ _id }) => ({ type: 'Staff', id: _id })),
                        { type: 'Staff', id: 'LIST' },
                    ]
                    : [{ type: 'Staff', id: 'LIST' }],
        }),

        createStaff: builder.mutation({
            query: (data) => ({ url: '/societies/staff', method: 'POST', data }),
            invalidatesTags: [{ type: 'Staff', id: 'LIST' }, 'DashboardStats'],
        }),

        deactivateStaff: builder.mutation({
            query: (id) => ({ url: `/societies/staff/${id}/deactivate`, method: 'PATCH' }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Staff', id }, 'DashboardStats'],
        }),

        // ── Residents ────────────────────────────────────────────────────────

        listResidents: builder.query({
            query: (params = {}) => ({ url: '/societies/residents', method: 'GET', params }),
            providesTags: [{ type: 'Resident', id: 'LIST' }],
        }),

        listResidentProfiles: builder.query({
            query: (params = {}) => ({ url: '/societies/residents/profiles', method: 'GET', params }),
            providesTags: [{ type: 'Resident', id: 'PROFILES' }],
        }),

        approveResident: builder.mutation({
            query: ({ id, adminComments }) => ({
                url: `/societies/resident/${id}/approve`,
                method: 'PATCH',
                data: { adminComments },
            }),
            invalidatesTags: [
                { type: 'Resident', id: 'LIST' },
                { type: 'Resident', id: 'PROFILES' },
                'DashboardStats',
            ],
        }),

        rejectResident: builder.mutation({
            query: ({ id, reason }) => ({
                url: `/societies/resident/${id}/reject`,
                method: 'PATCH',
                data: { reason },
            }),
            invalidatesTags: [
                { type: 'Resident', id: 'LIST' },
                { type: 'Resident', id: 'PROFILES' },
                'DashboardStats',
            ],
        }),

        revokeResident: builder.mutation({
            query: ({ id, reason }) => ({
                url: `/societies/resident/${id}/revoke`,
                method: 'PATCH',
                data: { reason },
            }),
            invalidatesTags: [
                { type: 'Resident', id: 'LIST' },
                { type: 'Resident', id: 'PROFILES' },
                'DashboardStats',
            ],
        }),

        getResidentProfile: builder.query({
            query: (id) => ({ url: `/societies/resident/${id}`, method: 'GET' }),
            providesTags: (result, error, id) => [{ type: 'Resident', id: `PROFILE_${id}` }],
        }),

        // ── Towers ───────────────────────────────────────────────────────────

        listTowers: builder.query({
            query: () => ({ url: '/societies/towers', method: 'GET' }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.data.map(({ _id }) => ({ type: 'Tower', id: _id })),
                        { type: 'Tower', id: 'LIST' },
                    ]
                    : [{ type: 'Tower', id: 'LIST' }],
        }),

        createTower: builder.mutation({
            query: (data) => ({ url: '/societies/towers', method: 'POST', data }),
            invalidatesTags: [{ type: 'Tower', id: 'LIST' }, 'DashboardStats'],
        }),

        updateTower: builder.mutation({
            query: ({ id, ...data }) => ({ url: `/societies/towers/${id}`, method: 'PATCH', data }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Tower', id }, { type: 'Tower', id: 'LIST' }],
        }),

        deleteTower: builder.mutation({
            query: (id) => ({ url: `/societies/towers/${id}`, method: 'DELETE' }),
            invalidatesTags: [{ type: 'Tower', id: 'LIST' }, 'DashboardStats'],
        }),

        // ── Floors ───────────────────────────────────────────────────────────

        listFloors: builder.query({
            query: (towerId) => ({ url: `/societies/towers/${towerId}/floors`, method: 'GET' }),
            providesTags: (_result, _error, towerId) => [{ type: 'Floor', id: towerId }],
        }),

        createFloor: builder.mutation({
            query: ({ towerId, ...data }) => ({
                url: `/societies/towers/${towerId}/floors`,
                method: 'POST',
                data,
            }),
            invalidatesTags: (_result, _error, { towerId }) => [
                { type: 'Floor', id: towerId },
                { type: 'Tower', id: 'LIST' },
            ],
        }),

        updateFloor: builder.mutation({
            query: ({ towerId, floorId, ...data }) => ({
                url: `/societies/towers/${towerId}/floors/${floorId}`,
                method: 'PATCH',
                data,
            }),
            invalidatesTags: (_result, _error, { towerId }) => [
                { type: 'Floor', id: towerId },
                { type: 'Tower', id: 'LIST' },
            ],
        }),

        deleteFloor: builder.mutation({
            query: ({ towerId, floorId }) => ({
                url: `/societies/towers/${towerId}/floors/${floorId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, { towerId }) => [
                { type: 'Floor', id: towerId },
                { type: 'Tower', id: 'LIST' },
                'DashboardStats'
            ],
        }),

        // ── Units ────────────────────────────────────────────────────────────

        listUnits: builder.query({
            query: (params = {}) => ({ url: '/societies/units', method: 'GET', params }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.data.map(({ _id }) => ({ type: 'Unit', id: _id })),
                        { type: 'Unit', id: 'LIST' },
                    ]
                    : [{ type: 'Unit', id: 'LIST' }],
        }),

        createUnit: builder.mutation({
            query: (data) => ({ url: '/societies/units', method: 'POST', data }),
            invalidatesTags: [{ type: 'Unit', id: 'LIST' }, 'DashboardStats'],
        }),

        updateUnit: builder.mutation({
            query: ({ id, ...data }) => ({ url: `/societies/units/${id}`, method: 'PATCH', data }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Unit', id }, { type: 'Unit', id: 'LIST' }],
        }),

        deleteUnit: builder.mutation({
            query: (id) => ({ url: `/societies/units/${id}`, method: 'DELETE' }),
            invalidatesTags: [{ type: 'Unit', id: 'LIST' }, 'DashboardStats'],
        }),

        // ── Complaints (admin view) ───────────────────────────────────────────

        getAllComplaints: builder.query({
            query: (params = {}) => ({ url: '/complaints', method: 'GET', params }),
            providesTags: [{ type: 'Complaint', id: 'LIST' }],
            async onCacheEntryAdded(arg, { dispatch, cacheDataLoaded, cacheEntryRemoved }) {
                const socket = getSocket();
                if (!socket) return;

                const listener = () => {
                    dispatch(societyAdminApi.util.invalidateTags([
                        { type: 'Complaint', id: 'LIST' },
                        'DashboardStats'
                    ]));
                };

                try {
                    await cacheDataLoaded;
                    socket.on('complaint_updated', listener);
                } catch { }

                await cacheEntryRemoved;
                socket.off('complaint_updated', listener);
            }
        }),

        changeComplaintStatusAdmin: builder.mutation({
            query: ({ id, ...data }) => ({ url: `/complaints/${id}/status`, method: 'PATCH', data }),
            invalidatesTags: [{ type: 'Complaint', id: 'LIST' }],
        }),

        deleteComplaintAdmin: builder.mutation({
            query: (id) => ({ url: `/complaints/${id}`, method: 'DELETE' }),
            invalidatesTags: [{ type: 'Complaint', id: 'LIST' }],
        }),

        // ── Notices (admin view) ──────────────────────────────────────────────

        getAllNotices: builder.query({
            query: (params = {}) => ({ url: '/notices', method: 'GET', params }),
            providesTags: [{ type: 'Notice', id: 'LIST' }],
            async onCacheEntryAdded(arg, { dispatch, cacheDataLoaded, cacheEntryRemoved }) {
                const socket = getSocket();
                if (!socket) return;

                const listener = (data) => {
                    // Invalidate when notices are published (either normal or confirmation)
                    if (data?.type === 'NOTICE_PUBLISHED' || data?.type === 'NOTICE_PUBLISHED_CONFIRMATION') {
                        dispatch(societyAdminApi.util.invalidateTags([{ type: 'Notice', id: 'LIST' }]));
                    }
                };

                try {
                    await cacheDataLoaded;
                    socket.on('NEW_NOTIFICATION', listener);
                    socket.on('URGENT_NOTICE', listener);
                } catch { }

                await cacheEntryRemoved;
                socket.off('NEW_NOTIFICATION', listener);
                socket.off('URGENT_NOTICE', listener);
            }
        }),

        createNotice: builder.mutation({
            query: (data) => ({ url: '/notices', method: 'POST', data }),
            invalidatesTags: [{ type: 'Notice', id: 'LIST' }],
        }),

        publishNotice: builder.mutation({
            query: (id) => ({ url: `/notices/${id}/publish`, method: 'PATCH' }),
            invalidatesTags: [{ type: 'Notice', id: 'LIST' }],
        }),

        updateNoticeSchedule: builder.mutation({
            query: ({ id, scheduledAt }) => ({
                url: `/notices/${id}/schedule`,
                method: 'PATCH',
                data: { scheduledAt }
            }),
            invalidatesTags: [{ type: 'Notice', id: 'LIST' }],
        }),

        archiveNotice: builder.mutation({
            query: (id) => ({ url: `/notices/${id}/archive`, method: 'PATCH' }),
            invalidatesTags: [{ type: 'Notice', id: 'LIST' }],
        }),

        deleteNotice: builder.mutation({
            query: (id) => ({ url: `/notices/${id}`, method: 'DELETE' }),
            invalidatesTags: [{ type: 'Notice', id: 'LIST' }],
        }),

        getNoticeAcknowledgements: builder.query({
            query: (id) => ({ url: `/notices/${id}/acknowledgements`, method: 'GET' }),
            providesTags: (r, e, id) => [{ type: 'Notice', id: `ACK_${id}` }],
        }),

        // ── Invoices (admin/accountant view) ──────────────────────────────────

        getAllInvoices: builder.query({
            query: (params = {}) => ({ url: '/invoices', method: 'GET', params }),
            providesTags: [{ type: 'Invoice', id: 'LIST' }],
        }),
    }),
});

export const {
    useGetAdminDashboardQuery,
    useGetSocietyProfileQuery,
    useUpdateSocietyProfileMutation,
    useUpdateSocietyLogoMutation,
    useListStaffQuery,
    useCreateStaffMutation,
    useDeactivateStaffMutation,
    useListResidentsQuery,
    useListResidentProfilesQuery,
    useGetResidentProfileQuery,
    useApproveResidentMutation,
    useRejectResidentMutation,
    useRevokeResidentMutation,
    useListTowersQuery,
    useCreateTowerMutation,
    useUpdateTowerMutation,
    useDeleteTowerMutation,
    useListFloorsQuery,
    useCreateFloorMutation,
    useUpdateFloorMutation,
    useDeleteFloorMutation,
    useListUnitsQuery,
    useCreateUnitMutation,
    useUpdateUnitMutation,
    useDeleteUnitMutation,
    // Complaints
    useGetAllComplaintsQuery,
    useChangeComplaintStatusAdminMutation,
    useDeleteComplaintAdminMutation,
    // Notices
    useGetAllNoticesQuery,
    useCreateNoticeMutation,
    usePublishNoticeMutation,
    useUpdateNoticeScheduleMutation,
    useArchiveNoticeMutation,
    useDeleteNoticeMutation,
    useGetNoticeAcknowledgementsQuery,
    // Invoices
    useGetAllInvoicesQuery,
} = societyAdminApi;

