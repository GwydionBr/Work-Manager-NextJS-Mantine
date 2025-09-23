"use client";

import {
  useDisclosure,
  useClickOutside,
  useHover,
  mergeRefs,
} from "@mantine/hooks";
import { useSettingsStore } from "@/stores/settingsStore";

import {
  Card,
  CardProps,
  Collapse,
  Group,
  HoverCard,
  Stack,
  Text,
  Box,
  Transition,
  Badge,
  Divider,
  ThemeIcon,
  Menu,
} from "@mantine/core";

import { FinanceProject } from "@/types/finance.types";
import { formatMoney } from "@/utils/formatFunctions";
import FinanceAdjustmentForm from "./FinanceAdjustmentForm";
import FinanceAdjustmentRow from "./FinanceAdjustmentRow";
import FinanceClientCard from "../FinanceClient/FinanceClientCard";
import SelectActionIcon from "@/components/UI/ActionIcons/SelectActionIcon";
import {
  IconArrowDown,
  IconLinkPlus,
  IconCurrencyDollar,
  IconUser,
  IconTag,
  IconTrendingUp,
  IconTrendingDown,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import MoreActionIcon from "@/components/UI/ActionIcons/MoreActionIcon";

interface FinanceProjectCardProps extends CardProps {
  project: FinanceProject;
  selectedModeActive: boolean;
  isSelected: boolean;
  onToggleSelected: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onDelete: () => void;
  setEditProject: (project: FinanceProject) => void;
  onOpenEditProject: () => void;
}

export default function FinanceProjectCard({
  project,
  selectedModeActive,
  isSelected,
  onToggleSelected,
  onDelete,
  setEditProject,
  onOpenEditProject,
  ...props
}: FinanceProjectCardProps) {
  const { locale } = useSettingsStore();
  const [
    isAdjustmentFormOpen,
    { open: openAdjustmentForm, close: closeAdjustmentForm },
  ] = useDisclosure(false);
  const { hovered, ref: hoverRef } = useHover();
  const [isMoreActionOpen, { open: openMoreAction, close: closeMoreAction }] =
    useDisclosure(false);
  const [isDropdownOpen, { open: openDropdown, close: closeDropdown }] =
    useDisclosure(false);

  const ref = useClickOutside(() => {
    if (!isMoreActionOpen && !isDropdownOpen) {
      closeAdjustmentForm();
    }
  });
  const mergedRef = mergeRefs(ref, hoverRef);
  const totalAmount = project.adjustments.reduce(
    (acc, adjustment) => acc + adjustment.amount,
    project.start_amount
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
      bg="light-dark(var(--mantine-color-white), var(--mantine-color-dark-6))"
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
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <Stack gap="xs" w="100%">
            <Group justify="space-between" align="center" w="100%">
              <Text size="xl" fw={700} c="dimmed" mb="xs">
                {project.title}
              </Text>

              <Transition mounted={isAdjustmentFormOpen}>
                {(styles) => (
                  <Menu
                    opened={isMoreActionOpen}
                    onClose={closeMoreAction}
                    position="bottom-end"
                  >
                    <Menu.Target>
                      <MoreActionIcon onClick={openMoreAction} style={styles} />
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Label>
                        {getLocalizedText("Finanz Projekt", "Finance Project")}
                      </Menu.Label>
                      <Menu.Divider />
                      <Menu.Item
                        leftSection={<IconLinkPlus size={16} />}
                        onClick={() => {}}
                      >
                        {getLocalizedText(
                          "Mit Arbeitsprojekt verknüpfen",
                          "Link with Work Project"
                        )}
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconEdit size={16} />}
                        onClick={() => {
                          setEditProject(project);
                          onOpenEditProject();
                        }}
                      >
                        <Text>{getLocalizedText("Bearbeiten", "Edit")}</Text>
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconTrash size={16} />}
                        onClick={onDelete}
                      >
                        <Text>{getLocalizedText("Löschen", "Delete")}</Text>
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                )}
              </Transition>
            </Group>
            <Group gap="md" wrap="wrap">
              {project.clients.length > 0 &&
                project.clients.map((client) => (
                  <HoverCard key={client.id}>
                    <HoverCard.Target>
                      <Badge
                        color="blue"
                        variant="light"
                        leftSection={<IconUser size={12} />}
                        style={{ cursor: "pointer" }}
                      >
                        {client.name}
                      </Badge>
                    </HoverCard.Target>
                    <HoverCard.Dropdown>
                      <FinanceClientCard client={client} />
                    </HoverCard.Dropdown>
                  </HoverCard>
                ))}
              {project.categories.length > 0 &&
                project.categories.map((category) => (
                  <Badge
                    key={category.id}
                    color="violet"
                    variant="light"
                    leftSection={<IconTag size={12} />}
                  >
                    {category.title}
                  </Badge>
                ))}
              {/* <Badge
                color={project.paid ? "green" : "yellow"}
                variant="light"
                leftSection={<IconReceipt size={12} />}
              >
                {project.paid
                  ? getLocalizedText("Bezahlt", "Paid")
                  : getLocalizedText("Ausstehend", "Pending")}
              </Badge> */}
            </Group>
          </Stack>
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
            <Stack gap={5}>
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
            <Stack align="center">
              <IconArrowDown color="var(--mantine-color-teal-6)" />
              <FinanceAdjustmentForm
                onClose={closeAdjustmentForm}
                projectId={project.id}
                onDropdownOpen={openDropdown}
                onDropdownClose={closeDropdown}
              />
            </Stack>
          </Card>
        </Collapse>
      </Stack>
    </Card>
  );
}
