/**
 * facilityApi.js — RTK Query endpoints for Amenity & Booking module.
 *
 * Base URL: /api/v1/facilities
 *
 * Tags:
 *   'Amenity' | 'Booking'
 */
import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './baseApi';

export const facilityApi = createApi({
    reducerPath: 'facilityApi',
    baseQuery: axiosBaseQuery(),
    tagTypes: ['Amenity', 'Booking'],

    endpoints: (builder) => ({

        // ── Amenities ─────────────────────────────────────────────────────────

        /** GET /facilities/amenities */
        listAmenities: builder.query({
            query: (params = {}) => ({ url: '/facilities/amenities', method: 'GET', params }),
            providesTags: [{ type: 'Amenity', id: 'LIST' }],
        }),

        /** GET /facilities/amenities/:id */
        getAmenity: builder.query({
            query: (id) => ({ url: `/facilities/amenities/${id}`, method: 'GET' }),
            providesTags: (r, e, id) => [{ type: 'Amenity', id }],
        }),

        /** POST /facilities/amenities */
        createAmenity: builder.mutation({
            query: (data) => ({ url: '/facilities/amenities', method: 'POST', data }),
            invalidatesTags: [{ type: 'Amenity', id: 'LIST' }],
        }),

        /** PATCH /facilities/amenities/:id */
        updateAmenity: builder.mutation({
            query: ({ id, ...data }) => ({ url: `/facilities/amenities/${id}`, method: 'PATCH', data }),
            invalidatesTags: (r, e, { id }) => [{ type: 'Amenity', id }, { type: 'Amenity', id: 'LIST' }],
        }),

        /** DELETE /facilities/amenities/:id */
        deleteAmenity: builder.mutation({
            query: (id) => ({ url: `/facilities/amenities/${id}`, method: 'DELETE' }),
            invalidatesTags: [{ type: 'Amenity', id: 'LIST' }],
        }),

        // ── Availability ─────────────────────────────────────────────────────

        /** GET /facilities/amenities/:id/availability?date=YYYY-MM-DD */
        getAvailability: builder.query({
            query: ({ amenityId, date }) => ({
                url: `/facilities/amenities/${amenityId}/availability`,
                method: 'GET',
                params: { date },
            }),
            providesTags: (r, e, { amenityId, date }) => [{ type: 'Booking', id: `avail-${amenityId}-${date}` }],
        }),

        // ── Bookings ──────────────────────────────────────────────────────────

        /** GET /facilities/bookings */
        listBookings: builder.query({
            query: (params = {}) => ({ url: '/facilities/bookings', method: 'GET', params }),
            providesTags: [{ type: 'Booking', id: 'LIST' }],
        }),

        /** GET /facilities/bookings/:id */
        getBooking: builder.query({
            query: (id) => ({ url: `/facilities/bookings/${id}`, method: 'GET' }),
            providesTags: (r, e, id) => [{ type: 'Booking', id }],
        }),

        /** POST /facilities/bookings */
        createBooking: builder.mutation({
            query: (data) => ({ url: '/facilities/bookings', method: 'POST', data }),
            invalidatesTags: [{ type: 'Booking', id: 'LIST' }],
        }),

        /** PATCH /facilities/bookings/:id/approve */
        approveBooking: builder.mutation({
            query: ({ id, ...data }) => ({ url: `/facilities/bookings/${id}/approve`, method: 'PATCH', data }),
            invalidatesTags: [{ type: 'Booking', id: 'LIST' }],
        }),

        /** PATCH /facilities/bookings/:id/reject */
        rejectBooking: builder.mutation({
            query: ({ id, reason }) => ({ url: `/facilities/bookings/${id}/reject`, method: 'PATCH', data: { reason } }),
            invalidatesTags: [{ type: 'Booking', id: 'LIST' }],
        }),

        /** PATCH /facilities/bookings/:id/cancel */
        cancelBooking: builder.mutation({
            query: ({ id, reason }) => ({ url: `/facilities/bookings/${id}/cancel`, method: 'PATCH', data: { reason } }),
            invalidatesTags: [{ type: 'Booking', id: 'LIST' }],
        }),

        /** PATCH /facilities/bookings/:id/complete */
        markCompleted: builder.mutation({
            query: (id) => ({ url: `/facilities/bookings/${id}/complete`, method: 'PATCH' }),
            invalidatesTags: [{ type: 'Booking', id: 'LIST' }],
        }),

        /** PATCH /facilities/bookings/:id/no-show */
        markNoShow: builder.mutation({
            query: (id) => ({ url: `/facilities/bookings/${id}/no-show`, method: 'PATCH' }),
            invalidatesTags: [{ type: 'Booking', id: 'LIST' }],
        }),

        /** PATCH /facilities/bookings/:id/feedback */
        submitFeedback: builder.mutation({
            query: ({ id, ...data }) => ({ url: `/facilities/bookings/${id}/feedback`, method: 'PATCH', data }),
            invalidatesTags: (r, e, { id }) => [{ type: 'Booking', id }],
        }),
    }),
});

export const {
    useListAmenitiesQuery,
    useGetAmenityQuery,
    useCreateAmenityMutation,
    useUpdateAmenityMutation,
    useDeleteAmenityMutation,
    useGetAvailabilityQuery,
    useListBookingsQuery,
    useGetBookingQuery,
    useCreateBookingMutation,
    useApproveBookingMutation,
    useRejectBookingMutation,
    useCancelBookingMutation,
    useMarkCompletedMutation,
    useMarkNoShowMutation,
    useSubmitFeedbackMutation,
} = facilityApi;
