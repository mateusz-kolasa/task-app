import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { BoardCreateData, BoardData, BoardFullData } from 'shared-types'
import API_PATHS from '../../consts/api-paths'

export const boardApiSlice = createApi({
  reducerPath: 'boardApi',
  baseQuery: fetchBaseQuery({
    baseUrl: new URL('/api/board/', location.origin).href,
  }),
  tagTypes: ['Boards'],
  endpoints: builder => ({
    userBoards: builder.query<BoardData[], void>({
      query: () => '',
      providesTags: ['Boards'],
    }),
    boardData: builder.query<BoardFullData, string>({
      query: id => ({
        url: id,
      }),
    }),
    createBoard: builder.mutation<BoardData, BoardCreateData>({
      query: createdBoard => ({
        url: API_PATHS.createBoard,
        method: 'POST',
        body: createdBoard,
      }),
      invalidatesTags: ['Boards'],
    }),
  }),
})

export const { useUserBoardsQuery, useBoardDataQuery, useCreateBoardMutation } = boardApiSlice
