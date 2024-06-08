import { Text, Card } from '@mantine/core'
import { CardData } from 'shared-types'

interface TaskCard {
  card: CardData
}

function TaskCard({ card }: Readonly<TaskCard>) {
  return (
    <Card radius={'md'} shadow='md' p='xs'>
      <Text size='sm'>{card.title}</Text>
    </Card>
  )
}

export default TaskCard
