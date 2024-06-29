import { ActionIcon } from '@mantine/core'
import { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import useIsAuthorized from 'hooks/useIsAuthorized'
import { BOARD_PERMISSIONS } from 'consts/user-permissions'
import { IconTrash } from '@tabler/icons-react'
import { useDisclosure } from '@mantine/hooks'
import { useTranslation } from 'react-i18next'
import ConfirmationDialog from 'components/ConfirmationDialog/ConfirmationDialog'
import { useDeleteListMutation } from 'store/slices/api/list-api-slice'
import { notifications } from '@mantine/notifications'

interface ListDeleteButtonProps {
  listId: number
}

function ListDeleteButton({ listId }: Readonly<ListDeleteButtonProps>) {
  const { t } = useTranslation()

  const { boardId = '' } = useParams()
  const isAuthorized = useIsAuthorized()
  const [isOpen, { close, open }] = useDisclosure()

  const [deleteList] = useDeleteListMutation()

  const handleConfirm = useCallback(() => {
    deleteList({
      listId,
      boardId,
    })
      .unwrap()
      .then(() => {
        close()
      })
      .catch(() => {
        notifications.show({
          title: t('list.delete.error.title'),
          message: t('error.general.message'),
          color: 'red',
        })
      })
  }, [boardId, close, deleteList, listId, t])

  if (!isAuthorized(BOARD_PERMISSIONS.edit)) {
    return null
  }

  return (
    <>
      <ActionIcon variant='subtle' color='red' onClick={open}>
        <IconTrash />
      </ActionIcon>
      <ConfirmationDialog
        title={t('list.delete.confirmation.text')}
        isOpen={isOpen}
        confirm={handleConfirm}
        close={close}
      />
    </>
  )
}

export default ListDeleteButton
