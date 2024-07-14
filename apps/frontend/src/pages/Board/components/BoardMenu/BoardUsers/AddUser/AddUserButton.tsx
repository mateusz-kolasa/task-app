import { Button } from '@mantine/core'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import AddUserForm from './AddUserForm'
import useIsAuthorized from 'hooks/useIsAuthorized'
import { BOARD_PERMISSIONS } from 'shared-consts'

function AddUserButton() {
  const { t } = useTranslation()

  const [isOpened, setIsOpened] = useState(false)

  const handleOpenClick = () => setIsOpened(true)
  const handleCloseForm = useCallback(() => {
    setIsOpened(false)
  }, [])

  const isAuthorized = useIsAuthorized()
  if (!isAuthorized(BOARD_PERMISSIONS.admin)) {
    return null
  }

  return (
    <>
      {isOpened ? (
        <AddUserForm handleCloseForm={handleCloseForm} />
      ) : (
        <Button radius='md' mt='auto' onClick={handleOpenClick}>
          {t('board.users.add.button')}
        </Button>
      )}
    </>
  )
}

export default AddUserButton
