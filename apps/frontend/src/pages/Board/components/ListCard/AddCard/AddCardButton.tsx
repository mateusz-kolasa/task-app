import { Button } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import AddCardForm from './AddCardForm'
import { BOARD_PERMISSIONS } from 'shared-consts'
import useIsAuthorized from 'hooks/useIsAuthorized'

interface AddCardButtonProps {
  listId: number
}

function AddCardButton({ listId }: Readonly<AddCardButtonProps>) {
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
        <AddCardForm listId={listId} handleCloseForm={handleCloseForm} />
      ) : (
        <Button
          leftSection={<IconPlus size={12} />}
          variant='subtle'
          justify='left'
          radius='md'
          onClick={handleOpenClick}
        >
          {t('card.create.new')}
        </Button>
      )}
    </>
  )
}

export default AddCardButton
