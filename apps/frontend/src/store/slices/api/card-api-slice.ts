import { Card, CardCreateData, ChangeCardPositionData, ChangeCardTitleData } from 'shared-types'
import { boardApiSlice } from './board-api-slice'
import { apiSlice, cardsAdapter } from './api-slice'
import API_PATHS from 'consts/api-paths'
import { movePosition } from 'utils/dndHelper'
import { Update } from '@reduxjs/toolkit'

interface CardCreateDataWithBoardId extends CardCreateData {
  boardId: string
}

interface ChangeCardPositionDataContainerIds extends ChangeCardPositionData {
  boardId: string
  listId: number
}

interface ChangeCardTitleWithContainerIds extends ChangeCardTitleData {
  boardId: string
  listId: number
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
    changeCardPosition: builder.mutation<Card[], ChangeCardPositionDataContainerIds>({
      query: cardPosition => ({
        url: API_PATHS.changeCardPosition,
        method: 'POST',
        body: {
          cardId: cardPosition.cardId,
          position: cardPosition.position,
          ...(cardPosition.newListId !== cardPosition.listId && {
            newListId: cardPosition.newListId,
          }),
        },
      }),
      async onQueryStarted(
        { cardId, listId, newListId, boardId, position },
        { dispatch, queryFulfilled }
      ) {
        const patchResult = dispatch(
          boardApiSlice.util.updateQueryData('boardData', boardId.toString(), previousBoard => {
            const sourceList = previousBoard.lists.entities[listId]
            const card = sourceList.cards.entities[cardId]

            if (listId === newListId) {
              const updatedCards = movePosition(
                sourceList.cards.ids,
                sourceList.cards.entities,
                card.position,
                position,
                cardId
              )

              sourceList.cards = cardsAdapter.updateMany(sourceList.cards, updatedCards)
            } else if (newListId) {
              const destinationList = previousBoard.lists.entities[newListId]

              const sourceListUpdate: Update<Card, number>[] = Object.entries(
                sourceList.cards.entities
              )
                .filter(([, value]) => value.position > card.position)
                .map(([id, value]) => ({
                  id: parseInt(id),
                  changes: {
                    position: value.position - 1,
                  },
                }))

              const destinationListUpdate: Update<Card, number>[] = Object.entries(
                destinationList.cards.entities
              )
                .filter(([, value]) => value.position >= position)
                .map(([id, value]) => ({
                  id: parseInt(id),
                  changes: {
                    position: value.position + 1,
                  },
                }))

              sourceList.cards = cardsAdapter.updateMany(sourceList.cards, sourceListUpdate)
              sourceList.cards = cardsAdapter.removeOne(sourceList.cards, cardId)

              destinationList.cards = cardsAdapter.updateMany(
                destinationList.cards,
                destinationListUpdate
              )
              destinationList.cards = cardsAdapter.addOne(destinationList.cards, {
                ...card,
                position,
              })
            }
          })
        )

        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
    }),
    changeCardTitle: builder.mutation<Card, ChangeCardTitleWithContainerIds>({
      query: cardTitle => ({
        url: API_PATHS.changeCardTitle,
        method: 'PATCH',
        body: cardTitle,
      }),
      async onQueryStarted({ title, cardId, listId, boardId }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          boardApiSlice.util.updateQueryData('boardData', boardId.toString(), previousBoard => {
            previousBoard.lists.entities[listId].cards.entities[cardId].title = title
          })
        )

        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
    }),
  }),
})

export const { useCreateCardMutation, useChangeCardPositionMutation, useChangeCardTitleMutation } =
  cardApiSlice
