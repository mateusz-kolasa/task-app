import { Group, ScrollArea } from '@mantine/core'
import { useParams } from 'react-router-dom'
import { useBoardDataQuery } from '../../store/slices/api/board-api-slice'
import ListButton from './components/ListButton/ListButton'
import ListCard from './components/ListCard/ListCard'
import { APP_SHELL_MAIN_HEIGHT } from 'consts/style-consts'
import { sortAndMapToIds } from 'utils/queryHelper'

function Board() {
  const { boardId } = useParams()

  const { listIds = [] } = useBoardDataQuery(boardId ?? '', {
    selectFromResult: ({ data }) => {
      if (data) {
        const listIds = sortAndMapToIds(data.lists)
        return { listIds }
      }
      return {}
    },
  })

  return (
    <ScrollArea h={APP_SHELL_MAIN_HEIGHT}>
      <Group wrap='nowrap' align='flex-start' data-testid='board-group'>
        {listIds.map(listId => (
          <ListCard listId={listId} key={listId} />
        ))}
        <ListButton />
      </Group>
    </ScrollArea>
  )
}

export default Board
