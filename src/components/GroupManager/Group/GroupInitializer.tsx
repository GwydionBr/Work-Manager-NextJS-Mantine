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
import { IconUsersGroup } from "@tabler/icons-react";
import GroupForm from "./GroupForm";
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
      <Paper shadow="md" p="xl" radius="lg" withBorder>
        <Stack gap="xl">
          <Stack align="center" gap="md">
            <ThemeIcon
              size={80}
              radius="xl"
              variant="gradient"
              gradient={{ from: "blue", to: "cyan" }}
            >
              <IconUsersGroup size={40} />
            </ThemeIcon>
            <Title order={2} ta="center" fw={700}>
              Group Management
            </Title>
          </Stack>

          <Stack gap="md">
            <Text size="lg" ta="center" c="dimmed" fw={500}>
              Create your first group to start collaborating with your team
              members
            </Text>
            <Text size="sm" ta="center" c="dimmed">
              Set up your group now and invite team members to join your
              workspace. You can manage team members and their roles at any
              time.
            </Text>
            <Text size="sm" ta="center" c="dimmed">
              Need to manage your team members? Visit the{" "}
              <Anchor component={Link} href="/account" c="blue" fw={500} inline>
                account settings
              </Anchor>{" "}
              to add or remove team members.
            </Text>
          </Stack>

          <Box maw={600} w="100%" mx="auto">
            <GroupForm onClose={() => {}} />
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}
