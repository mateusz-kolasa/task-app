import { zodResolver } from '@hookform/resolvers/zod'
import { useParams } from 'react-router-dom'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { Textarea } from 'react-hook-form-mantine'
import { useTranslation } from 'react-i18next'
import { notifications } from '@mantine/notifications'
import { selectOnFocus } from 'utils/formHelper'
import { useChangeBoardTitleMutation } from 'store/slices/api/board-api-slice'
import useSchema from './useSchema'
import { MAX_BOARD_TITLE_LENGTH } from 'shared-consts'

interface BoardTitleTextFormProps {
  title: string
  handleClose: () => void
}

interface TitleData {
  title: string
}

function BoardTitleTextForm({ title, handleClose }: Readonly<BoardTitleTextFormProps>) {
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

  const [changeBoardTitle] = useChangeBoardTitleMutation()

  const handleSubmit: SubmitHandler<TitleData> = titleData => {
    // If tile is empty or unchanged, keep old one
    if (titleData.title.trim() !== '' && titleData.title !== title) {
      changeBoardTitle({
        title: titleData.title,
        boardId: parseInt(boardId),
      })
        .unwrap()
        .catch(() => {
          notifications.show({
            title: t('board.title.error.title'),
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
        flex={1}
        control={methods.control}
        onFocus={selectOnFocus}
        autoFocus
        minRows={1}
        autosize
        onBlur={methods.handleSubmit(handleSubmit)}
        maxLength={MAX_BOARD_TITLE_LENGTH}
      />
    </FormProvider>
  )
}

export default BoardTitleTextForm
