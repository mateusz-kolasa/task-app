import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { notifications } from '@mantine/notifications'
import { useAssignCardUserMutation } from 'store/slices/api/card-api-slice'
import { Select } from '@mantine/core'
import { useBoardDataQuery } from 'store/slices/api/board-api-slice'

interface CardUserSelectProps {
  listId: number
  userId: number | null
  handleClose: () => void
}

function CardUserSelect({ listId, userId, handleClose }: Readonly<CardUserSelectProps>) {
  const { boardId = '', cardId = '' } = useParams()
  const { t } = useTranslation()

  const { users = [] } = useBoardDataQuery(boardId ?? '', {
    selectFromResult: ({ data }) => {
      const users = Object.values(data?.users.entities ?? {}).map(user => ({
        value: user.userId.toString(),
        label: user.user.username,
      }))

      return { users }
    },
  })

  const [assignCardUser] = useAssignCardUserMutation()

  const handleChange = (id: string | null) => {
    const newUserId = id === null ? id : parseInt(id)

    if (newUserId !== userId) {
      assignCardUser({
        userId: newUserId,
        boardId: boardId,
        listId,
        cardId: parseInt(cardId),
      })
        .unwrap()
        .catch(() => {
          notifications.show({
            title: t('card.user.error.title'),
            message: t('error.general.message'),
            color: 'red',
          })
        })
    }

    handleClose()
  }

  return (
    <Select
      data={users}
      value={userId === null ? userId : userId.toString()}
      placeholder={t('card.user.placeholder')}
      onChange={handleChange}
      onBlur={handleClose}
      autoFocus
      clearable
      searchable
      allowDeselect={false}
    />
  )
}

export default CardUserSelect
