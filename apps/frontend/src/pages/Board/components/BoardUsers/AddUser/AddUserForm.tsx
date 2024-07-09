import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Group, Stack } from '@mantine/core'
import { IconX } from '@tabler/icons-react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { Select, TextInput } from 'react-hook-form-mantine'
import { useTranslation } from 'react-i18next'
import { notifications } from '@mantine/notifications'
import { useParams } from 'react-router-dom'
import { useAddBoardUserMutation } from 'store/slices/api/board-api-slice'
import useBoardPermissionsText from 'hooks/useBoardPermissionsText'
import useSchema from './useSchema'
import { MAX_LOGIN_LENGTH } from 'shared-consts'

interface UserData {
  username: string
  permissions: string
}

interface AddUserFormProps {
  handleCloseForm: () => void
}

const createUserPermissions = [0, 1, 2]

function AddUserForm({ handleCloseForm }: Readonly<AddUserFormProps>) {
  const { boardId = '' } = useParams()
  const { t } = useTranslation()
  const boardPermissionText = useBoardPermissionsText()

  const [addBoardUser, { isLoading }] = useAddBoardUserMutation()

  const schema = useSchema()
  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      username: '',
      permissions: '0',
    },
  })

  const handleCloseClick = () => {
    methods.reset()
    handleCloseForm()
  }

  const handleSubmit: SubmitHandler<UserData> = userData => {
    addBoardUser({
      username: userData.username,
      boardId: parseInt(boardId),
      permissions: parseInt(userData.permissions),
    })
      .unwrap()
      .then(() => {
        handleCloseClick()
      })
      .catch(error => {
        if (error.status === 404) {
          notifications.show({
            title: t('board.users.add.error.title'),
            message: t('board.users.add.error.noUser'),
            color: 'red',
          })
        } else if (error.status === 400) {
          notifications.show({
            title: t('board.users.add.error.title'),
            message: t('board.users.add.error.userInBoard'),
            color: 'red',
          })
        } else {
          notifications.show({
            title: t('board.users.add.error.title'),
            message: t('board.users.add.error.other'),
            color: 'red',
          })
        }
      })
  }

  return (
    <Stack gap='sm' p='md'>
      <FormProvider {...methods}>
        <TextInput
          name='username'
          placeholder={t('board.users.add.username')}
          disabled={isLoading}
          maxLength={MAX_LOGIN_LENGTH}
        />
        <Select
          name='permissions'
          data={createUserPermissions.map(permissions => ({
            label: boardPermissionText[permissions],
            value: permissions.toString(),
          }))}
        />
        <Group wrap='nowrap'>
          <Button onClick={methods.handleSubmit(handleSubmit)}>
            {t('board.users.add.confirm')}
          </Button>
          <Button variant='subtle' p='xs' onClick={handleCloseClick} disabled={isLoading}>
            <IconX size={16} />
          </Button>
        </Group>
      </FormProvider>
    </Stack>
  )
}

export default AddUserForm
