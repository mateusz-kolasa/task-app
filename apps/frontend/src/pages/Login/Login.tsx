import { Anchor, Button, Card, Center, Group, Stack } from '@mantine/core'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { PasswordInput, TextInput } from 'react-hook-form-mantine'
import { useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import schema from './schema'
import { useLoginMutation } from '../../store/slices/api/auth-api-slice'
import { useTranslation } from 'react-i18next'

export interface UserLogin {
  username: string
  password: string
}

function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const methods = useForm<UserLogin>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  const [login, { isLoading }] = useLoginMutation()

  const handleSubmit: SubmitHandler<UserLogin> = userData => {
    login(userData)
      .unwrap()
      .catch(error => {
        if (error.status === 401) {
          methods.setError('password', { message: t('username.validation.auth') })
        }
      })
  }

  const handleSignUpClick = () => navigate('/register')

  return (
    <Center>
      <FormProvider {...methods}>
        <form>
          <Card withBorder>
            <Stack>
              <TextInput name='username' label={t('username.label')} disabled={isLoading} />
              <PasswordInput name='password' label={t('password.label')} disabled={isLoading} />
              <Group justify='space-between'>
                <Anchor
                  component='button'
                  type='button'
                  c='dimmed'
                  size='xs'
                  onClick={handleSignUpClick}
                >
                  {t('signup.redirect')}
                </Anchor>
                <Button onClick={methods.handleSubmit(handleSubmit)} disabled={isLoading}>
                  {t('signin.button')}
                </Button>
              </Group>
            </Stack>
          </Card>
        </form>
      </FormProvider>
    </Center>
  )
}

export default Login
