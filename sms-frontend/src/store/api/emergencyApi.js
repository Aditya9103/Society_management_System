import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './baseApi';
import { getSocket } from '../../socket/socketClient';

export const emergencyApi = createApi({
    reducerPath: 'emergencyApi',
    baseQuery: axiosBaseQuery(),
    tagTypes: ['Emergency'],
    
    endpoints: (builder) => ({
        // ── Resident ────────────────────────────────────────────────────────
        
        triggerSOS: builder.mutation({
            query: (data) => ({ url: '/emergencies/sos', method: 'POST', data }),
            invalidatesTags: ['Emergency']
        }),

        getMyActiveEmergency: builder.query({
            query: () => ({ url: '/emergencies/my-active', method: 'GET' }),
            providesTags: ['Emergency'],
            async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
                const socket = getSocket();
                if (!socket) return;
                
                try {
                    await cacheDataLoaded;
                    
                    const updateListener = (data) => {
                        updateCachedData((draft) => {
                            if (draft.data?.emergency?._id === data.emergencyId) {
                                if (data.status === 'RESOLVED' || data.status === 'FALSE_ALARM') {
                                    draft.data.emergency = null;
                                } else {
                                    draft.data.emergency.status = data.status;
                                }
                            }
                        });
                    };

                    socket.on('EMERGENCY_UPDATED', updateListener);
                    
                    await cacheEntryRemoved;
                    socket.off('EMERGENCY_UPDATED', updateListener);
                } catch {
                    // cache load failed
                }
            }
        }),

        // ── Admin / Guard ────────────────────────────────────────────────────
        
        getAllEmergencies: builder.query({
            query: (params) => ({ url: '/emergencies', method: 'GET', params }),
            providesTags: ['Emergency'],
        }),

        getEmergencyById: builder.query({
            query: (id) => ({ url: `/emergencies/${id}`, method: 'GET' }),
            providesTags: (result, error, id) => [{ type: 'Emergency', id }],
        }),

        getActiveEmergencies: builder.query({
            query: () => ({ url: '/emergencies/active', method: 'GET' }),
            providesTags: ['Emergency'],
            async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
                const socket = getSocket();
                if (!socket) return;
                
                try {
                    await cacheDataLoaded;
                    
                    const updateListener = (data) => {
                        updateCachedData((draft) => {
                            // If status is closed, remove from active list
                            if (data.status === 'RESOLVED' || data.status === 'FALSE_ALARM') {
                                if (draft.data?.emergencies) {
                                    draft.data.emergencies = draft.data.emergencies.filter(e => e._id !== data.emergencyId);
                                }
                            }
                        });
                    };

                    socket.on('EMERGENCY_UPDATED', updateListener);
                    
                    await cacheEntryRemoved;
                    socket.off('EMERGENCY_UPDATED', updateListener);
                } catch {
                    // cache load failed
                }
            }
        }),

        updateEmergencyStatus: builder.mutation({
            query: ({ id, ...data }) => ({ url: `/emergencies/${id}/status`, method: 'PATCH', data }),
            invalidatesTags: (result, error, { id }) => ['Emergency', { type: 'Emergency', id }],
        }),

        assignEmergencyStaff: builder.mutation({
            query: ({ id, ...data }) => ({ url: `/emergencies/${id}/assign`, method: 'PATCH', data }),
            invalidatesTags: (result, error, { id }) => ['Emergency', { type: 'Emergency', id }],
        }),

        broadcastUpdate: builder.mutation({
            query: (data) => ({ url: '/emergencies/broadcast', method: 'POST', data }),
            invalidatesTags: (result, error, { emergencyId }) => emergencyId ? [{ type: 'Emergency', id: emergencyId }] : [],
        })
    }),
});

export const {
    useTriggerSOSMutation,
    useGetMyActiveEmergencyQuery,
    useGetAllEmergenciesQuery,
    useGetEmergencyByIdQuery,
    useGetActiveEmergenciesQuery,
    useUpdateEmergencyStatusMutation,
    useAssignEmergencyStaffMutation,
    useBroadcastUpdateMutation,
} = emergencyApi;
