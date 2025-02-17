'use client';

import { useEffect } from 'react';
import { Anchor, Button, Checkbox, Divider, Group, Paper, PaperProps, PasswordInput, Stack, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { upperFirst, useToggle } from '@mantine/hooks';
import GithubButton from '../SocialButtons/GithubButton';
import signInWithGithub from '@/actions/auth/github/signInWithGithub';
import login from '@/actions/auth/email/loginEmail';
import signup from '@/actions/auth/email/signupEmail';


type AuthType = 'login' | 'register';

interface AuthenticationFormProps extends PaperProps {
  defaultType?: AuthType;
}

export default function AuthenticationForm({
  defaultType = 'login',
  ...props
}: AuthenticationFormProps) {
  const [type, toggle] = useToggle(['login', 'register'] as const);

  useEffect(() => {
    toggle(defaultType);
  }, [defaultType]);

  async function handleSubmit(values: any) {
    if (type === 'login') {
      await login(values);
    } else {
      await signup(values);
    }
  }

  async function handleGithub() {
    await signInWithGithub();
  }

  const form = useForm({
    initialValues: {
      email: '',
      name: '',
      password: '',
      terms: true,
    },
    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
      password: (val) => (val.length <= 6 ? 'Password should include at least 6 characters' : null),
    },
  });

  return (
    <Paper radius="md" p="xl" withBorder {...props}>
      <Text size="lg" fw={500}>
        Welcome to Mantine, {type} with
      </Text>
      <Group grow mb="md" mt="md">
        <GithubButton radius="xl" onClick={handleGithub}>Github</GithubButton>
      </Group>
      <Divider label="Or continue with email" labelPosition="center" my="lg" />
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          {type === 'register' && (
            <TextInput
              label="Name"
              placeholder="Your name"
              value={form.values.name}
              onChange={(event) => form.setFieldValue('name', event.currentTarget.value)}
              radius="md"
            />
          )}
          <TextInput
            required
            label="Email"
            placeholder="hello@mantine.dev"
            value={form.values.email}
            onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
            error={form.errors.email && 'Invalid email'}
            radius="md"
          />
          <PasswordInput
            required
            label="Password"
            placeholder="Your password"
            value={form.values.password}
            onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
            error={form.errors.password && 'Password should include at least 6 characters'}
            radius="md"
          />
          {type === 'register' && (
            <Checkbox
              label="I accept terms and conditions"
              checked={form.values.terms}
              onChange={(event) => form.setFieldValue('terms', event.currentTarget.checked)}
            />
          )}
        </Stack>
        <Group justify="space-between" mt="xl">
          <Anchor component="button" type="button" c="dimmed" onClick={() => toggle()} size="xs">
            {type === 'register'
              ? 'Already have an account? Login'
              : "Don't have an account? Register"}
          </Anchor>
          <Button type="submit" radius="xl">
            {upperFirst(type)}
          </Button>
        </Group>
      </form>
    </Paper>
  );
}