import { Text } from '@mantine/core'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useBoardDataQuery } from 'store/slices/api/board-api-slice'
import BoardTitleTextForm from './BoardTitleTextForm'
import useIsAuthorized from 'hooks/useIsAuthorized'
import { BOARD_PERMISSIONS } from 'consts/user-permissions'

function BoardTitleText() {
  const { boardId } = useParams()
  const { title = '' } = useBoardDataQuery(boardId ?? '', {
    selectFromResult: ({ data }) => {
      return { title: data?.title }
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
    <BoardTitleTextForm title={title} handleClose={handleClose} />
  ) : (
    <Text ta='center' fw='bold' size='lg' onClick={handleTitleClick}>
      {title}
    </Text>
  )
}

export default BoardTitleText
