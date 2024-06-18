import { Modal } from '@mantine/core'
import { useNavigate, useParams } from 'react-router-dom'
import { useBoardDataQuery } from 'store/slices/api/board-api-slice'

function CardDialog() {
  const navigate = useNavigate()

  const { boardId, cardId = '' } = useParams()
  const { card } = useBoardDataQuery(boardId ?? '', {
    selectFromResult: ({ data, isLoading, isUninitialized }) => {
      if (isLoading || isUninitialized) {
        return {}
      }

      for (const listId in data?.lists.entities) {
        const list = data.lists.entities[parseInt(listId)]
        if (list.cards.ids.includes(parseInt(cardId))) {
          return { card: list.cards.entities[parseInt(cardId)] }
        }
      }

      // If card from link doesn't exist return to board
      navigate(`/board/${boardId}`)
      return {}
    },
  })

  const handleClose = () => {
    navigate(`/board/${boardId}`)
  }
  return <Modal opened={true} onClose={handleClose} title={card?.title} centered></Modal>
}

export default CardDialog
