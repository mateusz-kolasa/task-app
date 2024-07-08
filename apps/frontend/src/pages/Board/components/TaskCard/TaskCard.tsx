import { Draggable } from '@hello-pangea/dnd'
import { Text, Card } from '@mantine/core'
import { useNavigate, useParams } from 'react-router-dom'
import { useBoardDataQuery } from 'store/slices/api/board-api-slice'
import classes from './TaskCard.module.css'
import { BOARD_PERMISSIONS } from 'shared-consts'
import useIsAuthorized from 'hooks/useIsAuthorized'
import { CARD_TEXT_WIDTH } from 'consts/style-consts'

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

  const isAuthorized = useIsAuthorized()

  return (
    <Draggable
      draggableId={`card_${cardId}`}
      index={card?.position ?? 0}
      isDragDisabled={!isAuthorized(BOARD_PERMISSIONS.edit)}
    >
      {provided => (
        <Card
          className={classes.card}
          radius='md'
          p='xs'
          withBorder
          shadow='sm'
          onClick={handleCardClick}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
          <Text w={CARD_TEXT_WIDTH} truncate size='sm'>
            {card?.title}
          </Text>
        </Card>
      )}
    </Draggable>
  )
}

export default TaskCard
