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
        }),

        // ── Admin / Guard ────────────────────────────────────────────────────
        
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
            invalidatesTags: ['Emergency'],
        }),

        broadcastUpdate: builder.mutation({
            query: (data) => ({ url: '/emergencies/broadcast', method: 'POST', data }),
        })
    }),
});

export const {
    useTriggerSOSMutation,
    useGetActiveEmergenciesQuery,
    useUpdateEmergencyStatusMutation,
    useBroadcastUpdateMutation,
} = emergencyApi;
