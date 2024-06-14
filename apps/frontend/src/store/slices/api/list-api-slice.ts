import { ListCreateData, ListFullData } from 'shared-types'
import { boardApiSlice } from './board-api-slice'
import { apiSlice, cardsAdapter, listsAdapter } from './api-slice'
import API_PATHS from 'consts/api-paths'

export const listApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    createList: builder.mutation<ListFullData, ListCreateData>({
      query: createdList => ({
        url: API_PATHS.list,
        method: 'POST',
        body: createdList,
      }),
      async onQueryStarted({ boardId }, { dispatch, queryFulfilled }) {
        try {
          const { data: createdList } = await queryFulfilled
          dispatch(
            boardApiSlice.util.updateQueryData('boardData', boardId.toString(), previousBoard => {
              const cards = cardsAdapter.addMany(cardsAdapter.getInitialState(), createdList.cards)
              previousBoard.lists = listsAdapter.addOne(previousBoard.lists, {
                ...createdList,
                cards,
              })
            })
          )
        } catch {
          /* empty */
        }
      },
    }),
  }),
})

export const { useCreateListMutation } = listApiSlice
