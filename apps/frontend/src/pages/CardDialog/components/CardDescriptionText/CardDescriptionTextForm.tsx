import { zodResolver } from '@hookform/resolvers/zod'
import { useParams } from 'react-router-dom'
import schema from './schema'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { Textarea } from 'react-hook-form-mantine'
import { useTranslation } from 'react-i18next'
import { notifications } from '@mantine/notifications'
import { selectOnFocus } from 'utils/formHelper'
import { useChangeCardDescriptionMutation } from 'store/slices/api/card-api-slice'

interface CardDescriptionTextFormProps {
  listId: number
  description: string | null
  handleClose: () => void
}

interface DescriptionData {
  description: string | null
}

function CardDescriptionTextForm({
  listId,
  description,
  handleClose,
}: Readonly<CardDescriptionTextFormProps>) {
  const { boardId = '', cardId = '' } = useParams()
  const { t } = useTranslation()

  const methods = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      description: description,
    },
  })

  const [changeCardDescription] = useChangeCardDescriptionMutation()

  const handleSubmit: SubmitHandler<DescriptionData> = descriptionData => {
    if (descriptionData.description !== description) {
      changeCardDescription({
        description: descriptionData.description,
        boardId: boardId,
        listId,
        cardId: parseInt(cardId),
      })
        .unwrap()
        .catch(() => {
          notifications.show({
            title: t('card.description.error.title'),
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
        name='description'
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

export default CardDescriptionTextForm
