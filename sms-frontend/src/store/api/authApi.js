import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './baseApi';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    sendOtp: builder.mutation({
      query: (data) => ({
        url: '/auth/otp/send',
        method: 'POST',
        data,
      }),
    }),
    loginWithOtp: builder.mutation({
      query: (data) => ({
        url: '/auth/login/otp',
        method: 'POST',
        data,
      }),
    }),
    loginWithPassword: builder.mutation({
      query: (data) => ({
        url: '/auth/login/password',
        method: 'POST',
        data,
      }),
    }),
    registerResidentInitiate: builder.mutation({
      query: (data) => ({
        url: '/auth/register/resident/initiate',
        method: 'POST',
        data,
      }),
    }),
    registerResidentVerify: builder.mutation({
      query: (data) => ({
        url: '/auth/register/resident/verify',
        method: 'POST',
        data,
      }),
    }),
    registerResidentProfile: builder.mutation({
      query: (data) => ({
        url: '/residents/profile',
        method: 'POST',
        // In reality, this requires the temp token. We will pass headers dynamically in the component or via a baseQuery wrapper.
        // For simplicity, we can just pass the tempToken in headers here if needed:
        headers: data.tempToken ? { Authorization: `Bearer ${data.tempToken}` } : {},
        data: data.payload,
      }),
    }),
    getPublicSocieties: builder.query({
      query: () => '/public/societies',
    }),
    getPublicUnits: builder.query({
      query: (societyId) => `/public/societies/${societyId}/units`,
    }),
    resetPassword: builder.mutation({
      query: (data) => ({
        url: '/auth/forgot-password/reset',
        method: 'POST',
        data,
      }),
    }),
  }),
});

export const {
  useSendOtpMutation,
  useLoginWithOtpMutation,
  useLoginWithPasswordMutation,
  useRegisterResidentInitiateMutation,
  useRegisterResidentVerifyMutation,
  useRegisterResidentProfileMutation,
  useGetPublicSocietiesQuery,
  useGetPublicUnitsQuery,
  useResetPasswordMutation,
} = authApi;
