import { BoardCreateData, BoardData, BoardFullData } from 'shared-types'
import API_PATHS from '../../../consts/api-paths'
import { apiSlice, cardsAdapter, listsAdapter } from './api-slice'
import { ListNormalized } from 'types/list-normalized'
import { BoardNormalized } from 'types/board-normalized'

export const boardApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    userBoards: builder.query<BoardData[], void>({
      query: () => API_PATHS.board,

      providesTags: ['Boards'],
    }),
    boardData: builder.query<BoardNormalized, string>({
      query: id => ({
        url: `${API_PATHS.board}/${id}`,
      }),
      transformResponse: (response: BoardFullData) => {
        const lists: ListNormalized[] = response.lists.map(list => ({
          ...list,
          cards: cardsAdapter.addMany(cardsAdapter.getInitialState(), list.cards),
        }))

        return {
          ...response,
          lists: listsAdapter.addMany(listsAdapter.getInitialState(), lists),
        }
      },
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
