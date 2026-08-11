import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { authApi } from '../services/auth-api';
import { PwaInstallButton } from '../components/pwa-install-button';
import { useAuth } from '../state/auth-context';

const loginSchema = z.object({
  username: z.string().min(3, 'Username is required'),
  password: z.string().min(8, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: 'superadmin',
      password: 'ChangeMe123!',
    },
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      login(data.accessToken, data.user);
      const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
      navigate(from ?? '/dashboard', { replace: true });
    },
    onError: () => {
      setErrorMessage('Invalid username or password.');
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    setErrorMessage(null);
    loginMutation.mutate(values);
  });

  return (
    <Box
      minHeight="100vh"
      display="grid"
      sx={{
        placeItems: 'center',
        background:
          'linear-gradient(130deg, rgba(15,76,92,0.08) 0%, rgba(47,133,90,0.08) 45%, rgba(255,255,255,1) 100%)',
      }}
      p={2}
    >
      <Paper elevation={2} sx={{ maxWidth: 420, width: '100%', p: 4 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Security Login
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Use your security credentials to access the Lost &amp; Found portal.
        </Typography>

        <Stack component="form" spacing={2} onSubmit={onSubmit}>
          {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

          <TextField
            label="Username"
            {...form.register('username')}
            error={Boolean(form.formState.errors.username)}
            helperText={form.formState.errors.username?.message}
          />
          <TextField
            label="Password"
            type="password"
            {...form.register('password')}
            error={Boolean(form.formState.errors.password)}
            helperText={form.formState.errors.password?.message}
          />
          <Stack direction="row" spacing={2} alignItems="center">
            <PwaInstallButton />
            <Button type="submit" variant="contained" size="large" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};
