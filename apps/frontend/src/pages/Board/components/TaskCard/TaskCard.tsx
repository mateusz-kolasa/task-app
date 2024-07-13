import { Text, Card } from '@mantine/core'
import { useNavigate, useParams } from 'react-router-dom'
import { useBoardDataQuery } from 'store/slices/api/board-api-slice'
import classes from './TaskCard.module.css'
import { CARD_TEXT_WIDTH } from 'consts/style-consts'
import { DraggableAttributes } from '@dnd-kit/core'
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import { memo, useRef } from 'react'

interface TaskCard {
  listId: number
  cardId: number
  attributes?: DraggableAttributes
  listeners?: SyntheticListenerMap
}

const TaskCard = memo(({ listId, cardId, attributes, listeners }: Readonly<TaskCard>) => {
  const { boardId } = useParams()

  const previousTitle = useRef('')
  const { title = '' } = useBoardDataQuery(boardId ?? '', {
    selectFromResult: ({ data }) => {
      const list = data?.lists.entities[listId]
      const card = list?.cards.entities[cardId]

      // Keep previous value for DragOverlay in case of switching lists, to keep the title for drag end animation
      if (!card) {
        return { title: previousTitle.current }
      }

      previousTitle.current = card?.title ?? ''
      return { title: card?.title }
    },
  })

  const navigate = useNavigate()
  const handleCardClick = () => navigate(`card/${cardId}`)

  return (
    <Card
      className={classes.card}
      radius='md'
      p='xs'
      mb='md'
      withBorder
      shadow='sm'
      onClick={handleCardClick}
    >
      <Text w={CARD_TEXT_WIDTH} truncate size='sm' {...listeners} {...attributes}>
        {title}
      </Text>
    </Card>
  )
})

export default TaskCard
