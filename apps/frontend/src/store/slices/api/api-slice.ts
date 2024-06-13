import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: new URL('/api/', location.origin).href,
  }),
  tagTypes: ['Boards'],
  endpoints: () => ({}),
})
