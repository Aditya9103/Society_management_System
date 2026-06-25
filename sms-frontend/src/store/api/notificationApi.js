import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './baseApi';
import { getSocket } from '../../socket/socketClient';

export const notificationApi = createApi({
    reducerPath: 'notificationApi',
    baseQuery: axiosBaseQuery(),
    tagTypes: ['Notification'],
    endpoints: (builder) => ({
        // Get all notifications for current user
        getNotifications: builder.query({
            query: (params = {}) => ({ url: '/notifications', method: 'GET', params }),
            providesTags: ['Notification'],
            // Listen for socket events to update cache in real-time
            async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
                try {
                    await cacheDataLoaded;
                    const socket = getSocket();
                    if (!socket) return;

                    // When a new notification arrives via socket
                    const handleNewNotification = (notification) => {
                        updateCachedData((draft) => {
                            // Append new notification to the top of the list
                            let list = null;
                            if (Array.isArray(draft.data?.data)) list = draft.data.data;
                            else if (Array.isArray(draft.data)) list = draft.data;

                            if (list) {
                                list.unshift({
                                    ...notification,
                                    body: notification.body || notification.message,
                                    _id: Date.now().toString(), // temporary ID
                                    createdAt: notification.timestamp,
                                    readAt: null
                                });
                            }
                            if (draft.data && draft.data.unreadCount !== undefined) {
                                draft.data.unreadCount += 1;
                            }
                        });
                    };

                    socket.on('NEW_NOTIFICATION', handleNewNotification);
                    socket.on('URGENT_NOTICE', handleNewNotification);

                    await cacheEntryRemoved;
                    socket.off('NEW_NOTIFICATION', handleNewNotification);
                    socket.off('URGENT_NOTICE', handleNewNotification);
                } catch (error) {
                    console.error('Socket cache update error (Notification):', error);
                }
            }
        }),

        // Mark a notification as read
        markAsRead: builder.mutation({
            query: (id) => ({ url: `/notifications/${id}/read`, method: 'PATCH' }),
            invalidatesTags: ['Notification'],
            async onQueryStarted(id, { dispatch, queryFulfilled }) {
                // Optimistic Update
                const patchResult = dispatch(
                    notificationApi.util.updateQueryData('getNotifications', {}, (draft) => {
                        let list = null;
                        if (Array.isArray(draft.data?.data)) list = draft.data.data;
                        else if (Array.isArray(draft.data)) list = draft.data;

                        if (list) {
                            const notif = list.find(n => n._id === id);
                            if (notif && !notif.readAt) {
                                notif.readAt = new Date().toISOString();
                                draft.data.unreadCount = Math.max(0, draft.data.unreadCount - 1);
                            }
                        }
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            }
        }),

        // Mark all as read
        markAllAsRead: builder.mutation({
            query: () => ({ url: '/notifications/read-all', method: 'PATCH' }),
            invalidatesTags: ['Notification'],
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    notificationApi.util.updateQueryData('getNotifications', {}, (draft) => {
                        let list = null;
                        if (Array.isArray(draft.data?.data)) list = draft.data.data;
                        else if (Array.isArray(draft.data)) list = draft.data;

                        if (list) {
                            list.forEach(n => {
                                if (!n.readAt) n.readAt = new Date().toISOString();
                            });
                        }
                        if (draft.data) {
                            draft.data.unreadCount = 0;
                        }
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            }
        }),

        // Delete a notification
        deleteNotification: builder.mutation({
            query: (id) => ({ url: `/notifications/${id}`, method: 'DELETE' }),
            invalidatesTags: ['Notification'],
        }),
    }),
});

export const {
    useGetNotificationsQuery,
    useMarkAsReadMutation,
    useMarkAllAsReadMutation,
    useDeleteNotificationMutation,
} = notificationApi;
