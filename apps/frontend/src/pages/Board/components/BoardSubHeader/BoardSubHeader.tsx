import { ActionIcon, Divider, Group, Text } from '@mantine/core'
import { IconMenu2 } from '@tabler/icons-react'
import { useParams } from 'react-router-dom'
import { useBoardDataQuery } from 'store/slices/api/board-api-slice'

interface BoardSubHeaderProps {
  isMenuOpened: boolean
  toggleMenu: () => void
}

function BoardSubHeader({ isMenuOpened, toggleMenu }: Readonly<BoardSubHeaderProps>) {
  const { boardId } = useParams()

  const { title = '' } = useBoardDataQuery(boardId ?? '', {
    selectFromResult: ({ data }) => {
      return { title: data?.title }
    },
  })

  return (
    <>
      <Group h='40' mt='-md' justify='space-between'>
        <Text fw='bold' flex={1} truncate>
          {title}
        </Text>
        {!isMenuOpened && (
          <ActionIcon mr='md' variant='subtle' onClick={toggleMenu}>
            <IconMenu2 />
          </ActionIcon>
        )}
      </Group>
      <Divider mb='md' mx='-md' />
    </>
  )
}

export default BoardSubHeader
