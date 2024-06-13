import { Stack, Text } from '@mantine/core'
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
      <Text>{title}</Text>
      <Stack data-testid='list-stack' mt='md'>
        {cardIds.map(cardId => (
          <TaskCard listId={listId} cardId={cardId} key={cardId} />
        ))}
        <AddCardButton listId={listId} />
      </Stack>
    </ListCardBase>
  )
}

export default ListCard
