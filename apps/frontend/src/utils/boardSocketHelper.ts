import { Update } from '@reduxjs/toolkit'
import {
  Card,
  DeleteCardData,
  DeleteListData,
  List,
  ListFullData,
  SockedBoardUpdateData,
} from 'shared-types'
import { cardsAdapter, listsAdapter } from 'store/slices/api/api-slice'
import { boardApiSlice } from 'store/slices/api/board-api-slice'
import { store } from 'store/store'
import { ListNormalized } from 'types/list-normalized'

export const addList = ({ boardId, payload }: SockedBoardUpdateData<ListFullData>) => {
  store.dispatch(
    boardApiSlice.util.updateQueryData('boardData', boardId.toString(), previousBoard => {
      const cards = cardsAdapter.addMany(cardsAdapter.getInitialState(), payload.cards)
      previousBoard.lists = listsAdapter.upsertOne(previousBoard.lists, { ...payload, cards })
    })
  )
}

export const updateListTitle = ({ boardId, payload }: SockedBoardUpdateData<List>) => {
  store.dispatch(
    boardApiSlice.util.updateQueryData('boardData', boardId.toString(), previousBoard => {
      previousBoard.lists.entities[payload.id].title = payload.title
    })
  )
}

export const changeListPosition = ({ boardId, payload }: SockedBoardUpdateData<List[]>) => {
  store.dispatch(
    boardApiSlice.util.updateQueryData('boardData', boardId.toString(), previousBoard => {
      const positionsUpdate: Update<ListNormalized, number>[] = payload.map(list => ({
        id: list.id,
        changes: {
          position: list.position,
        },
      }))

      previousBoard.lists = listsAdapter.updateMany(previousBoard.lists, positionsUpdate)
    })
  )
}

export const deleteList = ({ boardId, payload }: SockedBoardUpdateData<DeleteListData>) => {
  store.dispatch(
    boardApiSlice.util.updateQueryData('boardData', boardId.toString(), previousBoard => {
      const { id: listId } = payload.deleted
      const listPositionUpdate: Update<List, number>[] = payload.remaining.map(card => ({
        id: listId,
        changes: {
          position: card.position,
        },
      }))

      previousBoard.lists = listsAdapter.removeOne(previousBoard.lists, listId)
      previousBoard.lists = listsAdapter.updateMany(previousBoard.lists, listPositionUpdate)
    })
  )
}

export const addCard = ({ boardId, payload }: SockedBoardUpdateData<Card>) => {
  store.dispatch(
    boardApiSlice.util.updateQueryData('boardData', boardId.toString(), previousBoard => {
      const list = previousBoard.lists.entities[payload.listId]
      list.cards = cardsAdapter.addOne(list.cards, payload)
    })
  )
}

export const updateCardTitle = ({ boardId, payload }: SockedBoardUpdateData<Card>) => {
  store.dispatch(
    boardApiSlice.util.updateQueryData('boardData', boardId.toString(), previousBoard => {
      previousBoard.lists.entities[payload.listId].cards.entities[payload.id].title = payload.title
    })
  )
}

export const changeCardPosition = ({ boardId, payload }: SockedBoardUpdateData<Card[]>) => {
  store.dispatch(
    boardApiSlice.util.updateQueryData('boardData', boardId.toString(), previousBoard => {
      const changedLists = [...new Set(payload.map(card => card.listId))]

      for (const listId of changedLists) {
        const list = previousBoard.lists.entities[listId]

        list.cards = cardsAdapter.setMany(
          cardsAdapter.getInitialState(),
          payload.filter(card => card.listId === listId)
        )
      }
    })
  )
}

export const deleteCard = ({ boardId, payload }: SockedBoardUpdateData<DeleteCardData>) => {
  store.dispatch(
    boardApiSlice.util.updateQueryData('boardData', boardId.toString(), previousBoard => {
      const { listId, id: cardId } = payload.deleted
      const cardPositionUpdate: Update<Card, number>[] = payload.remaining.map(card => ({
        id: cardId,
        changes: {
          position: card.position,
        },
      }))

      const list = previousBoard.lists.entities[listId]
      list.cards = cardsAdapter.removeOne(list.cards, cardId)
      list.cards = cardsAdapter.updateMany(list.cards, cardPositionUpdate)
    })
  )
}
