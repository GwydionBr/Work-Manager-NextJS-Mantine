"use client";

import { useEffect } from "react";
import { useForm } from "@mantine/form";
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
      email: (val) => (/^\S+@\S+$/.test(val) ? null : "Invalid email"),
      password: (val) =>
        val.length <= 6
          ? getLocalizedText(
              "Passwort muss mindestens 6 Zeichen lang sein",
              "Password must be at least 6 characters long"
            )
          : null,
      confirmPassword: (val, values) =>
        type === "register" && val !== values.password
          ? getLocalizedText(
              "Passwörter stimmen nicht überein",
              "Passwords do not match"
            )
          : null,
      terms: (val) =>
        val
          ? null
          : getLocalizedText(
              "Sie müssen die Nutzungsbedingungen akzeptieren",
              "You must accept the terms and conditions"
            ),
    },
  });

  return (
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
            placeholder={getLocalizedText(
              "email@beispiel.com",
              "email@example.com"
            )}
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
            label={getLocalizedText("Passwort", "Password")}
            placeholder={getLocalizedText("Dein Passwort", "Your password")}
            value={form.values.password}
            onChange={(event) =>
              form.setFieldValue("password", event.currentTarget.value)
            }
            error={
              form.errors.password &&
              getLocalizedText(
                "Passwort muss mindestens 6 Zeichen lang sein",
                "Password must be at least 6 characters long"
              )
            }
            radius="md"
            size="md"
          />
          {type === "register" && (
            <PasswordInput
              required
              label={getLocalizedText("Bestätige Passwort", "Confirm Password")}
              placeholder={getLocalizedText(
                "Bestätige dein Passwort",
                "Confirm your password"
              )}
              value={form.values.confirmPassword}
              onChange={(event) =>
                form.setFieldValue("confirmPassword", event.currentTarget.value)
              }
              error={
                form.errors.confirmPassword &&
                getLocalizedText(
                  "Passwörter stimmen nicht überein",
                  "Passwords do not match"
                )
              }
              radius="md"
              size="md"
            />
          )}
          {type === "register" && (
            <Checkbox
              label={getLocalizedText(
                "Ich akzeptiere die Nutzungsbedingungen",
                "I accept terms and conditions"
              )}
              checked={form.values.terms}
              onChange={(event) =>
                form.setFieldValue("terms", event.currentTarget.checked)
              }
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
            onClick={() => handleSubmit(form.values)}
          >
            {upperFirst(type)}
          </Button>
        </Group>
      </form>
    </Paper>
  );
}
