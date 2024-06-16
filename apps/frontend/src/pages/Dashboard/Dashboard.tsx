import { Center, ScrollArea, SimpleGrid, Stack, Text } from '@mantine/core'
import CreateBoardCard from './components/CreateBoardCard/CreateBoardCard'
import { useUserBoardsQuery } from '../../store/slices/api/board-api-slice'
import BoardCard from './components/BoardCard/BoardCard'
import { useTranslation } from 'react-i18next'
import { APP_SHELL_MAIN_HEIGHT } from 'consts/style-consts'
import BaseLayout from 'components/BaseLayout/BaseLayout'

function Dashboard() {
  const { t } = useTranslation()
  const { data: boards = [] } = useUserBoardsQuery()

  return (
    <BaseLayout>
      <ScrollArea h={APP_SHELL_MAIN_HEIGHT}>
        <Center mt='lg'>
          <Stack>
            <Text size='lg' ta='center' fw='bold'>
              {t('dashboard.boards.title')}
            </Text>
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} data-testid='dashboard-grid'>
              {boards.map(board => (
                <BoardCard board={board} key={board.id} />
              ))}
              <CreateBoardCard />
            </SimpleGrid>
          </Stack>
        </Center>
      </ScrollArea>
    </BaseLayout>
  )
}

export default Dashboard
