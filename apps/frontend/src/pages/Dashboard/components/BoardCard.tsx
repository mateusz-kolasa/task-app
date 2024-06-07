import { Text, UnstyledButton } from '@mantine/core'
import classes from './Card.module.css'
import { useNavigate } from 'react-router-dom'
import { BoardData } from 'shared-types'

interface BoardProps {
  board: BoardData
}

function BoardCard({ board }: Readonly<BoardProps>) {
  const navigate = useNavigate()

  const handleClick = () => navigate(`/board/${board.id}`)

  return (
    <UnstyledButton className={classes.card} onClick={handleClick}>
      <Text>{board.title}</Text>
    </UnstyledButton>
  )
}

export default BoardCard
