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
  Box,
  Anchor,
} from "@mantine/core";
import { IconBriefcase } from "@tabler/icons-react";
import ProjectForm from "./Project/ProjectForm";
import { Currency } from "@/types/settings.types";
import { SettingsTab } from "../Settings/SettingsModal";

export default function WorkInitializer() {
  const [submitting, setSubmitting] = useState(false);
  const { addProject } = useWorkStore();
  const {
    locale,
    defaultSalaryCurrency,
    defaultSalaryAmount,
    setIsModalOpen,
    setSelectedTab,
  } = useSettingsStore();

  async function handleSubmit(values: {
    title: string;
    description: string;
    salary: number;
    currency: Currency;
    payment_per_project: boolean;
    cash_flow_category_id?: string | null;
  }) {
    setSubmitting(true);
    const success = await addProject({
      ...values,
    }, true);
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
              {locale === "de-DE" ? "Projekt-Management" : "Project Management"}
            </Title>
          </Stack>

          <Stack gap="md">
            <Text size="lg" ta="center" c="dimmed" fw={500}>
              {locale === "de-DE"
                ? "Erstelle dein erstes Projekt, um deine Arbeit und Einkommen zu verfolgen"
                : "Create your first project to start tracking your work and earnings"}
            </Text>
            <Text size="sm" ta="center" c="dimmed">
              {locale === "de-DE"
                ? "Richte dein Projekt jetzt ein, um deinen Fortschritt und finanzielle Ziele zu überwachen. Du kannst Projektdetails und Einstellungen jederzeit anpassen."
                : "Set up your project now to begin monitoring your progress and financial goals. You can customize project details and settings at any time."}
            </Text>
            <Text size="sm" ta="center" c="dimmed">
              {locale === "de-DE"
                ? "Möchtest du deinen Workflow optimieren? Konfiguriere Standardeinstellungen in"
                : "Want to streamline your workflow? Configure default settings in the"}{" "}
              <Anchor
                component="button"
                onClick={() => {
                  setIsModalOpen(true);
                  setSelectedTab(SettingsTab.WORK);
                }}
                c="blue"
                fw={500}
                inline
              >
                {locale === "de-DE" ? "Arbeits-Einstellungen" : "Work Settings"}
              </Anchor>{" "}
              {locale === "de-DE"
                ? "für schnellere Projekterstellung"
                : "for faster project creation."}
            </Text>
          </Stack>

          <Box maw={600} w="100%" mx="auto">
            <ProjectForm
              initialValues={{
                color: null,
                title: "",
                description: "",
                salary: defaultSalaryAmount,
                currency: defaultSalaryCurrency,
                hourly_payment: false,
                cash_flow_category_id: null,
                rounding_interval: null,
                rounding_direction: null,
                round_in_time_fragments: null,
                time_fragment_interval: null,
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
