import { Button } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import ConfirmationDialog from 'components/ConfirmationDialog/ConfirmationDialog'
import { BOARD_PERMISSIONS } from 'shared-consts'
import useIsAuthorized from 'hooks/useIsAuthorized'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { useDeleteBoardMutation, useLeaveBoardMutation } from 'store/slices/api/board-api-slice'

function LeaveBoard() {
  const { boardId = '' } = useParams()
  const { t } = useTranslation()
  const [isOpen, { close, open }] = useDisclosure()

  const isAuthorized = useIsAuthorized()
  const isOwner = isAuthorized(BOARD_PERMISSIONS.owner)

  const [deleteBoard] = useDeleteBoardMutation()
  const [leaveBoard] = useLeaveBoardMutation()

  const navigate = useNavigate()

  const handleConfirm = useCallback(() => {
    const action = isOwner ? deleteBoard : leaveBoard
    action(boardId)
      .then(() => {
        close()
        navigate('/dashboard')
      })
      .catch(() => {
        notifications.show({
          title: t('board.leave.error.title'),
          message: t('error.general.message'),
          color: 'red',
        })
      })
  }, [boardId, close, deleteBoard, isOwner, leaveBoard, navigate, t])

  return (
    <>
      <Button color='red' mt='auto' mb='md' radius='md' mx='md' onClick={open}>
        {isOwner ? t('board.delete.button') : t('board.leave.button')}
      </Button>
      <ConfirmationDialog
        title={isOwner ? t('board.delete.confirmation.text') : t('board.leave.confirmation.text')}
        isOpen={isOpen}
        confirm={handleConfirm}
        close={close}
      />
    </>
  )
}

export default LeaveBoard
