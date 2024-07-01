import { createEntityAdapter } from '@reduxjs/toolkit'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
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

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: new URL('/api/', location.origin).href,
  }),
  tagTypes: ['Boards', 'Board', 'User'],
  endpoints: () => ({}),
})
