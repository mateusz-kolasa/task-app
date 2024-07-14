import { zodResolver } from '@hookform/resolvers/zod'
import { useParams } from 'react-router-dom'
import schema from './schema'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { Textarea } from 'react-hook-form-mantine'
import { useTranslation } from 'react-i18next'
import { notifications } from '@mantine/notifications'
import { selectOnFocus } from 'utils/formHelper'
import { useChangeBoardDescriptionMutation } from 'store/slices/api/board-api-slice'
import { MAX_BOARD_DESCRIPTION_LENGTH } from 'shared-consts'

interface BoardDescriptionTextFormProps {
  description: string | null
  handleClose: () => void
}

interface DescriptionData {
  description: string | null
}

function BoardDescriptionTextForm({
  description,
  handleClose,
}: Readonly<BoardDescriptionTextFormProps>) {
  const { boardId = '' } = useParams()

  const { t } = useTranslation()

  const methods = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      description: description,
    },
  })

  const [changeBoardDescription] = useChangeBoardDescriptionMutation()

  const handleSubmit: SubmitHandler<DescriptionData> = descriptionData => {
    if (descriptionData.description !== description) {
      changeBoardDescription({
        description: descriptionData.description,
        boardId: parseInt(boardId),
      })
        .unwrap()
        .catch(() => {
          notifications.show({
            title: t('board.description.error.title'),
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
        maxLength={MAX_BOARD_DESCRIPTION_LENGTH}
      />
    </FormProvider>
  )
}

export default BoardDescriptionTextForm
