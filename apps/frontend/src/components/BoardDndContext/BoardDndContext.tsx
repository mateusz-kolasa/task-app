import {
  Collision,
  CollisionDetection,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { notifications } from '@mantine/notifications'
import ListCard from 'pages/Board/components/ListCard/ListCard'
import TaskCard from 'pages/Board/components/TaskCard/TaskCard'
import { PropsWithChildren, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { useBoardDataQuery } from 'store/slices/api/board-api-slice'
import { useChangeCardPositionMutation } from 'store/slices/api/card-api-slice'
import { useChangeListPositionMutation } from 'store/slices/api/list-api-slice'
import {
  clearDraggable,
  setCardDragOver,
  startCardDrag,
  startListDrag,
} from 'store/slices/draggable-slice'
import { RootState } from 'store/store'
import { extractDraggableId } from 'utils/dndHelper'

function BoardDndContext({ children }: Readonly<PropsWithChildren>) {
  const { boardId = '' } = useParams()
  const { lists } = useBoardDataQuery(boardId, {
    selectFromResult: ({ data }) => {
      const lists = data?.lists.entities
      return { lists }
    },
  })

  const [changeListPosition] = useChangeListPositionMutation()
  const [changeCardPosition] = useChangeCardPositionMutation()

  const dispatch = useDispatch()

  const { t } = useTranslation()

  const activeListId = useSelector((state: RootState) => state.draggable.list?.listId)
  const activeCardId = useSelector((state: RootState) => state.draggable.card?.cardId)
  const activeCardListId = useSelector((state: RootState) => state.draggable.card?.sourceListId)

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 10,
    },
  })
  const mouseSensor = useSensor(MouseSensor)
  const touchSensor = useSensor(TouchSensor)
  const sensors = useSensors(mouseSensor, touchSensor, pointerSensor)

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'list') {
      dispatch(
        startListDrag({
          listId: event.active.data.current.listId,
        })
      )
    } else if (event.active.data.current?.type === 'card' && lists) {
      const { cardId, listId } = event.active.data.current
      const index = lists[listId].cards.ids.indexOf(cardId)
      dispatch(
        startCardDrag({
          cardId: cardId,
          sourceListId: listId,
          overListId: listId,
          index: index,
        })
      )
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    dispatch(clearDraggable())

    const { active, over } = event
    if (!over || !active.data.current || !over.data.current) {
      return
    }

    const { type } = active.data.current

    if (type === 'list') {
      if (active.id === over.id) {
        return
      }

      const { listId } = active.data.current
      const { position } = over.data.current

      if (type === 'list') {
        changeListPosition({ listId, position, boardId })
          .unwrap()
          .catch(() => {
            notifications.show({
              title: t('card.move.error.title'),
              message: t('error.general.message'),
              color: 'red',
            })
          })
      }
    } else if (activeCardId && activeCardListId && lists) {
      const cardId = active.data.current.cardId
      let position: number
      let listId: number
      if (over.data.current.type === 'list') {
        listId = over.data.current.listId
        if (listId === activeCardListId) {
          position = lists[listId].cards.ids.length
        } else {
          position = lists[listId].cards.ids.length + 1
        }
      } else {
        position = over.data.current.sortable.index + 1
        listId = extractDraggableId(over.data.current.sortable.containerId)
      }

      // Card is at the original position
      if (listId === activeCardListId && position === active.data.current.position) {
        return
      }

      changeCardPosition({
        cardId: cardId,
        listId: activeCardListId,
        newListId: listId,
        boardId,
        position,
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

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event

    if (!over || !lists) {
      return
    }

    const activeId = active.id
    const overId = over.id
    if (activeId === overId) {
      return
    }

    const isActiveCard = active.data.current?.type === 'card'
    const isOvercard = over.data.current?.type === 'card'

    const currentListId = extractDraggableId(active.data.current?.sortable.containerId)
    // Ignore when moving within same list
    if (over.data.current?.listId === currentListId) {
      return
    }

    // Initialize at correct position in new list
    if (isActiveCard && isOvercard) {
      const index = lists[over.data.current?.listId].cards.ids.indexOf(over.data.current?.cardId)
      dispatch(setCardDragOver({ overListId: over.data.current?.listId, index }))
    } else if (isActiveCard) {
      const index = lists[over.data.current?.listId].cards.ids.length
      dispatch(setCardDragOver({ overListId: over.data.current?.listId, index }))
    }
  }

  const collisionDetectionStrategy: CollisionDetection = useCallback(args => {
    let detections: Collision[] = pointerWithin(args)
    if (detections.length === 0) {
      detections = rectIntersection(args)
    }

    // List can only switch with other lists
    if (args.active.data.current?.type === 'list') {
      detections = detections.filter(
        detection => detection.data?.droppableContainer.data.current.type === 'list'
      )
    }
    return detections
  }, [])

  const handleDragCancel = () => {
    dispatch(clearDraggable())
  }

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      collisionDetection={collisionDetectionStrategy}
      sensors={sensors}
    >
      {children}
      {createPortal(
        <DragOverlay>
          {activeListId && <ListCard listId={activeListId} />}
          {activeCardId && activeCardListId && (
            <TaskCard cardId={activeCardId} listId={activeCardListId} />
          )}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  )
}

export default BoardDndContext
