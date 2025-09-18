"use client";

import {
  useDisclosure,
  useClickOutside,
  useHover,
  mergeRefs,
} from "@mantine/hooks";
import { useSettingsStore } from "@/stores/settingsStore";
import { useFinanceStore } from "@/stores/financeStore";

import {
  Card,
  CardProps,
  Collapse,
  Group,
  HoverCard,
  Stack,
  Button,
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
import { IconArrowDown, IconLinkPlus } from "@tabler/icons-react";
import PayoutActionIcon from "@/components/UI/ActionIcons/PayoutActionIcon";
import DeleteActionIcon from "@/components/UI/ActionIcons/DeleteActionIcon";

interface FinanceProjectCardProps extends CardProps {
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
  ...props
}: FinanceProjectCardProps) {
  const { locale } = useSettingsStore();
  const { financeCategories, financeClients } = useFinanceStore();
  const [
    isAdjustmentFormOpen,
    { open: openAdjustmentForm, close: closeAdjustmentForm },
  ] = useDisclosure(false);
  const { hovered, ref: hoverRef } = useHover();
  const ref = useClickOutside(() => {
    closeAdjustmentForm();
  });
  const mergedRef = mergeRefs(ref, hoverRef);
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
      radius="lg"
      p="md"
      w="100%"
      h="100%"
      bg="light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))"
      shadow="md"
      style={{
        cursor: isAdjustmentFormOpen ? "default" : "pointer",
        border: isSelected
          ? "2px solid var(--mantine-color-blue-5)"
          : hovered || isAdjustmentFormOpen
            ? "1px solid light-dark(var(--mantine-color-blue-5), var(--mantine-color-blue-8))"
            : "",
        flexDirection: "row",
        alignItems: "center",
      }}
      onClick={(e) => {
        if (selectedModeActive) {
          onToggleSelected(e as any);
        } else {
          openAdjustmentForm();
        }
      }}
      ref={mergedRef}
      {...props}
    >
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
        gap={0}
      >
        <Collapse in={isAdjustmentFormOpen}>
          <Group
            justify="space-between"
            style={{
              borderBottom:
                "1px solid light-dark(var(--mantine-color-dark-5), var(--mantine-color-gray-6))",
            }}
            pb="xs"
            mb="xs"
          >
            <PayoutActionIcon onClick={() => {}} />
            <Button variant="outline" leftSection={<IconLinkPlus />} size="xs">
              Link with Work Project
            </Button>
            <DeleteActionIcon onClick={() => {}} />
          </Group>w
        </Collapse>
        <Stack>
          <Group justify="space-between">
            <Card
              withBorder
              radius="lg"
              p="xs"
              bg="light-dark(var(--mantine-color-white), var(--mantine-color-dark-9))"
            >
              <Group>
                <Text c={totalAmount > 0 ? "green" : "red"} fw={600}>
                  {formatMoney(totalAmount, project.currency, locale)}
                </Text>
                <Text fw={700}>{project.title}</Text>
              </Group>
            </Card>
            <Stack>
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
              <Text c="dimmed" size="xs">
                {financeCategory?.title}
              </Text>
            </Stack>
          </Group>
          <Group align="flex-start">
            {project.adjustments.length > 0 && (
              <Text fw={600} c={project.start_amount > 0 ? "green" : "red"}>
                {formatMoney(project.start_amount, project.currency, locale)}
              </Text>
            )}
            <Stack gap={0}>
              <Stack gap="xs">
                {project.adjustments.map((adjustment) => (
                  <FinanceAdjustmentRow
                    key={adjustment.id}
                    adjustment={adjustment}
                    currency={project.currency}
                  />
                ))}
              </Stack>
              <Collapse in={isAdjustmentFormOpen}>
                <Box mt="xs">
                  <IconArrowDown color="light-dark(var(--mantine-color-teal-6), var(--mantine-color-teal-4))" />
                </Box>
              </Collapse>
            </Stack>
          </Group>
        </Stack>
        <Collapse in={isAdjustmentFormOpen}>
          <Stack align="center">
            <FinanceAdjustmentForm
              onClose={closeAdjustmentForm}
              projectId={project.id}
            />
          </Stack>
        </Collapse>
      </Stack>
    </Card>
  );
}
