import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Group, Stack } from '@mantine/core'
import { IconX } from '@tabler/icons-react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { TextInput } from 'react-hook-form-mantine'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCreateListMutation } from 'store/slices/api/list-api-slice'
import { notifications } from '@mantine/notifications'
import ListCardBase from 'components/ListCardBase/ListCardBase'
import useSchema from './useSchema'
import { MAX_LIST_TITLE_LENGTH } from 'shared-consts'
import { handleKeyDown } from 'utils/formHelper'

interface ListData {
  title: string
}

interface AddListButtonFormProps {
  handleCloseForm: () => void
}

function AddListButtonForm({ handleCloseForm }: Readonly<AddListButtonFormProps>) {
  const { boardId = '' } = useParams()
  const { t } = useTranslation()

  const [createList, { isLoading }] = useCreateListMutation()

  const schema = useSchema()
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

  const handleSubmit: SubmitHandler<ListData> = listData => {
    createList({
      title: listData.title,
      boardId: parseInt(boardId),
    })
      .unwrap()
      .then(() => {
        handleCloseClick()
      })
      .catch(() => {
        notifications.show({
          title: t('list.create.error.title'),
          message: t('list.create.error.message'),
          color: 'red',
        })
      })
  }

  return (
    <ListCardBase handleOutsideClick={handleCloseClick}>
      <Stack gap='sm'>
        <FormProvider {...methods}>
          <TextInput
            name='title'
            placeholder={t('list.create.placeholder')}
            disabled={isLoading}
            maxLength={MAX_LIST_TITLE_LENGTH}
            onKeyDown={handleKeyDown(methods.handleSubmit(handleSubmit), handleCloseClick)}
            autoFocus
          />
          <Group>
            <Button onClick={methods.handleSubmit(handleSubmit)}>{t('list.create.button')}</Button>
            <Button variant='subtle' p='xs' onClick={handleCloseClick} disabled={isLoading}>
              <IconX size={16} />
            </Button>
          </Group>
        </FormProvider>
      </Stack>
    </ListCardBase>
  )
}

export default AddListButtonForm
