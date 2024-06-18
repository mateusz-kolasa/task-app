import { Text, Button } from '@mantine/core'
import { useNavigate, useParams } from 'react-router-dom'
import { useBoardDataQuery } from 'store/slices/api/board-api-slice'

interface TaskCard {
  listId: number
  cardId: number
}

function TaskCard({ listId, cardId }: Readonly<TaskCard>) {
  const { boardId } = useParams()
  const { card } = useBoardDataQuery(boardId ?? '', {
    selectFromResult: ({ data }) => {
      const list = data?.lists.entities[listId]
      const card = list?.cards.entities[cardId]
      return { card }
    },
  })

  const navigate = useNavigate()
  const handleCardClick = () => navigate(`card/${cardId}`)

  return (
    <Button variant='default' radius='md' p='xs' onClick={handleCardClick}>
      <Text size='sm'>{card?.title}</Text>
    </Button>
  )
}

export default TaskCard
