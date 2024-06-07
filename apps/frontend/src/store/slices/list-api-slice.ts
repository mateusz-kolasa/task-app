import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { BoardFullData, ListCreateData } from 'shared-types'
import { boardApiSlice } from './board-api-slice'

export const listApiSlice = createApi({
  reducerPath: 'listApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/list/',
  }),
  endpoints: builder => ({
    createList: builder.mutation<BoardFullData, ListCreateData>({
      query: createdList => ({
        url: '',
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
