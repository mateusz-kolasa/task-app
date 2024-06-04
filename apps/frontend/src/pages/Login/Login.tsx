import { Anchor, Button, Card, Center, Group, Stack } from '@mantine/core'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { PasswordInput, TextInput } from 'react-hook-form-mantine'
import { useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import schema from './schema'
import ERROR_MESSAGES from '../../consts/error-messages'
import { useLoginMutation } from '../../store/slices/auth-api-slice'

export interface UserLogin {
  username: string
  password: string
}

function Login() {
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
          methods.setError('password', { message: ERROR_MESSAGES.invalidAuth })
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
              <TextInput name='username' label='Username' disabled={isLoading} />
              <PasswordInput name='password' label='Password' disabled={isLoading} />
              <Group justify='space-between'>
                <Anchor
                  component='button'
                  type='button'
                  c='dimmed'
                  size='xs'
                  onClick={handleSignUpClick}
                >
                  "Don't have an account? Sign up
                </Anchor>
                <Button onClick={methods.handleSubmit(handleSubmit)} disabled={isLoading}>
                  Sign in
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
