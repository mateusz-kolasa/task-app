import { ScrollArea, Stack, Text } from '@mantine/core'
import ListCardBase from 'components/ListCardBase/ListCardBase'
import TaskCard from '../TaskCard/TaskCard'
import AddCardButton from './AddCardButton'
import { useParams } from 'react-router-dom'
import { useBoardDataQuery } from 'store/slices/api/board-api-slice'
import { sortAndMapToIds } from 'utils/queryHelper'

interface ListCardProps {
  listId: number
}

function ListCard({ listId }: Readonly<ListCardProps>) {
  const { boardId } = useParams()
  const { title, cardIds } = useBoardDataQuery(boardId ?? '', {
    selectFromResult: ({ data }) => {
      const list = data?.lists.find(list => list.id === listId)
      const cardIds = sortAndMapToIds(list?.cards || [])
      return { title: list?.title, cardIds }
    },
  })

  return (
    <ListCardBase>
      <Text size='sm' fw={500}>
        {title}
      </Text>

      <ScrollArea.Autosize scrollbars='y' type='auto' mt='md' mb='md' flex={1}>
        <Stack data-testid='list-stack'>
          {cardIds.map(cardId => (
            <TaskCard listId={listId} cardId={cardId} key={cardId} />
          ))}
        </Stack>
      </ScrollArea.Autosize>
      <AddCardButton listId={listId} />
    </ListCardBase>
  )
}

export default ListCard
