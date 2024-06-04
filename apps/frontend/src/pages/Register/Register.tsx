import { Anchor, Button, Card, Center, Group, Stack } from '@mantine/core'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { PasswordInput, TextInput } from 'react-hook-form-mantine'
import { useNavigate } from 'react-router-dom'
import schema from './schema'
import { zodResolver } from '@hookform/resolvers/zod'
import SERVER_ERRORS from '../../consts/server-errors'
import ERROR_MESSAGES from '../../consts/error-messages'
import { useRegisterMutation } from '../../store/slices/auth-api-slice'

export interface UserRegister {
  username: string
  password: string
  passwordConfirm: string
}

function Register() {
  const methods = useForm<UserRegister>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: '',
      password: '',
      passwordConfirm: '',
    },
  })
  const navigate = useNavigate()

  const [register, { isLoading }] = useRegisterMutation()

  const handleSubmit: SubmitHandler<UserRegister> = userData => {
    register({ username: userData.username, password: userData.password })
      .unwrap()
      .catch(error => {
        if (error.data.message === SERVER_ERRORS.usernameTaken) {
          methods.setError('username', { message: ERROR_MESSAGES.usernameTaken })
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
              <TextInput name='username' label='Username' disabled={isLoading} />
              <PasswordInput name='password' label='Password' disabled={isLoading} />
              <PasswordInput name='passwordConfirm' label='Confirm Password' disabled={isLoading} />
              <Group justify='space-between'>
                <Anchor
                  component='button'
                  type='button'
                  c='dimmed'
                  size='xs'
                  onClick={handleSignInClick}
                >
                  Already have an account? Sign in
                </Anchor>
                <Button onClick={methods.handleSubmit(handleSubmit)} disabled={isLoading}>
                  Sign up
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
