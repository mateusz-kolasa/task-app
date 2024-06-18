import { UserInfoData } from 'shared-types'
import API_PATHS from '../../../consts/api-paths'
import { UserLogin } from '../../../pages/Login/Login'
import { apiSlice } from './api-slice'

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getUserStatus: builder.query<UserInfoData, void>({
      query: () => API_PATHS.getAuth,
      providesTags: ['User'],
    }),
    login: builder.mutation<UserInfoData, UserLogin>({
      query: userData => ({
        url: API_PATHS.login,
        method: 'POST',
        body: userData,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(
            authApiSlice.util.upsertQueryData('getUserStatus', undefined, {
              username: data.username,
              id: data.id,
            })
          )
        } catch {
          /* empty */
        }
      },
    }),
    register: builder.mutation<UserInfoData, UserLogin>({
      query: userData => ({
        url: API_PATHS.register,
        method: 'POST',
        body: userData,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(
            authApiSlice.util.upsertQueryData('getUserStatus', undefined, {
              username: data.username,
              id: data.id,
            })
          )
        } catch {
          /* empty */
        }
      },
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: API_PATHS.logout,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
  }),
})

export const { useGetUserStatusQuery, useLoginMutation, useRegisterMutation, useLogoutMutation } =
  authApiSlice
