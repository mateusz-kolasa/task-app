import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useBoardDataQuery } from 'store/slices/api/board-api-slice'
import { useParams } from 'react-router-dom'
import TaskCard from './TaskCard'
import useIsAuthorized from 'hooks/useIsAuthorized'
import { BOARD_PERMISSIONS } from 'shared-consts'

interface SortableTaskCardProps {
  listId: number
  cardId: number
}

function SortableTaskCard({ listId, cardId }: Readonly<SortableTaskCardProps>) {
  const { boardId = '' } = useParams()
  const { position = 0 } = useBoardDataQuery(boardId ?? '', {
    selectFromResult: ({ data }) => {
      const list = data?.lists.entities[listId]
      const card = list?.cards.entities[cardId]
      return { position: card?.position }
    },
  })

  const isAuthorized = useIsAuthorized()

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: `card_${cardId}`,
    data: {
      type: 'card',
      listId,
      cardId,
      position,
    },
    disabled: !isAuthorized(BOARD_PERMISSIONS.edit),
  })
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    ...(isDragging && { opacity: 0.35 }),
  }

  return (
    <div ref={setNodeRef} style={style}>
      <TaskCard listId={listId} cardId={cardId} attributes={attributes} listeners={listeners} />
    </div>
  )
}

export default SortableTaskCard
