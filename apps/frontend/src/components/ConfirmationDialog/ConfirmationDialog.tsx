import { Button, Group, Modal, Text } from '@mantine/core'
import { useTranslation } from 'react-i18next'

interface ConfirmationDialogProps {
  title: string
  isOpen: boolean
  confirm: () => void
  close: () => void
}

function ConfirmationDialog({ title, isOpen, confirm, close }: Readonly<ConfirmationDialogProps>) {
  const { t } = useTranslation()

  return (
    <Modal opened={isOpen} onClose={close} withCloseButton={false} size='xs'>
      <Text>{title}</Text>
      <Group mt='md' justify='space-between'>
        <Button onClick={confirm}>{t('button.confirm')}</Button>
        <Button variant='outline' onClick={close}>
          {t('button.cancel')}
        </Button>
      </Group>
    </Modal>
  )
}

export default ConfirmationDialog
