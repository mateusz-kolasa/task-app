import { Anchor, Button, Card, Group, Stack } from '@mantine/core';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { PasswordInput, TextInput } from 'react-hook-form-mantine';
import { useNavigate } from 'react-router-dom';
import schema from './schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import request from '../../utils/request';
import API_PATHS from '../../consts/api-paths';
import SERVER_ERRORS from '../../consts/server-errors';
import ERROR_MESSAGES from '../../consts/error-messages';
import { AxiosError } from 'axios';

type UserRegister = {
  username: string;
  password: string;
  passwordConfirm: string;
};

function Register() {
  const methods = useForm<UserRegister>({ resolver: zodResolver(schema) });
  const navigate = useNavigate();

  const { mutate } = useMutation({
    mutationFn: async (userData: UserRegister) =>
      request.post(API_PATHS.register, {
        username: userData.username,
        password: userData.password,
      }),
    onError: (error) => {
      if (error instanceof AxiosError) {
        const message = error?.response?.data?.message;
        if (message === SERVER_ERRORS.usernameTaken) {
          methods.setError('username', { message: ERROR_MESSAGES.usernameTaken });
        }
      }
    },
  });

  const handleSubmit: SubmitHandler<UserRegister> = (userData) => mutate(userData);
  const handleSignInClick = () => navigate('/login');

  return (
    <FormProvider {...methods}>
      <form>
        <Card withBorder>
          <Stack>
            <TextInput name="username" label="Username" />
            <PasswordInput name="password" label="Password" />
            <PasswordInput name="passwordConfirm" label="Confirm Password" />
            <Group justify="space-between">
              <Anchor component="button" type="button" c="dimmed" size="xs" onClick={handleSignInClick}>
                Already have an account? Sign in
              </Anchor>
              <Button onClick={methods.handleSubmit(handleSubmit)}>Sign up</Button>
            </Group>
          </Stack>
        </Card>
      </form>
    </FormProvider>
  );
}

export default Register;
