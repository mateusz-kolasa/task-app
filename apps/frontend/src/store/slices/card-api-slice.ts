import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { CardCreateData, ListFullData } from 'shared-types'
import { boardApiSlice } from './board-api-slice'

export const cardApiSlice = createApi({
  reducerPath: 'cardApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/card/',
  }),
  endpoints: builder => ({
    createCard: builder.mutation<ListFullData, CardCreateData>({
      query: createdCard => ({
        url: '',
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
        } catch {
          /* empty */
        }
      },
    }),
  }),
})

export const { useCreateCardMutation } = cardApiSlice
