import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './baseApi';

export const idCardApi = createApi({
    reducerPath: 'idCardApi',
    baseQuery: axiosBaseQuery(),
    tagTypes: ['IdCard'],
    endpoints: (builder) => ({
        emailIdCard: builder.mutation({
            query: () => ({
                url: '/id-cards/email',
                method: 'POST',
            }),
        }),
        uploadIdCardPdf: builder.mutation({
            query: ({ residentId, formData }) => ({
                url: `/id-cards/${residentId}/upload-pdf`,
                method: 'POST',
                data: formData,
                headers: { 'Content-Type': 'multipart/form-data' },
            }),
            invalidatesTags: ['IdCard'],
        }),
        verifyIdCard: builder.mutation({
            query: (payload) => ({
                url: '/id-cards/verify',
                method: 'POST',
                data: payload,
            }),
        }),
        generateIdCard: builder.mutation({
            query: (residentId) => ({
                url: `/id-cards/${residentId}/generate`,
                method: 'POST',
            }),
        }),
        updateIdCardStatus: builder.mutation({
            query: ({ id, status }) => ({
                url: `/id-cards/${id}/status`,
                method: 'PATCH',
                data: { status },
            }),
        }),
    }),
});

export const {
    useEmailIdCardMutation,
    useVerifyIdCardMutation,
    useGenerateIdCardMutation,
    useUpdateIdCardStatusMutation,
    useUploadIdCardPdfMutation
} = idCardApi;
