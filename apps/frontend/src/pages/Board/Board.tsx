import { Group, ScrollArea } from '@mantine/core'
import { useParams } from 'react-router-dom'
import { useBoardDataQuery } from '../../store/slices/board-api-slice'
import ListButton from './components/ListButton/ListButton'
import ListCard from './components/ListCard/ListCard'
import { APP_SHELL_MAIN_HEIGHT } from 'consts/style-consts'

function Board() {
  const { boardId } = useParams()
  const { data: board } = useBoardDataQuery(boardId ?? '')

  return (
    <ScrollArea h={APP_SHELL_MAIN_HEIGHT}>
      <Group wrap='nowrap' align='flex-start' data-testid='board-group'>
        {board?.lists.map(list => <ListCard list={list} key={list.id} />)}
        <ListButton />
      </Group>
    </ScrollArea>
  )
}

export default Board
