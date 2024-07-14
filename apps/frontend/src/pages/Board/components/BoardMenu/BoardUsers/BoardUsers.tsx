import { ActionIcon, Grid, Group, ScrollArea, Stack, Text, Transition } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { useBoardDataQuery } from 'store/slices/api/board-api-slice'
import AddUserButton from './AddUser/AddUserButton'
import { IconChevronLeft, IconX } from '@tabler/icons-react'
import BoardUserCard from './BoardUserCard'
import { APP_SHELL_MAIN_HEIGHT } from 'consts/style-consts'

interface BoardUsersProps {
  toggleMenu: () => void
  isInUsersSection: boolean
  setIsInUsersSection: (a: boolean) => void
}

function BoardUsers({
  toggleMenu,
  isInUsersSection,
  setIsInUsersSection,
}: Readonly<BoardUsersProps>) {
  const { boardId } = useParams()

  const { users } = useBoardDataQuery(boardId ?? '', {
    selectFromResult: ({ data }) => {
      return { users: data?.users }
    },
  })

  const { t } = useTranslation()

  const handleCloseUsersSection = () => setIsInUsersSection(false)

  return (
    <Transition
      mounted={isInUsersSection}
      transition={'slide-left'}
      duration={150}
      timingFunction='ease'
    >
      {styles => (
        <Stack style={styles} p='md' mih={APP_SHELL_MAIN_HEIGHT}>
          <Group justify='space-between'>
            <ActionIcon variant='subtle' onClick={handleCloseUsersSection}>
              <IconChevronLeft />
            </ActionIcon>
            <Text ta='center' size='lg' fw='bold'>
              {t('board.users.list.title')}
            </Text>
            <ActionIcon variant='subtle' onClick={toggleMenu}>
              <IconX />
            </ActionIcon>
          </Group>
          <ScrollArea scrollbars='y' type='auto' flex={1} w='100%'>
            <Grid h='100%'>
              {users?.ids.map(userId => <BoardUserCard userId={userId} key={userId} />)}
            </Grid>
          </ScrollArea>
          <AddUserButton />
        </Stack>
      )}
    </Transition>
  )
}

export default BoardUsers
