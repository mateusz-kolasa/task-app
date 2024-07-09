import { zodResolver } from '@hookform/resolvers/zod'
import { useParams } from 'react-router-dom'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { Textarea } from 'react-hook-form-mantine'
import { useTranslation } from 'react-i18next'
import { notifications } from '@mantine/notifications'
import { selectOnFocus } from 'utils/formHelper'
import { useChangeCardTitleMutation } from 'store/slices/api/card-api-slice'
import useSchema from './useSchema'
import { MAX_CARD_TITLE_LENGTH } from 'shared-consts'

interface CardDialogTitleTextFormProps {
  title: string
  listId: number
  handleClose: () => void
}

interface TitleData {
  title: string
}

function CardDialogTitleTextForm({
  title,
  listId,
  handleClose,
}: Readonly<CardDialogTitleTextFormProps>) {
  const { boardId = '', cardId = '' } = useParams()

  const { t } = useTranslation()

  const schema = useSchema()
  const methods = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      title: title,
    },
  })

  const [changeCardDialogTitle] = useChangeCardTitleMutation()

  const handleSubmit: SubmitHandler<TitleData> = titleData => {
    // If tile is empty or unchanged, keep old one
    if (titleData.title.trim() !== '' && titleData.title !== title) {
      changeCardDialogTitle({
        title: titleData.title,
        boardId: boardId,
        listId: listId,
        cardId: parseInt(cardId),
      })
        .unwrap()
        .catch(() => {
          notifications.show({
            title: t('card.title.error.title'),
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
        maxLength={MAX_CARD_TITLE_LENGTH}
      />
    </FormProvider>
  )
}

export default CardDialogTitleTextForm
