import { Card, CardCreateData } from 'shared-types'
import { boardApiSlice } from './board-api-slice'
import { apiSlice, cardsAdapter } from './api-slice'
import API_PATHS from 'consts/api-paths'

interface CardCreateDataWithBoardId extends CardCreateData {
  boardId: string
}

export const cardApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    createCard: builder.mutation<Card, CardCreateDataWithBoardId>({
      query: createdCard => ({
        url: API_PATHS.card,
        method: 'POST',
        body: {
          title: createdCard.title,
          listId: createdCard.listId,
        },
      }),
      async onQueryStarted({ boardId, listId }, { dispatch, queryFulfilled }) {
        try {
          const { data: createdCard } = await queryFulfilled

          dispatch(
            boardApiSlice.util.updateQueryData('boardData', boardId, boardData => {
              boardData.lists.entities[listId].cards = cardsAdapter.addOne(
                boardData.lists.entities[listId].cards,
                createdCard
              )
            })
          )
        } catch (error) {
          /* empty */
        }
      },
    }),
  }),
})

export const { useCreateCardMutation } = cardApiSlice
