import {
  ChangeListPositionData,
  ChangeListTitleData,
  DeleteListData,
  List,
  ListCreateData,
  ListFullData,
} from 'shared-types'
import { boardApiSlice } from './board-api-slice'
import { apiSlice, cardsAdapter, listsAdapter } from './api-slice'
import API_PATHS from 'consts/api-paths'
import { movePosition } from 'utils/dndHelper'
import { Update } from '@reduxjs/toolkit'

interface WithBoardId {
  boardId: string
}

interface ChangeListPositionDataWithBoardId extends ChangeListPositionData, WithBoardId {}
interface ChangeListTitleWithBoardId extends ChangeListTitleData, WithBoardId {}
interface ListIdWithBoardId extends WithBoardId {
  listId: number
}

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
    changeListPosition: builder.mutation<ListFullData[], ChangeListPositionDataWithBoardId>({
      query: listPosition => ({
        url: API_PATHS.changeListPosition,
        method: 'POST',
        body: listPosition,
      }),
      async onQueryStarted({ position, listId, boardId }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          boardApiSlice.util.updateQueryData('boardData', boardId.toString(), previousBoard => {
            const list = previousBoard.lists.entities[listId]

            const updatedLists = movePosition(
              previousBoard.lists.ids,
              previousBoard.lists.entities,
              list.position,
              position,
              listId
            )

            previousBoard.lists = listsAdapter.updateMany(previousBoard.lists, updatedLists)
          })
        )

        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
    }),
    changeListTitle: builder.mutation<List, ChangeListTitleWithBoardId>({
      query: listTitle => ({
        url: API_PATHS.changeListTitle,
        method: 'PATCH',
        body: listTitle,
      }),
      async onQueryStarted({ title, listId, boardId }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          boardApiSlice.util.updateQueryData('boardData', boardId.toString(), previousBoard => {
            previousBoard.lists.entities[listId].title = title
          })
        )

        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
    }),
    deleteList: builder.mutation<DeleteListData, ListIdWithBoardId>({
      query: deleteListData => ({
        url: `${API_PATHS.list}/${deleteListData.listId}`,
        method: 'DELETE',
      }),
      async onQueryStarted({ boardId, listId }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled

          dispatch(
            boardApiSlice.util.updateQueryData('boardData', boardId, boardData => {
              const removedList = boardData.lists.entities[listId]
              const listPositionsUpdate: Update<List, number>[] = Object.values(boardData.lists)
                .filter(list => removedList.position < list.position)
                .map(list => ({
                  id: list.id,
                  changes: { position: list.position - 1 },
                }))

              boardData.lists = listsAdapter.removeOne(boardData.lists, listId)
              boardData.lists = listsAdapter.updateMany(boardData.lists, listPositionsUpdate)
            })
          )
        } catch (error) {
          /* empty */
        }
      },
    }),
  }),
})

export const {
  useCreateListMutation,
  useChangeListPositionMutation,
  useChangeListTitleMutation,
  useDeleteListMutation,
} = listApiSlice
