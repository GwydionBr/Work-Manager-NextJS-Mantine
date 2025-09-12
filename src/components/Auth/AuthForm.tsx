"use client";

import { useEffect, useState } from "react";
import { useForm } from "@mantine/form";
import { useRouter } from "next/navigation";
import { upperFirst, useToggle } from "@mantine/hooks";

import {
  Anchor,
  Button,
  Checkbox,
  Divider,
  Group,
  Paper,
  PaperProps,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import GithubButton from "../SocialButtons/GithubButton";

import classes from "@/app/Auth.module.css";

import { login, signup, signInWithGithub } from "@/actions";

type AuthType = "login" | "register";

interface AuthenticationFormProps extends PaperProps {
  defaultType?: AuthType;
}

export default function AuthenticationForm({
  defaultType = "login",
  ...props
}: AuthenticationFormProps) {
  const [type, toggle] = useToggle(["login", "register"] as const);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    toggle(defaultType);
  }, [defaultType]);

  async function handleSubmit(values: typeof form.values) {
    setIsLoading(true);
    if (type === "login") {
      const { success, error } = await login(values);
      if (success) {
        router.push("/work");
      } else {
        setError(error || "An error occurred");
      }
    } else {
      const { success, error } = await signup(values);
      if (success) {
        router.push("/work");
      } else {
        setError(error || "An error occurred");
      }
    }
    setIsLoading(false);
  }

  async function handleGithub() {
    await signInWithGithub();
  }

  const form = useForm({
    initialValues: {
      email: "",
      name: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : "Invalid email"),
      password: (val) =>
        val.length <= 6
          ? "Password should include at least 6 characters"
          : null,
      confirmPassword: (val, values) =>
        type === "register" && val !== values.password
          ? "Passwords do not match"
          : null,
      terms: (val) => (val ? null : "You must accept the terms and conditions"),
    },
  });

  return (
    <Paper radius="md" p="xl" className={classes.authForm} {...props}>
      <Title
        order={2}
        ta="center"
        mt="md"
        mb={50}
        c="var(--mantine-color-text)"
      >
        Welcome to Work Manager
      </Title>
      <Group grow mb="md" mt="md">
        <GithubButton
          radius="xl"
          onClick={handleGithub}
          className={classes.socialButton}
        >
          Continue with Github
        </GithubButton>
      </Group>
      <Divider label="Or continue with email" labelPosition="center" my="lg" />
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          {type === "register" && (
            <TextInput
              label="Name"
              placeholder="Your name"
              value={form.values.name}
              onChange={(event) =>
                form.setFieldValue("name", event.currentTarget.value)
              }
              radius="md"
              size="md"
            />
          )}
          <TextInput
            required
            label="Email"
            placeholder="email@example.com"
            value={form.values.email}
            onChange={(event) =>
              form.setFieldValue("email", event.currentTarget.value)
            }
            error={form.errors.email && "Invalid email"}
            radius="md"
            size="md"
          />
          <PasswordInput
            required
            label="Password"
            placeholder="Your password"
            value={form.values.password}
            onChange={(event) =>
              form.setFieldValue("password", event.currentTarget.value)
            }
            error={
              form.errors.password &&
              "Password should include at least 6 characters"
            }
            radius="md"
            size="md"
          />
          {type === "register" && (
            <PasswordInput
              required
              label="Confirm Password"
              placeholder="Confirm your password"
              value={form.values.confirmPassword}
              onChange={(event) =>
                form.setFieldValue("confirmPassword", event.currentTarget.value)
              }
              error={form.errors.confirmPassword && "Passwords do not match"}
              radius="md"
              size="md"
            />
          )}
          {type === "register" && (
            <Checkbox
              label="I accept terms and conditions"
              checked={form.values.terms}
              onChange={(event) =>
                form.setFieldValue("terms", event.currentTarget.checked)
              }
            />
          )}
          {error && (
            <Text c="red" size="sm">
              {error}
            </Text>
          )}
        </Stack>
        <Group justify="space-between" mt="xl">
          <Anchor
            component="button"
            type="button"
            c="dimmed"
            onClick={() => toggle()}
            size="sm"
          >
            {type === "register"
              ? "Already have an account? Login"
              : "Don't have an account? Register"}
          </Anchor>
          <Button
            type="submit"
            radius="xl"
            loading={isLoading}
            disabled={isLoading}
            className={classes.authButton}
            size="md"
            onClick={() => handleSubmit(form.values)}
          >
            {upperFirst(type)}
          </Button>
        </Group>
      </form>
    </Paper>
  );
}
