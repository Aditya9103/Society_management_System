import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './baseApi';

export const documentApi = createApi({
    reducerPath: 'documentApi',
    baseQuery: axiosBaseQuery(),
    tagTypes: ['Document'],
    endpoints: (builder) => ({
        getDocuments: builder.query({
            query: (filters = {}) => {
                const params = new URLSearchParams();
                Object.keys(filters).forEach(k => {
                    if (filters[k] !== undefined && filters[k] !== null && filters[k] !== '') {
                        params.append(k, filters[k]);
                    }
                });
                const qs = params.toString() ? `?${params.toString()}` : '';
                return {
                    url: `/documents${qs}`,
                    method: 'GET',
                };
            },
            providesTags: ['Document'],
        }),
        getDocumentById: builder.query({
            query: (id) => ({
                url: `/documents/${id}`,
                method: 'GET',
            }),
            providesTags: ['Document'],
        }),
        uploadDocument: builder.mutation({
            query: (formData) => ({
                url: '/documents',
                method: 'POST',
                data: formData,
                headers: { 'Content-Type': 'multipart/form-data' },
            }),
            invalidatesTags: ['Document'],
        }),
        approveDocument: builder.mutation({
            query: ({ id, status }) => ({
                url: `/documents/${id}/approve`,
                method: 'POST',
                data: { status },
            }),
            invalidatesTags: ['Document'],
        }),
        downloadDocument: builder.query({
            query: (id) => ({
                url: `/documents/${id}/download`,
                method: 'GET',
            }),
        }),
        updateDocument: builder.mutation({
            query: ({ id, formData }) => ({
                url: `/documents/${id}`,
                method: 'PATCH',
                data: formData,
                headers: { 'Content-Type': 'multipart/form-data' },
            }),
            invalidatesTags: ['Document'],
        }),
        deleteDocument: builder.mutation({
            query: (id) => ({
                url: `/documents/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Document'],
        }),
        restoreDocument: builder.mutation({
            query: (id) => ({
                url: `/documents/${id}/restore`,
                method: 'POST',
            }),
            invalidatesTags: ['Document'],
        }),
        getDocumentVersions: builder.query({
            query: (id) => ({
                url: `/documents/${id}/versions`,
                method: 'GET',
            }),
            providesTags: ['Document'],
        }),
        getDocumentLogs: builder.query({
            query: (id) => ({
                url: `/documents/${id}/logs`,
                method: 'GET',
            }),
            providesTags: ['Document'],
        }),
    }),
});

export const {
    useGetDocumentsQuery,
    useLazyGetDocumentByIdQuery,
    useLazyGetDocumentsQuery,
    useUploadDocumentMutation,
    useApproveDocumentMutation,
    useLazyDownloadDocumentQuery,
    useUpdateDocumentMutation,
    useDeleteDocumentMutation,
    useRestoreDocumentMutation,
    useGetDocumentVersionsQuery,
    useLazyGetDocumentVersionsQuery,
    useGetDocumentLogsQuery,
    useLazyGetDocumentLogsQuery,
} = documentApi;
