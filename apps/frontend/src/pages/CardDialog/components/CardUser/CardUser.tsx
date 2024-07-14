import { Text } from '@mantine/core'
import { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useBoardDataQuery } from 'store/slices/api/board-api-slice'
import useIsAuthorized from 'hooks/useIsAuthorized'
import { useTranslation } from 'react-i18next'
import { BOARD_PERMISSIONS } from 'shared-consts'
import CardUserSelect from './CardUserSelect'

interface CardUserProps {
  listId: number
}

function CardUser({ listId }: Readonly<CardUserProps>) {
  const { boardId = '', cardId = '' } = useParams()
  const { userId = null, username = '' } = useBoardDataQuery(boardId ?? '', {
    selectFromResult: ({ data }) => {
      const userId = data?.lists.entities[listId].cards.entities[parseInt(cardId)].userId

      let username = ''
      if (userId) {
        username = data?.users.entities[userId].user.username
      }

      return { userId, username }
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
  const handleClose = useCallback(() => setIsEditing(false), [])

  return (
    <>
      <Text fw='bold' mt='md'>
        {t('card.user.label')}
      </Text>
      {isEditing ? (
        <CardUserSelect listId={listId} userId={userId} handleClose={handleClose} />
      ) : (
        <Text onClick={handleTitleClick} fs={userId ? 'normal' : 'italic'}>
          {!userId ? t('card.user.none.label') : username}
        </Text>
      )}
    </>
  )
}

export default CardUser
