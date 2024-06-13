import { BoardFullData, ListCreateData } from 'shared-types'
import { boardApiSlice } from './board-api-slice'
import { apiSlice } from './api-slice'
import API_PATHS from 'consts/api-paths'

export const listApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    createList: builder.mutation<BoardFullData, ListCreateData>({
      query: createdList => ({
        url: API_PATHS.list,
        method: 'POST',
        body: createdList,
      }),
      async onQueryStarted({ boardId }, { dispatch, queryFulfilled }) {
        try {
          const { data: updatedBoard } = await queryFulfilled
          dispatch(
            boardApiSlice.util.upsertQueryData('boardData', boardId.toString(), updatedBoard)
          )
        } catch {
          /* empty */
        }
      },
    }),
  }),
})

export const { useCreateListMutation } = listApiSlice
