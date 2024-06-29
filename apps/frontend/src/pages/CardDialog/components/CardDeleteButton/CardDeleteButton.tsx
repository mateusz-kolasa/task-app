import { ActionIcon } from '@mantine/core'
import { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import useIsAuthorized from 'hooks/useIsAuthorized'
import { BOARD_PERMISSIONS } from 'consts/user-permissions'
import { IconTrash } from '@tabler/icons-react'
import { useDisclosure } from '@mantine/hooks'
import { useTranslation } from 'react-i18next'
import ConfirmationDialog from 'components/ConfirmationDialog/ConfirmationDialog'
import { notifications } from '@mantine/notifications'
import { useDeleteCardMutation } from 'store/slices/api/card-api-slice'

interface CardDeleteButtonProps {
  listId: number
}

function CardDeleteButton({ listId }: Readonly<CardDeleteButtonProps>) {
  const { t } = useTranslation()

  const { boardId = '', cardId = '' } = useParams()
  const isAuthorized = useIsAuthorized()
  const [isOpen, { close, open }] = useDisclosure()

  const [deleteCard] = useDeleteCardMutation()

  const handleConfirm = useCallback(() => {
    deleteCard({
      cardId: parseInt(cardId),
      listId,
      boardId,
    })
      .unwrap()
      .then(() => {
        close()
      })
      .catch(() => {
        notifications.show({
          title: t('card.delete.error.title'),
          message: t('error.general.message'),
          color: 'red',
        })
      })
  }, [boardId, cardId, close, deleteCard, listId, t])

  if (!isAuthorized(BOARD_PERMISSIONS.edit)) {
    return null
  }

  return (
    <>
      <ActionIcon variant='subtle' color='red' onClick={open}>
        <IconTrash />
      </ActionIcon>
      <ConfirmationDialog
        title={t('card.delete.confirmation.text')}
        isOpen={isOpen}
        confirm={handleConfirm}
        close={close}
      />
    </>
  )
}

export default CardDeleteButton
