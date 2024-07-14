import { Group, Modal } from '@mantine/core'
import { useNavigate, useParams } from 'react-router-dom'
import { useBoardDataQuery } from 'store/slices/api/board-api-slice'
import CardDialogTitleText from './components/CardDialogTitleText/CardDialogTitleText'
import CardDeleteButton from './components/CardDeleteButton/CardDeleteButton'
import CardDescriptionText from './components/CardDescriptionText/CardDescriptionText'
import CardUser from './components/CardUser/CardUser'

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
  return (
    <Modal
      opened={true}
      onClose={handleClose}
      centered
      title={card && <CardDialogTitleText listId={card?.listId} />}
      styles={{
        header: {
          alignItems: 'flex-start',
        },
        title: {
          flex: 1,
        },
      }}
    >
      {card && (
        <>
          <CardDescriptionText listId={card.listId} />
          <CardUser listId={card.listId} />
          <Group justify='flex-end' mt='md'>
            <CardDeleteButton listId={card.listId} />
          </Group>
        </>
      )}
    </Modal>
  )
}

export default CardDialog
