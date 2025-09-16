"use client";

import { useDisclosure, useHover } from "@mantine/hooks";
import { useSettingsStore } from "@/stores/settingsStore";
import { useFinanceStore } from "@/stores/financeStore";

import { Card, Group, Stack, Text } from "@mantine/core";

import { FinanceProject } from "@/types/finance.types";
import { formatDate, formatMoney } from "@/utils/formatFunctions";
import AddActionIcon from "@/components/UI/ActionIcons/PlusActionIcon";
import FinanceAdjustmentForm from "./FinanceAdjustmentForm";
import FinanceAdjustmentRow from "./FinanceAdjustmentRow";

interface FinanceProjectCardProps {
  project: FinanceProject;
}

export default function FinanceProjectCard({
  project,
}: FinanceProjectCardProps) {
  const { locale } = useSettingsStore();
  const { financeCategories, financeClients } = useFinanceStore();
  const { hovered, ref } = useHover();
  const [
    isAdjustmentFormOpen,
    { open: openAdjustmentForm, close: closeAdjustmentForm },
  ] = useDisclosure(false);

  const totalAmount = project.adjustments.reduce(
    (acc, adjustment) => acc + adjustment.amount,
    project.start_amount
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
      ref={ref}
    >
      <Stack>
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
              {
                financeCategories.find(
                  (category) => category.id === project.finance_category_id
                )?.title
              }
            </Text>
            <Group>
              <Text> {locale === "de-DE" ? "Kunde" : "Client"}: </Text>
              <Text c="dimmed" size="xs">
                {
                  financeClients.find(
                    (client) => client.id === project.client_id
                  )?.name
                }
              </Text>
            </Group>
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
          {hovered && !isAdjustmentFormOpen && (
            <AddActionIcon onClick={openAdjustmentForm} />
          )}
          {isAdjustmentFormOpen && (
            <FinanceAdjustmentForm
              onClose={closeAdjustmentForm}
              projectId={project.id}
            />
          )}
        </Group>
      </Stack>
    </Card>
  );
}
