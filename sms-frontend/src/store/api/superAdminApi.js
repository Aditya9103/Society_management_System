/**
 * superAdminApi.js — RTK Query API slice for all SuperAdmin endpoints.
 *
 * Tag-based cache invalidation keeps tables fresh after mutations.
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './baseApi';

export const superAdminApi = createApi({
  reducerPath: 'superAdminApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Tenant', 'Society', 'DashboardStats'],


  endpoints: (builder) => ({

    // ── Dashboard ────────────────────────────────────────────────────────────

    getDashboardStats: builder.query({
      query: () => ({
        url: '/admin/dashboard',
        method: 'GET'
      }),
      providesTags: ['DashboardStats'],
    }),

    // ── Tenants ──────────────────────────────────────────────────────────────

    listTenants: builder.query({
      query: (params = {}) => ({
        url: '/admin/tenants',
        method: 'GET',
        params
      }),
      providesTags: (result) =>
        result
          ? [
            ...result.data.map(({ _id }) => ({ type: 'Tenant', id: _id })),
            { type: 'Tenant', id: 'LIST' },
          ]
          : [{ type: 'Tenant', id: 'LIST' }],
    }),

    createTenantWithSociety: builder.mutation({
      query: (data) => ({
        url: '/admin/tenants',
        method: 'POST',
        data
      }),
      invalidatesTags: [{
        type: 'Tenant', id: 'LIST'
      },
      {
        type: 'Society',
        id: 'LIST'
      },
        'DashboardStats'
      ],
    }),

    toggleTenantStatus: builder.mutation({
      query: (id) => ({
        url: `/admin/tenants/${id}/toggle`,
        method: 'PATCH'
      }),
      invalidatesTags: (_result, _error, id) => [{
        type: 'Tenant', id
      },
        'DashboardStats'
      ],
    }),

    // ── Societies ─────────────────────────────────────────────────────────────

    listSocieties: builder.query({
      query: (params = {}) => ({
        url: '/admin/societies',
        method: 'GET',
        params
      }),
      providesTags: (result) =>
        result
          ? [
            ...result.data.map(({ _id }) => ({ type: 'Society', id: _id })),
            { type: 'Society', id: 'LIST' },
          ]
          : [{ type: 'Society', id: 'LIST' }],
    }),

    toggleSocietyStatus: builder.mutation({
      query: (id) => ({
        url: `/admin/societies/${id}/toggle`,
        method: 'PATCH'
      }),
      invalidatesTags: (_result, _error, id) => [{
        type: 'Society',
        id
      },
        'DashboardStats'
      ],
    }),

    // ── Society Admin ─────────────────────────────────────────────────────────

    createSocietyAdmin: builder.mutation({
      query: (data) => ({
        url: '/admin/society-admin',
        method: 'POST',
        data
      }),
    }),

    // ── Fetch all societies (for dropdown in createSocietyAdmin modal) ────────

    listSocietiesForSelect: builder.query({
      query: () => ({
        url: '/admin/societies',
        method: 'GET',
        params: { limit: 100 }
      }),
      providesTags: [{
        type: 'Society',
        id: 'LIST'
      }],
    }),

    // ── Audit Logs ────────────────────────────────────────────────────────────

    listAuditLogs: builder.query({
      query: (params = {}) => ({
        url: '/admin/audit-logs',
        method: 'GET',
        params
      }),
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useListTenantsQuery,
  useCreateTenantWithSocietyMutation,
  useToggleTenantStatusMutation,
  useListSocietiesQuery,
  useToggleSocietyStatusMutation,
  useCreateSocietyAdminMutation,
  useListSocietiesForSelectQuery,
  useListAuditLogsQuery,
} = superAdminApi;
