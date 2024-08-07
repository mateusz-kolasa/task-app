import { Button } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LIST_WIDTH } from 'consts/style-consts'
import AddListButtonForm from './AddListButtonForm'
import useIsAuthorized from 'hooks/useIsAuthorized'
import { BOARD_PERMISSIONS } from 'shared-consts'

function AddListButton() {
  const { t } = useTranslation()

  const [isOpened, setIsOpened] = useState(false)

  const handleOpenClick = () => setIsOpened(true)
  const handleCloseForm = useCallback(() => {
    setIsOpened(false)
  }, [])

  const isAuthorized = useIsAuthorized()

  if (!isAuthorized(BOARD_PERMISSIONS.edit)) {
    return null
  }

  return (
    <>
      {isOpened ? (
        <AddListButtonForm handleCloseForm={handleCloseForm} />
      ) : (
        <Button
          leftSection={<IconPlus size={12} />}
          variant='light'
          ta='left'
          radius='md'
          onClick={handleOpenClick}
          w={LIST_WIDTH}
        >
          {t('list.create.new')}
        </Button>
      )}
    </>
  )
}

export default AddListButton
