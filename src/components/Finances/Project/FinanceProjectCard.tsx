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
  Badge,
  Divider,
  ThemeIcon,
  Tooltip,
  Flex,
} from "@mantine/core";

import { FinanceProject } from "@/types/finance.types";
import { formatDate, formatMoney } from "@/utils/formatFunctions";
import FinanceAdjustmentForm from "./FinanceAdjustmentForm";
import FinanceAdjustmentRow from "./FinanceAdjustmentRow";
import FinanceClientCard from "../FinanceClient/FinanceClientCard";
import SelectActionIcon from "@/components/UI/ActionIcons/SelectActionIcon";
import {
  IconArrowDown,
  IconLinkPlus,
  IconCurrencyDollar,
  IconCalendar,
  IconUser,
  IconTag,
  IconTrendingUp,
  IconTrendingDown,
  IconReceipt,
  IconEdit,
} from "@tabler/icons-react";
import PayoutActionIcon from "@/components/UI/ActionIcons/PayoutActionIcon";
import DeleteActionIcon from "@/components/UI/ActionIcons/DeleteActionIcon";

interface FinanceProjectCardProps extends CardProps {
  project: FinanceProject;
  selectedModeActive: boolean;
  isSelected: boolean;
  onToggleSelected: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onDelete: () => void;
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

  const hasAdjustments = project.adjustments.length > 0;
  const isPositive = totalAmount > 0;
  const adjustmentTotal = project.adjustments.reduce(
    (acc, adj) => acc + adj.amount,
    0
  );

  const getLocalizedText = (de: string, en: string) => {
    return locale === "de-DE" ? de : en;
  };

  return (
    <Card
      withBorder
      radius="lg"
      p="lg"
      w="100%"
      bg="light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))"
      shadow="sm"
      style={{
        cursor: isAdjustmentFormOpen ? "default" : "pointer",
        border: isSelected
          ? "2px solid var(--mantine-color-blue-5)"
          : hovered || isAdjustmentFormOpen
            ? "1px solid light-dark(var(--mantine-color-blue-5), var(--mantine-color-blue-8))"
            : "",
        transition: "all 0.2s ease",
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
      <Box pos="absolute" top="xs" right="xl">
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
        gap="md"
        ml={selectedModeActive ? 50 : 0}
        style={{ transition: "margin 0.2s ease" }}
      >
        {/* Selection Icon */}

        {/* Action Bar */}
        <Collapse in={isAdjustmentFormOpen}>
          <Card
            p="sm"
            withBorder
            shadow="sm"
            radius="md"
            bg="light-dark(var(--mantine-color-white), var(--mantine-color-dark-7))"
            mb="md"
          >
            <Group justify="space-between" align="center">
              <Group gap="xs">
                <PayoutActionIcon onClick={() => {}} />
                <Button
                  variant="outline"
                  leftSection={<IconLinkPlus />}
                  size="xs"
                >
                  {getLocalizedText(
                    "Mit Arbeitsprojekt verknüpfen",
                    "Link with Work Project"
                  )}
                </Button>
              </Group>
              <DeleteActionIcon onClick={onDelete} />
            </Group>
          </Card>
        </Collapse>

        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <Box style={{ flex: 1 }}>
            <Text size="xl" fw={700} c="dimmed" mb="xs">
              {project.title}
            </Text>
            <Group gap="md" wrap="wrap">
              {financeClient && (
                <HoverCard>
                  <HoverCard.Target>
                    <Badge
                      color="blue"
                      variant="light"
                      leftSection={<IconUser size={12} />}
                      style={{ cursor: "pointer" }}
                    >
                      {financeClient.name}
                    </Badge>
                  </HoverCard.Target>
                  <HoverCard.Dropdown>
                    <FinanceClientCard client={financeClient} />
                  </HoverCard.Dropdown>
                </HoverCard>
              )}
              {financeCategory && (
                <Badge
                  color="violet"
                  variant="light"
                  leftSection={<IconTag size={12} />}
                >
                  {financeCategory.title}
                </Badge>
              )}
              {project.due_date && (
                <Badge
                  color="orange"
                  variant="light"
                  leftSection={<IconCalendar size={12} />}
                >
                  {formatDate(new Date(project.due_date), locale)}
                </Badge>
              )}
              <Badge
                color={project.paid ? "green" : "yellow"}
                variant="light"
                leftSection={<IconReceipt size={12} />}
              >
                {project.paid
                  ? getLocalizedText("Bezahlt", "Paid")
                  : getLocalizedText("Ausstehend", "Pending")}
              </Badge>
            </Group>
          </Box>
        </Group>

        <Divider />

        {/* Financial Information */}
        <Group justify="space-between" align="center">
          <Stack gap="xs">
            <Text size="sm" c="dimmed" fw={500}>
              {getLocalizedText("Gesamtbetrag", "Total Amount")}
            </Text>
            <Group gap="xs" align="center">
              <ThemeIcon
                size="md"
                color={isPositive ? "green" : "red"}
                variant="light"
              >
                <IconCurrencyDollar size={16} />
              </ThemeIcon>
              <Text size="xl" fw={700} c={isPositive ? "green" : "red"}>
                {formatMoney(totalAmount, project.currency, locale)}
              </Text>
            </Group>
          </Stack>

          {hasAdjustments && (
            <Stack gap="xs" align="flex-end">
              <Text size="sm" c="dimmed" fw={500}>
                {getLocalizedText("Anpassungen", "Adjustments")}
              </Text>
              <Group gap="xs" align="center">
                <ThemeIcon
                  size="sm"
                  color={adjustmentTotal > 0 ? "green" : "red"}
                  variant="light"
                >
                  {adjustmentTotal > 0 ? (
                    <IconTrendingUp size={14} />
                  ) : (
                    <IconTrendingDown size={14} />
                  )}
                </ThemeIcon>
                <Text
                  size="lg"
                  fw={600}
                  c={adjustmentTotal > 0 ? "green" : "red"}
                >
                  {adjustmentTotal > 0 ? "+" : ""}
                  {formatMoney(adjustmentTotal, project.currency, locale)}
                </Text>
              </Group>
            </Stack>
          )}
        </Group>

        {/* Adjustments List */}
        {hasAdjustments && (
          <Box>
            <Text size="sm" c="dimmed" fw={500} mb="xs">
              {getLocalizedText("Anpassungen", "Adjustments")} (
              {project.adjustments.length})
            </Text>
            <Stack gap="xs">
              {project.adjustments.map((adjustment) => (
                <FinanceAdjustmentRow
                  key={adjustment.id}
                  adjustment={adjustment}
                  currency={project.currency}
                />
              ))}
            </Stack>
          </Box>
        )}

        {/* Adjustment Form */}
        <Collapse in={isAdjustmentFormOpen}>
          <Card
            p="md"
            withBorder
            shadow="sm"
            radius="md"
            bg="light-dark(var(--mantine-color-white), var(--mantine-color-dark-7))"
          >
            <Group justify="center" mb="sm">
              <IconArrowDown color="var(--mantine-color-teal-6)" />
            </Group>
            <FinanceAdjustmentForm
              onClose={closeAdjustmentForm}
              projectId={project.id}
            />
          </Card>
        </Collapse>
      </Stack>
    </Card>
  );
}
