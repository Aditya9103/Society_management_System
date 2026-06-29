import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './baseApi';

export const vehicleApi = createApi({
    reducerPath: 'vehicleApi',
    baseQuery: axiosBaseQuery(),
    tagTypes: ['Vehicle', 'VehicleLog', 'Parking'],
    endpoints: (builder) => ({
        // Resident Endpoints 
        getMyVehicles: builder.query({
            query: () => ({ url: '/vehicles', method: 'GET' }),
            providesTags: ['Vehicle'],
        }),
        registerVehicle: builder.mutation({
            query: (data) => ({ url: '/vehicles', method: 'POST', data }),
            invalidatesTags: ['Vehicle'],
        }),
        updateMyVehicle: builder.mutation({
            query: ({ id, ...data }) => ({ url: `/vehicles/${id}`, method: 'PUT', data }),
            invalidatesTags: ['Vehicle'],
        }),
        deleteMyVehicle: builder.mutation({
            query: (id) => ({ url: `/vehicles/${id}`, method: 'DELETE' }),
            invalidatesTags: ['Vehicle'],
        }),
        regenerateVehicleQr: builder.mutation({
            query: (id) => ({ url: `/vehicles/${id}/regenerate-qr`, method: 'POST' }),
            invalidatesTags: ['Vehicle'],
        }),

        // Admin Endpoints
        getAllVehicles: builder.query({
            query: () => ({ url: '/vehicles/admin/all', method: 'GET' }),
            providesTags: ['Vehicle'],
        }),
        approveVehicle: builder.mutation({
            query: (id) => ({ url: `/vehicles/admin/${id}/approve`, method: 'POST' }),
            invalidatesTags: ['Vehicle'],
        }),
        rejectVehicle: builder.mutation({
            query: ({ id, reason }) => ({ url: `/vehicles/admin/${id}/reject`, method: 'POST', data: { reason } }),
            invalidatesTags: ['Vehicle'],
        }),
        blockVehicle: builder.mutation({
            query: ({ id, reason }) => ({ url: `/vehicles/admin/${id}/block`, method: 'POST', data: { reason } }),
            invalidatesTags: ['Vehicle'],
        }),
        getVehicleLogs: builder.query({
            query: () => ({ url: '/vehicles/admin/logs', method: 'GET' }),
            providesTags: ['VehicleLog'],
        }),

        // Guard Endpoints
        scanVehicleEntry: builder.mutation({
            query: (data) => ({ url: '/vehicles/scan/entry', method: 'POST', data }),
            invalidatesTags: ['VehicleLog'],
        }),
        scanVehicleExit: builder.mutation({
            query: (data) => ({ url: '/vehicles/scan/exit', method: 'POST', data }),
            invalidatesTags: ['VehicleLog'],
        }),

        // Parking Endpoints
        getParkingSlots: builder.query({
            query: () => ({ url: '/vehicles/parking', method: 'GET' }),
            providesTags: ['Parking'],
        }),
        createParkingSlot: builder.mutation({
            query: (data) => ({ url: '/vehicles/parking', method: 'POST', data }),
            invalidatesTags: ['Parking'],
        }),
        assignParkingSlot: builder.mutation({
            query: ({ slotId, vehicleId }) => ({ url: `/vehicles/parking/${slotId}/assign`, method: 'POST', data: { vehicleId } }),
            invalidatesTags: ['Parking', 'Vehicle'],
        }),
        unassignParkingSlot: builder.mutation({
            query: (slotId) => ({ url: `/vehicles/parking/${slotId}/unassign`, method: 'POST' }),
            invalidatesTags: ['Parking', 'Vehicle'],
        }),
    }),
});

export const {
    useGetMyVehiclesQuery,
    useRegisterVehicleMutation,
    useUpdateMyVehicleMutation,
    useDeleteMyVehicleMutation,
    useRegenerateVehicleQrMutation,
    useGetAllVehiclesQuery,
    useApproveVehicleMutation,
    useRejectVehicleMutation,
    useBlockVehicleMutation,
    useGetVehicleLogsQuery,
    useScanVehicleEntryMutation,
    useScanVehicleExitMutation,
    useGetParkingSlotsQuery,
    useCreateParkingSlotMutation,
    useAssignParkingSlotMutation,
    useUnassignParkingSlotMutation,
} = vehicleApi;
