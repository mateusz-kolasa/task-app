import { DragDropContext, DropResult } from '@hello-pangea/dnd'
import { notifications } from '@mantine/notifications'
import { PropsWithChildren } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { useChangeCardPositionMutation } from 'store/slices/api/card-api-slice'
import { useChangeListPositionMutation } from 'store/slices/api/list-api-slice'
import { extractDraggableId } from 'utils/dndHelper'

function BoardDndContext({ children }: Readonly<PropsWithChildren>) {
  const { boardId = '' } = useParams()
  const [changeListPosition] = useChangeListPositionMutation()
  const [changeCardPosition] = useChangeCardPositionMutation()

  const { t } = useTranslation()

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, type, draggableId } = result

    if (!destination) {
      return
    }
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return
    }

    if (type === 'list') {
      const listId = extractDraggableId(draggableId)
      changeListPosition({ listId, position: destination.index, boardId })
        .unwrap()
        .catch(() => {
          notifications.show({
            title: t('card.move.error.title'),
            message: t('error.general.message'),
            color: 'red',
          })
        })
    } else {
      const cardId = extractDraggableId(draggableId)
      changeCardPosition({
        cardId,
        listId: parseInt(source.droppableId),
        newListId: parseInt(destination.droppableId),
        boardId,
        // dragging to empty list would give index 0
        position: Math.max(destination.index, 1),
      })
        .unwrap()
        .catch(() => {
          notifications.show({
            title: t('list.move.error.title'),
            message: t('error.general.message'),
            color: 'red',
          })
        })
    }
  }

  return <DragDropContext onDragEnd={handleDragEnd}>{children}</DragDropContext>
}

export default BoardDndContext
