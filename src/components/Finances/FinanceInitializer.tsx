"use client";

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
import { IconCash } from "@tabler/icons-react";
import FinanceForm from "@/components/Finances/Form/FinanceForm";
import Link from "next/link";

export default function FinanceInitializer() {
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
              <IconCash size={40} />
            </ThemeIcon>
            <Title order={2} ta="center" fw={700}>
              Financial Management
            </Title>
          </Stack>

          <Stack gap="md">
            <Text size="lg" ta="center" c="dimmed" fw={500}>
              Start tracking your income and expenses to manage your finances
              effectively
            </Text>
            <Text size="sm" ta="center" c="dimmed">
              Add your first financial entry to begin monitoring your cash flow.
              You can track both one-time and recurring transactions.
            </Text>
            <Text size="sm" ta="center" c="dimmed">
              Want to customize your financial settings? Visit the{" "}
              <Anchor
                component={Link}
                href="/settings"
                c="blue"
                fw={500}
                inline
              >
                settings menu
              </Anchor>{" "}
              to configure default currencies and other preferences.
            </Text>
          </Stack>

          <Box maw={600} w="100%" mx="auto">
            <FinanceForm onClose={() => {}} />
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}
