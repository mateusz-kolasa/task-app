import { zodResolver } from '@hookform/resolvers/zod'
import { useParams } from 'react-router-dom'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { Textarea } from 'react-hook-form-mantine'
import { useChangeListTitleMutation } from 'store/slices/api/list-api-slice'
import { useTranslation } from 'react-i18next'
import { notifications } from '@mantine/notifications'
import { handleKeyDown, selectOnFocus } from 'utils/formHelper'
import useSchema from './useSchema'
import { MAX_LIST_TITLE_LENGTH } from 'shared-consts'

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

  const schema = useSchema()
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
        flex={1}
        name='title'
        control={methods.control}
        onFocus={selectOnFocus}
        autoFocus
        minRows={1}
        autosize
        onBlur={methods.handleSubmit(handleSubmit)}
        maxLength={MAX_LIST_TITLE_LENGTH}
        onKeyDown={handleKeyDown(methods.handleSubmit(handleSubmit), handleClose)}
      />
    </FormProvider>
  )
}

export default ListTitleTextForm
