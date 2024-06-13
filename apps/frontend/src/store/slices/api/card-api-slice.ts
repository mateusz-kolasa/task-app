import { CardCreateData, ListFullData } from 'shared-types'
import { boardApiSlice } from './board-api-slice'
import { apiSlice } from './api-slice'
import API_PATHS from 'consts/api-paths'

export const cardApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    createCard: builder.mutation<ListFullData, CardCreateData>({
      query: createdCard => ({
        url: API_PATHS.card,
        method: 'POST',
        body: createdCard,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data: updatedList } = await queryFulfilled
          dispatch(
            boardApiSlice.util.updateQueryData(
              'boardData',
              updatedList.boardId.toString(),
              boardData => {
                const index = boardData.lists.findIndex(list => list.id === updatedList.id)
                boardData.lists[index] = updatedList
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

export const { useCreateCardMutation } = cardApiSlice
