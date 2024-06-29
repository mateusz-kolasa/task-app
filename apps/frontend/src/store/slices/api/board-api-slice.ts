import {
  BoardAddUserData,
  BoardCreateData,
  BoardData,
  BoardFullData,
  UsersInBoardsWithUsername,
} from 'shared-types'
import { apiSlice, cardsAdapter, listsAdapter, userInBoardAdapter } from './api-slice'
import { ListNormalized } from 'types/list-normalized'
import { BoardNormalized } from 'types/board-normalized'
import API_PATHS from 'consts/api-paths'
import BoardSocket from 'sockets/BoardSocket'

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
          users: userInBoardAdapter.addMany(userInBoardAdapter.getInitialState(), response.users),
        }
      },
      async onCacheEntryAdded(boardId, { cacheDataLoaded, cacheEntryRemoved }) {
        try {
          // wait for the initial query to resolve before proceeding
          await cacheDataLoaded
          BoardSocket.joinBoard(parseInt(boardId))
        } catch {
          /* empty */
        }

        // cacheEntryRemoved will resolve when the cache subscription is no longer active
        await cacheEntryRemoved
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
    addBoardUser: builder.mutation<UsersInBoardsWithUsername, BoardAddUserData>({
      query: userData => ({
        url: API_PATHS.addBoardUser,
        method: 'POST',
        body: userData,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data: userInBoard } = await queryFulfilled

          dispatch(
            boardApiSlice.util.updateQueryData(
              'boardData',
              userInBoard.boardId.toString(),
              boardData => {
                boardData.users = userInBoardAdapter.addOne(boardData.users, userInBoard)
              }
            )
          )
        } catch (error) {
          /* empty */
        }
      },
    }),
  }),
})

export const {
  useUserBoardsQuery,
  useBoardDataQuery,
  useCreateBoardMutation,
  useAddBoardUserMutation,
} = boardApiSlice
