import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { BoardData, BoardFullData } from 'shared-types'
import API_PATHS from '../../consts/api-paths'
import { BoardCreate } from '../../pages/Dashboard/components/CreateBoardCard'

export const boardApiSlice = createApi({
  reducerPath: 'boardApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/board/',
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
    createBoard: builder.mutation<BoardData, BoardCreate>({
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
