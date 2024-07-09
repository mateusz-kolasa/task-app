import { Text } from '@mantine/core'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useBoardDataQuery } from 'store/slices/api/board-api-slice'
import useIsAuthorized from 'hooks/useIsAuthorized'
import CardDescriptionTextForm from './CardDescriptionTextForm'
import { useTranslation } from 'react-i18next'
import { BOARD_PERMISSIONS } from 'shared-consts'

interface CardDescriptionTextProps {
  listId: number
}

function CardDescriptionText({ listId }: CardDescriptionTextProps) {
  const { boardId = '', cardId = '' } = useParams()
  const { description = '' } = useBoardDataQuery(boardId ?? '', {
    selectFromResult: ({ data }) => {
      const card = data?.lists.entities[listId].cards.entities[parseInt(cardId)]
      return { description: card?.description }
    },
  })

  const { t } = useTranslation()

  const isAuthorized = useIsAuthorized()

  const [isEditing, setIsEditing] = useState(false)

  const handleTitleClick = () => {
    if (isAuthorized(BOARD_PERMISSIONS.edit)) {
      setIsEditing(true)
    }
  }
  const handleClose = () => setIsEditing(false)

  return (
    <>
      <Text fw='bold'>{t('card.description.label')}</Text>
      {isEditing ? (
        <CardDescriptionTextForm
          listId={listId}
          description={description ?? ''}
          handleClose={handleClose}
        />
      ) : (
        <Text onClick={handleTitleClick} fs={description ? 'normal' : 'italic'}>
          {!description ? t('card.description.empty.text') : description}
        </Text>
      )}
    </>
  )
}

export default CardDescriptionText
