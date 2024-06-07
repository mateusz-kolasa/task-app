import { Button } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LIST_WIDTH } from 'consts/style-consts'
import ListButtonForm from './ListButtonForm'

function ListButton() {
  const { t } = useTranslation()

  const [isOpened, setIsOpened] = useState(false)

  const handleOpenClick = () => setIsOpened(true)
  const handleCloseForm = useCallback(() => {
    setIsOpened(false)
  }, [])

  return (
    <>
      {isOpened ? (
        <ListButtonForm handleCloseForm={handleCloseForm} />
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

export default ListButton
