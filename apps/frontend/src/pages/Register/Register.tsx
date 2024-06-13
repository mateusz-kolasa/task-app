import { Anchor, Button, Card, Center, Group, Stack } from '@mantine/core'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { PasswordInput, TextInput } from 'react-hook-form-mantine'
import { useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import SERVER_ERRORS from '../../consts/server-errors'
import { useRegisterMutation } from '../../store/slices/api/auth-api-slice'
import { useTranslation } from 'react-i18next'
import useSchema from './useSchema'

export interface UserRegister {
  username: string
  password: string
  passwordConfirm: string
}

function Register() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const schema = useSchema()
  const methods = useForm<UserRegister>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: '',
      password: '',
      passwordConfirm: '',
    },
  })

  const [register, { isLoading }] = useRegisterMutation()

  const handleSubmit: SubmitHandler<UserRegister> = userData => {
    register({ username: userData.username, password: userData.password })
      .unwrap()
      .catch(error => {
        if (error.data.message === SERVER_ERRORS.usernameTaken) {
          methods.setError('username', { message: t('username.validation.taken') })
        }
      })
  }

  const handleSignInClick = () => navigate('/login')

  return (
    <Center>
      <FormProvider {...methods}>
        <form>
          <Card withBorder>
            <Stack>
              <TextInput name='username' label={t('username.label')} disabled={isLoading} />
              <PasswordInput name='password' label={t('password.label')} disabled={isLoading} />
              <PasswordInput
                name='passwordConfirm'
                label={t('password.confirm.label')}
                disabled={isLoading}
              />
              <Group justify='space-between'>
                <Anchor
                  component='button'
                  type='button'
                  c='dimmed'
                  size='xs'
                  onClick={handleSignInClick}
                >
                  {t('signin.redirect')}
                </Anchor>
                <Button onClick={methods.handleSubmit(handleSubmit)} disabled={isLoading}>
                  {t('signup.button')}
                </Button>
              </Group>
            </Stack>
          </Card>
        </form>
      </FormProvider>
    </Center>
  )
}

export default Register
