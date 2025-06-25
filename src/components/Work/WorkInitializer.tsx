"use client";

import { useState } from "react";
import { useWorkStore } from "@/stores/workManagerStore";
import { useSettingsStore } from "@/stores/settingsStore";

import {
  Stack,
  Text,
  Paper,
  Title,
  Container,
  ThemeIcon,
  Anchor,
  Box,
} from "@mantine/core";
import { IconBriefcase } from "@tabler/icons-react";
import ProjectForm from "./Project/ProjectForm";
import { Currency } from "@/types/settings.types";
import Link from "next/link";

export default function WorkInitializer() {
  const [submitting, setSubmitting] = useState(false);
  const { addProject } = useWorkStore();
  const { defaultSalaryCurrency, defaultSalaryAmount } = useSettingsStore();

  async function handleSubmit(values: {
    title: string;
    description: string;
    salary: number;
    currency: Currency;
    payment_per_project: boolean;
  }) {
    setSubmitting(true);
    const success = await addProject({
      ...values,
    });
    if (success) {
      close();
    }
    setSubmitting(false);
  }

  return (
    <Container size="md" py="xl">
      <Paper shadow="md" p="xl" radius="lg" withBorder>
        <Stack gap="xl">
          <Stack align="center" gap="md">
            <ThemeIcon
              size={80}
              radius="xl"
              variant="gradient"
              gradient={{ from: "blue", to: "cyan" }}
            >
              <IconBriefcase size={40} />
            </ThemeIcon>
            <Title order={2} ta="center" fw={700}>
              Project Management
            </Title>
          </Stack>

          <Stack gap="md">
            <Text size="lg" ta="center" c="dimmed" fw={500}>
              Create your first project to start tracking your work and earnings
            </Text>
            <Text size="sm" ta="center" c="dimmed">
              Set up your project now to begin monitoring your progress and
              financial goals. You can customize project details and settings at
              any time.
            </Text>
            <Text size="sm" ta="center" c="dimmed">
              Want to streamline your workflow? Configure default settings in
              the{" "}
              <Anchor
                component={Link}
                href="/settings"
                c="blue"
                fw={500}
                inline
              >
                settings menu
              </Anchor>{" "}
              for faster project creation.
            </Text>
          </Stack>

          <Box maw={600} w="100%" mx="auto">
            <ProjectForm
              initialValues={{
                title: "",
                description: "",
                salary: defaultSalaryAmount,
                currency: defaultSalaryCurrency,
                payment_per_project: false,
              }}
              onSubmit={handleSubmit}
              newProject={true}
              submitting={submitting}
            />
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}
