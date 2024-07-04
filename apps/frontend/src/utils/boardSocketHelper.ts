import { Update } from '@reduxjs/toolkit'
import {
  Card,
  ChangeBoardDescriptionData,
  ChangeBoardTitleData,
  ChangeCardPositionResultData,
  DeleteCardData,
  DeleteListData,
  List,
  ListFullData,
  SockedBoardUpdateData,
  UsersInBoardsFullData,
} from 'shared-types'
import { cardsAdapter, listsAdapter, userInBoardAdapter } from 'store/slices/api/api-slice'
import { boardApiSlice } from 'store/slices/api/board-api-slice'
import { store } from 'store/store'
import { ListNormalized } from 'types/list-normalized'

export const addUser = ({ boardId, payload }: SockedBoardUpdateData<UsersInBoardsFullData>) => {
  store.dispatch(
    boardApiSlice.util.updateQueryData('boardData', boardId.toString(), previousBoard => {
      previousBoard.users = userInBoardAdapter.addOne(previousBoard.users, payload)
    })
  )
}

export const changeBoardTitle = ({
  boardId,
  payload,
}: SockedBoardUpdateData<ChangeBoardTitleData>) => {
  store.dispatch(
    boardApiSlice.util.updateQueryData('boardData', boardId.toString(), previousBoard => {
      previousBoard.title = payload.title
    })
  )
}

export const changeBoardDescription = ({
  boardId,
  payload,
}: SockedBoardUpdateData<ChangeBoardDescriptionData>) => {
  store.dispatch(
    boardApiSlice.util.updateQueryData('boardData', boardId.toString(), previousBoard => {
      previousBoard.description = payload.description
    })
  )
}

export const leaveBoard = ({ boardId, payload }: SockedBoardUpdateData<number>) => {
  store.dispatch(
    boardApiSlice.util.updateQueryData('boardData', boardId.toString(), previousBoard => {
      previousBoard.users = userInBoardAdapter.removeOne(previousBoard.users, payload)
    })
  )
}

export const deleteBoard = ({ boardId }: SockedBoardUpdateData<UsersInBoardsFullData>) => {
  store.dispatch(boardApiSlice.util.invalidateTags([{ type: 'Board', id: boardId }]))
}

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

export const changeCardPosition = ({
  boardId,
  payload,
}: SockedBoardUpdateData<ChangeCardPositionResultData>) => {
  store.dispatch(
    boardApiSlice.util.updateQueryData('boardData', boardId.toString(), previousBoard => {
      const changedLists = [...new Set(payload.updatedCards.map(card => card.listId))]

      // If card was moved between lists, remove from old one
      if (payload.sourceCard.listId !== payload.targetCard.listId) {
        const sourceList = previousBoard.lists.entities[payload.sourceCard.listId]
        sourceList.cards = cardsAdapter.removeOne(sourceList.cards, payload.sourceCard.id)

        const targetList = previousBoard.lists.entities[payload.targetCard.listId]
        targetList.cards = cardsAdapter.addOne(targetList.cards, payload.targetCard)
      }

      for (const listId of changedLists) {
        const list = previousBoard.lists.entities[listId]
        const positionUpdate: Update<Card, number>[] = payload.updatedCards
          .filter(card => card.listId === listId)
          .map(card => ({
            id: card.id,
            changes: {
              position: card.position,
            },
          }))

        list.cards = cardsAdapter.updateMany(list.cards, positionUpdate)
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
