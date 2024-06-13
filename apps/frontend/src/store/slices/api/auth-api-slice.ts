import { UserInfoData } from 'shared-types'
import API_PATHS from '../../../consts/api-paths'
import { UserLogin } from '../../../pages/Login/Login'
import { apiSlice } from './api-slice'

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getUserStatus: builder.query<UserInfoData, void>({
      query: () => API_PATHS.getAuth,
    }),
    login: builder.mutation<void, UserLogin>({
      query: userData => ({
        url: API_PATHS.login,
        method: 'POST',
        body: userData,
      }),
      async onQueryStarted(userData, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          dispatch(
            authApiSlice.util.upsertQueryData('getUserStatus', undefined, {
              username: userData.username,
            })
          )
        } catch {
          /* empty */
        }
      },
    }),
    register: builder.mutation<void, UserLogin>({
      query: userData => ({
        url: API_PATHS.register,
        method: 'POST',
        body: userData,
      }),
      async onQueryStarted(userData, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          dispatch(
            authApiSlice.util.upsertQueryData('getUserStatus', undefined, {
              username: userData.username,
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
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          dispatch(authApiSlice.util.upsertQueryData('getUserStatus', undefined, {}))
        } catch {
          /* empty */
        }
      },
    }),
  }),
})

export const { useGetUserStatusQuery, useLoginMutation, useRegisterMutation, useLogoutMutation } =
  authApiSlice
