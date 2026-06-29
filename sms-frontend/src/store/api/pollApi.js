import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './baseApi';

export const pollApi = createApi({
    reducerPath: 'pollApi',
    baseQuery: axiosBaseQuery(),
    tagTypes: ['Poll'],
    endpoints: (builder) => ({
        // Admin Endpoints
        getAdminPolls: builder.query({
            query: () => ({ url: '/polls/admin/all', method: 'GET' }),
            providesTags: ['Poll'],
        }),
        getAdminPollById: builder.query({
            query: (id) => ({ url: `/polls/admin/${id}`, method: 'GET' }),
            providesTags: (result, error, id) => [{ type: 'Poll', id }],
        }),
        createPoll: builder.mutation({
            query: (data) => ({ url: '/polls', method: 'POST', data }),
            invalidatesTags: ['Poll'],
        }),
        publishPoll: builder.mutation({
            query: (id) => ({ url: `/polls/admin/${id}/publish`, method: 'POST' }),
            invalidatesTags: ['Poll'],
        }),
        closePoll: builder.mutation({
            query: (id) => ({ url: `/polls/admin/${id}/close`, method: 'POST' }),
            invalidatesTags: ['Poll'],
        }),
        deletePoll: builder.mutation({
            query: (id) => ({ url: `/polls/admin/${id}`, method: 'DELETE' }),
            invalidatesTags: ['Poll'],
        }),

        // Resident Endpoints
        getResidentActivePolls: builder.query({
            query: () => ({ url: '/polls/resident/active', method: 'GET' }),
            providesTags: ['Poll'],
        }),
        getResidentVotedPolls: builder.query({
            query: () => ({ url: '/polls/resident/my', method: 'GET' }),
            providesTags: ['Poll'],
        }),
        getResidentPollById: builder.query({
            query: (id) => ({ url: `/polls/resident/${id}`, method: 'GET' }),
            providesTags: (result, error, id) => [{ type: 'Poll', id }],
        }),
        submitVote: builder.mutation({
            query: ({ id, optionIds }) => ({ url: `/polls/resident/${id}/vote`, method: 'POST', data: { optionIds } }),
            invalidatesTags: ['Poll'],
        }),
    }),
});

export const {
    useGetAdminPollsQuery,
    useGetAdminPollByIdQuery,
    useCreatePollMutation,
    usePublishPollMutation,
    useClosePollMutation,
    useDeletePollMutation,
    useGetResidentActivePollsQuery,
    useGetResidentVotedPollsQuery,
    useGetResidentPollByIdQuery,
    useSubmitVoteMutation,
} = pollApi;
