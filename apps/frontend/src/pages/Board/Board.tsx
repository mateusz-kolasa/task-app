import { Group } from '@mantine/core'
import { useParams } from 'react-router-dom'
import { useBoardDataQuery } from '../../store/slices/board-api-slice'
import ListButton from './components/ListButton/ListButton'
import ListCard from './components/ListCard/ListCard'

function Board() {
  const { boardId } = useParams()
  const { data: board } = useBoardDataQuery(boardId ?? '')

  return (
    <Group>
      {board?.lists.map(list => <ListCard list={list} key={list.id} />)}
      <ListButton />
    </Group>
  )
}

export default Board
