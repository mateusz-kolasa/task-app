import { Group, ScrollArea, Stack } from '@mantine/core'
import ListCardBase from 'components/ListCardBase/ListCardBase'
import AddCardButton from './AddCard/AddCardButton'
import { useParams } from 'react-router-dom'
import { useBoardDataQuery } from 'store/slices/api/board-api-slice'
import ListTitleText from './ListTitleText/ListTitleText'
import ListDeleteButton from './ListDeleteButton/ListDeleteButton'
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import { DraggableAttributes } from '@dnd-kit/core'
import SortableTaskCard from '../TaskCard/SortableTaskCard'
import { arrayMove, SortableContext } from '@dnd-kit/sortable'
import { memo, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from 'store/store'
import { createSelector } from '@reduxjs/toolkit'

interface ListCardProps {
  listId: number
  attributes?: DraggableAttributes
  listeners?: SyntheticListenerMap
}

createSelector(
  (state: RootState) => state.draggable.card?.index,
  index => index
)

const ListCard = memo(({ listId, attributes, listeners }: Readonly<ListCardProps>) => {
  const { boardId } = useParams()
  const { cardIds = [] } = useBoardDataQuery(boardId ?? '', {
    selectFromResult: ({ data }) => {
      const list = data?.lists.entities[listId]
      return { title: list?.title, cardIds: list?.cards.ids }
    },
  })

  const dragCardId = useSelector((state: RootState) => state.draggable.card?.cardId)
  const sourceListId = useSelector((state: RootState) => state.draggable.card?.sourceListId)
  const isOverList = useSelector((state: RootState) => state.draggable.card?.overListId === listId)
  const index = useSelector((state: RootState) =>
    state.draggable.card?.overListId === listId ? state.draggable.card?.index : 0
  )

  // To enable draging cards between lists, the card must be added to cardIds of list it is hovering over
  const sortableCardIds = useMemo(() => {
    let sortableIds = cardIds.map(cardId => ({
      id: `card_${cardId}`,
      cardId: cardId,
      listId,
    }))

    if (dragCardId && sourceListId) {
      if (sourceListId === listId && !isOverList) {
        sortableIds = sortableIds.filter(sortable => sortable.cardId !== dragCardId)
      } else if (sourceListId !== listId && isOverList) {
        sortableIds.push({
          id: `card_${dragCardId}`,
          cardId: dragCardId,
          listId: sourceListId,
        })
      }

      if (isOverList) {
        // If card is hovering over this list, initialize it at correct position
        const dragIndex = sortableIds.findIndex(sortable => sortable.cardId === dragCardId)
        sortableIds = arrayMove(sortableIds, dragIndex, index ?? 0)
      }
    }

    return sortableIds
  }, [cardIds, dragCardId, index, isOverList, listId, sourceListId])

  return (
    <ListCardBase>
      <Group>
        <ListTitleText listId={listId} listeners={listeners} attributes={attributes} />
        <ListDeleteButton listId={listId} />
      </Group>

      <ScrollArea.Autosize scrollbars='y' type='auto' mt='md' mb='md' flex={1} w='100%'>
        <Stack
          data-testid='list-stack'
          mih={20}
          w='100%'
          // Apply margin directly in children due to dnd library not recognizing including gap
          gap={0}
        >
          <SortableContext items={sortableCardIds} id={`list_${listId}`}>
            {sortableCardIds.map(({ cardId, listId }) => (
              <SortableTaskCard listId={listId} cardId={cardId} key={`card_${cardId}`} />
            ))}
          </SortableContext>
        </Stack>
      </ScrollArea.Autosize>

      <AddCardButton listId={listId} />
    </ListCardBase>
  )
})

export default ListCard
