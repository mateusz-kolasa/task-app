import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import ListCard from './ListCard'
import { useBoardDataQuery } from 'store/slices/api/board-api-slice'
import { useParams } from 'react-router-dom'
import { LIST_MAX_HEIGHT } from 'consts/style-consts'
import useIsAuthorized from 'hooks/useIsAuthorized'
import { BOARD_PERMISSIONS } from 'shared-consts'

interface SortableListCardProps {
  listId: number
}

function SortableListCard({ listId }: Readonly<SortableListCardProps>) {
  const { boardId = '' } = useParams()
  const { position = 0 } = useBoardDataQuery(boardId ?? '', {
    selectFromResult: ({ data }) => {
      const list = data?.lists.entities[listId]
      return { position: list?.position }
    },
  })

  const isAuthorized = useIsAuthorized()

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: listId,
    data: {
      type: 'list',
      listId,
      position,
    },
    disabled: !isAuthorized(BOARD_PERMISSIONS.edit),
  })
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    // Extend height for dragging collision detection
    height: LIST_MAX_HEIGHT,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <ListCard listId={listId} attributes={attributes} listeners={listeners} />
    </div>
  )
}

export default SortableListCard
