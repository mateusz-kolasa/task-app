import { zodResolver } from '@hookform/resolvers/zod'
import { useParams } from 'react-router-dom'
import schema from './schema'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { Textarea } from 'react-hook-form-mantine'
import { useChangeListTitleMutation } from 'store/slices/api/list-api-slice'
import { useTranslation } from 'react-i18next'
import { notifications } from '@mantine/notifications'
import { selectOnFocus } from 'utils/formHelper'

interface ListTitleTextFormProps {
  title: string
  listId: number
  handleClose: () => void
}

interface TitleData {
  title: string
}

function ListTitleTextForm({ title, listId, handleClose }: Readonly<ListTitleTextFormProps>) {
  const { boardId = '' } = useParams()

  const { t } = useTranslation()

  const methods = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      title: title,
    },
  })

  const [changeListTitle] = useChangeListTitleMutation()

  const handleSubmit: SubmitHandler<TitleData> = titleData => {
    // If tile is empty or unchanged, keep old one
    if (titleData.title.trim() !== '' && titleData.title !== title) {
      changeListTitle({
        title: titleData.title,
        boardId: boardId,
        listId: listId,
      })
        .unwrap()
        .catch(() => {
          notifications.show({
            title: t('list.title.error.title'),
            message: t('error.general.message'),
            color: 'red',
          })
        })
    }
    handleClose()
  }

  return (
    <FormProvider {...methods}>
      <Textarea
        name='title'
        control={methods.control}
        onFocus={selectOnFocus}
        autoFocus
        minRows={1}
        autosize
        onBlur={methods.handleSubmit(handleSubmit)}
      />
    </FormProvider>
  )
}

export default ListTitleTextForm
