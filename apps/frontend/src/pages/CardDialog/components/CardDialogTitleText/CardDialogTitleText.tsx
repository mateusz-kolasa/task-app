import { Text } from '@mantine/core'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useBoardDataQuery } from 'store/slices/api/board-api-slice'
import useIsAuthorized from 'hooks/useIsAuthorized'
import { BOARD_PERMISSIONS } from 'shared-consts'
import CardDialogTitleTextForm from './CardDialogTitleTextForm'

interface CardDialogTitleTextProps {
  listId: number
}

function CardDialogTitleText({ listId }: Readonly<CardDialogTitleTextProps>) {
  const { boardId = '', cardId = '' } = useParams()
  const { title = '' } = useBoardDataQuery(boardId ?? '', {
    selectFromResult: ({ data }) => {
      const card = data?.lists.entities[listId].cards.entities[parseInt(cardId)]
      return { title: card?.title }
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
    <CardDialogTitleTextForm title={title} listId={listId} handleClose={handleClose} />
  ) : (
    <Text size='sm' style={{ wordBreak: 'break-all' }} onClick={handleTitleClick}>
      {title}
    </Text>
  )
}

export default CardDialogTitleText
