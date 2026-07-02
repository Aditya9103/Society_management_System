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
            async onQueryStarted({ residentId, userId, formData }, { dispatch, queryFulfilled }) {
                const { societyAdminApi } = await import('./societyAdminApi');
                const patchResult = dispatch(
                    societyAdminApi.util.updateQueryData('getResidentProfile', userId || residentId, (draft) => {
                        if (draft.data?.residentDetails) {
                            draft.data.residentDetails.idCardGeneratedAt = new Date().toISOString();
                            const pdfBlob = formData.get('pdf');
                            if (pdfBlob) {
                                draft.data.residentDetails.idCardUrl = URL.createObjectURL(pdfBlob);
                            }
                        }
                    })
                );
                try {
                    const { data } = await queryFulfilled;
                    // Update cache with the actual new URL from backend
                    dispatch(
                        societyAdminApi.util.updateQueryData('getResidentProfile', userId || residentId, (draft) => {
                            if (draft.data?.residentDetails && data?.data?.idCardUrl) {
                                draft.data.residentDetails.idCardUrl = data.data.idCardUrl;
                            }
                        })
                    );
                } catch {
                    patchResult.undo();
                }
            },
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
