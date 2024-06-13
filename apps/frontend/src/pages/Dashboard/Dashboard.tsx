import { Center, SimpleGrid } from '@mantine/core'
import CreateBoardCard from './components/CreateBoardCard'
import { useUserBoardsQuery } from '../../store/slices/api/board-api-slice'
import BoardCard from './components/BoardCard'

function Dashboard() {
  const { data: boards = [] } = useUserBoardsQuery()

  return (
    <Center>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} data-testid='dashboard-grid'>
        {boards.map(board => (
          <BoardCard board={board} key={board.id} />
        ))}
        <CreateBoardCard />
      </SimpleGrid>
    </Center>
  )
}

export default Dashboard
