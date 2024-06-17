import { Button } from '@mantine/core'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import AddUserForm from './AddUserForm'

function AddUserButton() {
  const { t } = useTranslation()

  const [isOpened, setIsOpened] = useState(false)

  const handleOpenClick = () => setIsOpened(true)
  const handleCloseForm = useCallback(() => {
    setIsOpened(false)
  }, [])

  return (
    <>
      {isOpened ? (
        <AddUserForm handleCloseForm={handleCloseForm} />
      ) : (
        <Button radius='md' m='md' onClick={handleOpenClick}>
          {t('board.users.add.button')}
        </Button>
      )}
    </>
  )
}

export default AddUserButton
