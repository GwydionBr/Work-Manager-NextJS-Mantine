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
import { IconBriefcase, IconSettings } from "@tabler/icons-react";
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
  }) {
    setSubmitting(true);
    const success = await addProject({ ...values });
    if (success) {
      close();
    }
    setSubmitting(false);
  }

  return (
    <Container size="md" py="xl">
      <Paper shadow="sm" p="xl" radius="md" withBorder>
        <Stack gap="lg">
          <Stack align="center" gap="xs">
            <ThemeIcon size={60} radius="md" variant="light">
              <IconBriefcase size={30} />
            </ThemeIcon>
            <Title order={2} ta="center">
              Welcome to the Work Manager
            </Title>
          </Stack>

          <Stack gap="xs">
            <Text size="lg" ta="center" c="dimmed">
              Let's get started by creating your first project. This will help
              you track your work and earnings effectively.
            </Text>
            <Text size="sm" ta="center" c="dimmed">
              Pro tip: You can customize default salary settings in the{" "}
              <Anchor component={Link} href="/settings" c="blue" inline>
                settings menu
              </Anchor>{" "}
              for quicker project creation.
            </Text>
          </Stack>

          <Box maw={600} w="100%" mx="auto">
            <ProjectForm
              initialValues={{
                title: "",
                description: "",
                salary: defaultSalaryAmount,
                currency: defaultSalaryCurrency,
              }}
              onSubmit={handleSubmit}
              onCancel={() => {}}
              newProject={true}
              submitting={submitting}
            />
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}
