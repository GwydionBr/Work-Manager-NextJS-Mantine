"use client";

import { useEffect } from "react";
import { useForm, isEmail } from "@mantine/form";
import { upperFirst, useToggle } from "@mantine/hooks";
import { useFormatter } from "@/hooks/useFormatter";

import {
  Anchor,
  Button,
  Checkbox,
  Divider,
  Group,
  Paper,
  PaperProps,
  PasswordInput,
  ScrollArea,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import GithubButton from "../SocialButtons/GithubButton";

import { signInWithGithub } from "@/actions";
import {
  useLoginMutation,
  useSignupMutation,
} from "@/utils/queries/auth/use-auth";
import PasswordStrength from "./PasswordStrenght";

type AuthType = "login" | "register";

interface AuthenticationFormProps extends PaperProps {
  defaultType?: AuthType;
}

export default function AuthenticationForm({
  defaultType = "login",
  ...props
}: AuthenticationFormProps) {
  const [type, toggle] = useToggle(["login", "register"] as const);
  const { getLocalizedText } = useFormatter();
  const { mutate: login, isPending: isLoginPending } = useLoginMutation();
  const { mutate: signup, isPending: isSignupPending } = useSignupMutation();
  useEffect(() => {
    toggle(defaultType);
  }, [defaultType]);

  async function handleSubmit(values: typeof form.values) {
    if (type === "login") {
      login(values);
    } else {
      signup(values);
    }
  }

  async function handleGithub() {
    await signInWithGithub();
  }

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
    validate: {
      email: (value) =>
        /^(?!\.)(?!.*\.\.)([a-z0-9_'+\-\.]*)[a-z0-9_+-]@([a-z0-9][a-z0-9\-]*\.)+[a-z]{2,}$/i.test(
          value
        )
          ? null
          : getLocalizedText("Ungültige E-Mail Adresse", "Invalid email"),
      password: (value) =>
        value.length <= 6
          ? getLocalizedText(
              "Passwort muss mindestens 6 Zeichen lang sein",
              "Password must be at least 6 characters long"
            )
          : null,
      confirmPassword: (value, values) =>
        type === "register" && value !== values.password
          ? getLocalizedText(
              "Passwörter stimmen nicht überein",
              "Passwords do not match"
            )
          : null,
      terms: (value) =>
        type === "register" && value !== true
          ? getLocalizedText(
              "Sie müssen die Nutzungsbedingungen akzeptieren",
              "You must accept the terms and conditions"
            )
          : null,
    },
  });

  return (
    <ScrollArea>
      <Paper radius="md" p="xl" {...props}>
        <Title
          order={2}
          ta="center"
          mt="md"
          mb={50}
          c="var(--mantine-color-text)"
        >
          {getLocalizedText(
            "Willkommen beim Work Manager",
            "Welcome to Work Manager"
          )}
        </Title>
        <Group grow mb="md" mt="md">
          <GithubButton radius="xl" onClick={handleGithub}>
            {getLocalizedText("Mit Github fortfahren", "Continue with Github")}
          </GithubButton>
        </Group>
        <Divider
          label={getLocalizedText(
            "Oder mit E-Mail fortfahren",
            "Or continue with email"
          )}
          labelPosition="center"
          my="lg"
        />
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              required
              label={getLocalizedText("E-Mail", "Email")}
              radius="md"
              size="md"
              placeholder={getLocalizedText(
                "email@beispiel.com",
                "email@example.com"
              )}
              {...form.getInputProps("email")}
            />
            {type === "register" ? (
              <Stack>
                <PasswordStrength
                  currentPassword={form.values.password}
                  required
                  radius="md"
                  size="md"
                  label={getLocalizedText("Passwort", "Password")}
                  placeholder={getLocalizedText(
                    "Dein Passwort",
                    "Your password"
                  )}
                  {...form.getInputProps("password")}
                />
                <PasswordInput
                  required
                  radius="md"
                  size="md"
                  label={getLocalizedText(
                    "Bestätige Passwort",
                    "Confirm Password"
                  )}
                  placeholder={getLocalizedText(
                    "Bestätige dein Passwort",
                    "Confirm your password"
                  )}
                  {...form.getInputProps("confirmPassword")}
                />
                <Checkbox
                  required
                  label={getLocalizedText(
                    "Ich akzeptiere die Nutzungsbedingungen",
                    "I accept terms and conditions"
                  )}
                  {...form.getInputProps("terms")}
                />
              </Stack>
            ) : (
              <PasswordInput
                required
                radius="md"
                size="md"
                label={getLocalizedText("Passwort", "Password")}
                placeholder={getLocalizedText("Dein Passwort", "Your password")}
                {...form.getInputProps("password")}
              />
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
                ? getLocalizedText(
                    "Hast du bereits ein Konto? Login",
                    "Already have an account? Login"
                  )
                : getLocalizedText(
                    "Hast du noch kein Konto? Registrieren",
                    "Don't have an account? Register"
                  )}
            </Anchor>
            <Button
              type="submit"
              radius="xl"
              loading={isLoginPending || isSignupPending}
              size="md"
            >
              {upperFirst(type)}
            </Button>
          </Group>
        </form>
      </Paper>
    </ScrollArea>
  );
}
