import { Center, SimpleGrid } from '@mantine/core'
import BoardCard from './components/BoardCard'
import CreateBoardCard from './components/CreateBoardCard'
import { useUserBoardsQuery } from '../../store/slices/board-api-slice'

function Dashboard() {
  const { data: boards = [] } = useUserBoardsQuery()

  return (
    <Center>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        {boards.map(board => (
          <BoardCard title={board.title} key={board.title} />
        ))}
        <CreateBoardCard />
      </SimpleGrid>
    </Center>
  )
}

export default Dashboard
