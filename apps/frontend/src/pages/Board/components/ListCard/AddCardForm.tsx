import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Group, Stack } from '@mantine/core'
import { IconX } from '@tabler/icons-react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { TextInput } from 'react-hook-form-mantine'
import { useTranslation } from 'react-i18next'
import { notifications } from '@mantine/notifications'
import schema from './schema'
import { useCreateCardMutation } from 'store/slices/card-api-slice'

interface CardData {
  title: string
}

interface AddCardFormProps {
  listId: number
  handleCloseForm: () => void
}

function AddCardForm({ listId, handleCloseForm }: Readonly<AddCardFormProps>) {
  const { t } = useTranslation()

  const [createCard, { isLoading }] = useCreateCardMutation()

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
    },
  })

  const handleCloseClick = () => {
    methods.reset()
    handleCloseForm()
  }

  const handleSubmit: SubmitHandler<CardData> = cardData => {
    createCard({
      title: cardData.title,
      listId,
    })
      .unwrap()
      .then(() => {
        handleCloseClick()
      })
      .catch(() => {
        notifications.show({
          title: t('card.create.error.title'),
          message: t('card.create.error.message'),
          color: 'red',
        })
      })
  }

  return (
    <Stack gap='sm'>
      <FormProvider {...methods}>
        <TextInput name='title' placeholder={t('card.create.placeholder')} disabled={isLoading} />
        <Group wrap='nowrap'>
          <Button onClick={methods.handleSubmit(handleSubmit)}>{t('card.create.button')}</Button>
          <Button variant='subtle' p='xs' onClick={handleCloseClick} disabled={isLoading}>
            <IconX size={16} />
          </Button>
        </Group>
      </FormProvider>
    </Stack>
  )
}

export default AddCardForm
