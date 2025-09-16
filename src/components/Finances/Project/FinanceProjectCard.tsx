"use client";

import { useDisclosure, useClickOutside } from "@mantine/hooks";
import { useSettingsStore } from "@/stores/settingsStore";
import { useFinanceStore } from "@/stores/financeStore";

import {
  Card,
  Collapse,
  Group,
  HoverCard,
  Stack,
  Text,
  Box,
  Transition,
} from "@mantine/core";

import { FinanceProject } from "@/types/finance.types";
import { formatDate, formatMoney } from "@/utils/formatFunctions";
import FinanceAdjustmentForm from "./FinanceAdjustmentForm";
import FinanceAdjustmentRow from "./FinanceAdjustmentRow";
import FinanceClientCard from "../FinanceClient/FinanceClientCard";
import SelectActionIcon from "@/components/UI/ActionIcons/SelectActionIcon";

interface FinanceProjectCardProps {
  project: FinanceProject;
  selectedModeActive: boolean;
  isSelected: boolean;
  onToggleSelected: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onDelete: (ids: string[]) => void;
}

export default function FinanceProjectCard({
  project,
  selectedModeActive,
  isSelected,
  onToggleSelected,
  onDelete,
}: FinanceProjectCardProps) {
  const { locale } = useSettingsStore();
  const { financeCategories, financeClients } = useFinanceStore();
  const [
    isAdjustmentFormOpen,
    { open: openAdjustmentForm, close: closeAdjustmentForm },
  ] = useDisclosure(false);
  const ref = useClickOutside(() => {
    closeAdjustmentForm();
  });
  const totalAmount = project.adjustments.reduce(
    (acc, adjustment) => acc + adjustment.amount,
    project.start_amount
  );

  const financeClient = financeClients.find(
    (client) => client.id === project.client_id
  );

  const financeCategory = financeCategories.find(
    (category) => category.id === project.finance_category_id
  );

  return (
    <Card
      withBorder
      p="md"
      h="100%"
      miw={400}
      maw={800}
      shadow="md"
      w="100%"
      style={{
        cursor: "pointer",
        border: isSelected ? "2px solid var(--mantine-color-blue-5)" : "none",
      }}
      onClick={(e) => {
        if (selectedModeActive) {
          onToggleSelected(e as any);
        } else {
          openAdjustmentForm();
        }
      }}
      ref={ref}
    >
      <Group gap={0} w="100%">
        <Box w={0}>
          <Transition
            mounted={selectedModeActive}
            transition="fade-right"
            duration={200}
          >
            {(styles) => (
              <SelectActionIcon
                style={styles}
                onClick={() => {
                  onToggleSelected;
                }}
                selected={isSelected}
              />
            )}
          </Transition>
        </Box>
        <Stack
          ml={selectedModeActive ? 60 : 0}
          style={{ transition: "margin 0.2s ease" }}
          w="100%"
        >
          <Group justify="space-between">
            <Group>
              <Text c="dimmed" size="xs">
                {project.due_date
                  ? formatDate(new Date(project.due_date), locale)
                  : locale === "de-DE"
                    ? "Kein Fälligkeitsdatum"
                    : "No due date"}
              </Text>
            </Group>
            <Group
              px="md"
              style={{
                borderBottom: `1px solid light-dark(var(--mantine-color-dark-5), var(--mantine-color-gray-6))`,
              }}
            >
              <Text fw={700}>{project.title}</Text>
              <Text c={totalAmount > 0 ? "green" : "red"} fw={600}>
                {formatMoney(totalAmount, project.currency, locale)}
              </Text>
            </Group>
            <Stack>
              <Text c="dimmed" size="xs">
                {financeCategory?.title}
              </Text>
              {financeClient && (
                <HoverCard>
                  <HoverCard.Target>
                    <Group>
                      <Text> {locale === "de-DE" ? "Kunde" : "Client"}: </Text>
                      <Text c="dimmed" size="xs">
                        {financeClient?.name}
                      </Text>
                    </Group>
                  </HoverCard.Target>
                  <HoverCard.Dropdown>
                    <FinanceClientCard client={financeClient!} />
                  </HoverCard.Dropdown>
                </HoverCard>
              )}
            </Stack>
          </Group>
          <Group align="flex-start">
            <Text fw={600} c={project.start_amount > 0 ? "green" : "red"}>
              {formatMoney(project.start_amount, project.currency, locale)}
            </Text>
            <Stack>
              {project.adjustments.map((adjustment) => (
                <FinanceAdjustmentRow
                  key={adjustment.id}
                  adjustment={adjustment}
                  currency={project.currency}
                />
              ))}
            </Stack>
          </Group>
          <Group justify="center">
            <Collapse in={isAdjustmentFormOpen}>
              <FinanceAdjustmentForm
                onClose={closeAdjustmentForm}
                projectId={project.id}
              />
            </Collapse>
          </Group>
        </Stack>
      </Group>
    </Card>
  );
}
