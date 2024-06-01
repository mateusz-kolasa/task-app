import { Anchor, Button, Card, Group, Stack } from '@mantine/core';
import { useMutation } from '@tanstack/react-query';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { PasswordInput, TextInput } from 'react-hook-form-mantine';
import { useNavigate } from 'react-router-dom';
import request from '../../utils/request';
import API_PATHS from '../../consts/api-paths';
import { zodResolver } from '@hookform/resolvers/zod';
import schema from './schema';
import { AxiosError } from 'axios';
import ERROR_MESSAGES from '../../consts/error-messages';

type UserLogin = {
  username: string;
  password: string;
};

function Login() {
  const methods = useForm<UserLogin>({
    resolver: zodResolver(schema),
  });
  const navigate = useNavigate();

  const { mutate } = useMutation({
    mutationFn: async (userData: UserLogin) => request.post(API_PATHS.login, userData),
    onError: (error) => {
      if (error instanceof AxiosError)
        if (error?.request.status === 401) {
          methods.setError('password', { message: ERROR_MESSAGES.invalidAuth });
        }
    },
  });

  const handleSubmit: SubmitHandler<UserLogin> = (userData) => mutate(userData);
  const handleSignUpClick = () => navigate('/register');

  return (
    <FormProvider {...methods}>
      <form>
        <Card withBorder>
          <Stack>
            <TextInput name="username" label="Username" />
            <PasswordInput name="password" label="Password" />
            <Group justify="space-between">
              <Anchor component="button" type="button" c="dimmed" size="xs" onClick={handleSignUpClick}>
                "Don't have an account? Sign up
              </Anchor>
              <Button onClick={methods.handleSubmit(handleSubmit)}>Sign in</Button>
            </Group>
          </Stack>
        </Card>
      </form>
    </FormProvider>
  );
}

export default Login;
