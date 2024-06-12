import { Stack, Text } from '@mantine/core'
import ListCardBase from 'components/ListCardBase/ListCardBase'
import { ListFullData } from 'shared-types'
import TaskCard from '../TaskCard/TaskCard'
import AddCardButton from './AddCardButton'

interface ListCardProps {
  list: ListFullData
}

function ListCard({ list }: Readonly<ListCardProps>) {
  return (
    <ListCardBase>
      <Text>{list.title}</Text>
      <Stack data-testid='list-stack' mt='md'>
        {list.cards.map(card => (
          <TaskCard card={card} key={card.id} />
        ))}
        <AddCardButton listId={list.id} />
      </Stack>
    </ListCardBase>
  )
}

export default ListCard
