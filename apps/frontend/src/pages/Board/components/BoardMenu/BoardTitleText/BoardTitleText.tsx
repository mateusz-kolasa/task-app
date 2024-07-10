import { ActionIcon, Group, Text } from '@mantine/core'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useBoardDataQuery } from 'store/slices/api/board-api-slice'
import BoardTitleTextForm from './BoardTitleTextForm'
import useIsAuthorized from 'hooks/useIsAuthorized'
import { BOARD_PERMISSIONS } from 'shared-consts'
import { IconX } from '@tabler/icons-react'

interface BoardTitleTextProps {
  toggleMenu: () => void
}

function BoardTitleText({ toggleMenu }: Readonly<BoardTitleTextProps>) {
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

  return (
    <Group style={{ alignItems: 'flex-start' }}>
      {isEditing ? (
        <BoardTitleTextForm title={title} handleClose={handleClose} />
      ) : (
        <Text ta='center' fw='bold' size='lg' flex={1} ml='md' onClick={handleTitleClick}>
          {title}
        </Text>
      )}
      <ActionIcon variant='subtle' mr='md' onClick={toggleMenu}>
        <IconX />
      </ActionIcon>
    </Group>
  )
}

export default BoardTitleText
