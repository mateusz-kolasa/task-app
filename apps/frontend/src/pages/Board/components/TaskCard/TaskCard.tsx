import { Text, Card } from '@mantine/core'
import { useParams } from 'react-router-dom'
import { useBoardDataQuery } from 'store/slices/api/board-api-slice'

interface TaskCard {
  listId: number
  cardId: number
}

function TaskCard({ listId, cardId }: Readonly<TaskCard>) {
  const { boardId } = useParams()
  const { card } = useBoardDataQuery(boardId ?? '', {
    selectFromResult: ({ data }) => {
      const list = data?.lists.find(list => list.id === listId)
      const card = list?.cards.find(card => card.id === cardId)
      return { card }
    },
  })

  return (
    <Card radius={'md'} shadow='md' p='xs'>
      <Text size='sm'>{card?.title}</Text>
    </Card>
  )
}

export default TaskCard
