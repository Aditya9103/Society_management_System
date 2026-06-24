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
        data: data.payload,
      }),
    }),
    getPublicSocieties: builder.query({
      query: () => ({ url: '/public/societies', method: 'GET' }),
    }),
    getPublicUnits: builder.query({
      query: (societyId) => ({ url: `/public/societies/${societyId}/units`, method: 'GET' }),
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
