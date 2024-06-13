import { BoardCreateData, BoardData, BoardFullData } from 'shared-types'
import API_PATHS from '../../../consts/api-paths'
import { apiSlice } from './api-slice'

export const boardApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    userBoards: builder.query<BoardData[], void>({
      query: () => API_PATHS.board,
      providesTags: ['Boards'],
    }),
    boardData: builder.query<BoardFullData, string>({
      query: id => ({
        url: `${API_PATHS.board}/${id}`,
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
