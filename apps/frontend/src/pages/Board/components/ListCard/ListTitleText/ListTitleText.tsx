import { Text } from '@mantine/core'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useBoardDataQuery } from 'store/slices/api/board-api-slice'
import ListTitleTextForm from './ListTitleTextForm'
import useIsAuthorized from 'hooks/useIsAuthorized'
import { BOARD_PERMISSIONS } from 'shared-consts'
import { DraggableAttributes } from '@dnd-kit/core'
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'

interface ListTitleTextProps {
  listId: number
  attributes?: DraggableAttributes
  listeners?: SyntheticListenerMap
}

function ListTitleText({ listId, attributes, listeners }: Readonly<ListTitleTextProps>) {
  const { boardId } = useParams()
  const { title = '' } = useBoardDataQuery(boardId ?? '', {
    selectFromResult: ({ data }) => {
      const list = data?.lists.entities[listId]
      return { title: list?.title }
    },
  })

  const isAuthorized = useIsAuthorized()

  const [isEditing, setIsEditing] = useState(false)

  const handleTitleClick = () => {
    if (isAuthorized(BOARD_PERMISSIONS.edit)) {
      setIsEditing(true)
    }
  }

  const handleClose = () => setIsEditing(false)

  return isEditing ? (
    <ListTitleTextForm title={title} listId={listId} handleClose={handleClose} />
  ) : (
    <Text flex={1} size='sm' fw={500} onClick={handleTitleClick} {...attributes} {...listeners}>
      {title}
    </Text>
  )
}

export default ListTitleText
