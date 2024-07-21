import { createEntityAdapter } from '@reduxjs/toolkit'
import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'
import API_PATHS from 'consts/api-paths'
import { CardData, UsersInBoardsWithUsername } from 'shared-types'
import { ListNormalized } from 'types/list-normalized'

export interface SortableByPosition {
  position: number
}
const sortByPosition = (elementA: SortableByPosition, elementB: SortableByPosition) =>
  elementA.position - elementB.position

export const cardsAdapter = createEntityAdapter<CardData>({
  sortComparer: sortByPosition,
})

export const listsAdapter = createEntityAdapter<ListNormalized>({
  sortComparer: sortByPosition,
})

export const userInBoardAdapter = createEntityAdapter({
  selectId: (userInBoard: UsersInBoardsWithUsername) => userInBoard.userId,
})

const noRefreshPaths: string[] = [
  API_PATHS.login,
  API_PATHS.logout,
  API_PATHS.register,
  API_PATHS.refreshAuth,
]

const baseQuery = fetchBaseQuery({ baseUrl: new URL('/api/', location.origin).href })
export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)
  if (result.error && result.error.status === 401) {
    const url = typeof args === 'string' ? args : args.url
    if (noRefreshPaths.includes(url)) {
      return result
    }

    // try to get a new token
    const refreshResult = await baseQuery(API_PATHS.refreshAuth, api, extraOptions)
    if (refreshResult.data) {
      // retry the initial query
      result = await baseQuery(args, api, extraOptions)
    } else {
      apiSlice.util.resetApiState()
    }
  }
  return result
}

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  // baseQuery: fetchBaseQuery({
  //   baseUrl: new URL('/api/', location.origin).href,
  // }),
  tagTypes: ['Boards', 'Board', 'User'],
  endpoints: () => ({}),
})
