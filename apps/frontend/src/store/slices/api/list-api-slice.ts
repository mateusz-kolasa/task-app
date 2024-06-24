import {
  ChangeListPositionData,
  ChangeListTitleData,
  List,
  ListCreateData,
  ListFullData,
} from 'shared-types'
import { boardApiSlice } from './board-api-slice'
import { apiSlice, cardsAdapter, listsAdapter } from './api-slice'
import API_PATHS from 'consts/api-paths'
import { movePosition } from 'utils/dndHelper'

interface ChangeListPositionDataWithBoardId extends ChangeListPositionData {
  boardId: string
}

interface ChangeListTitleWithBoardId extends ChangeListTitleData {
  boardId: string
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
  }),
})

export const { useCreateListMutation, useChangeListPositionMutation, useChangeListTitleMutation } =
  listApiSlice
