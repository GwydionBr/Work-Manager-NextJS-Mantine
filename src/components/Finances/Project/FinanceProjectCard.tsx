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
  Stack,
  Text,
  Box,
  Transition,
  Divider,
  ThemeIcon,
  Menu,
  Grid,
  Popover,
} from "@mantine/core";

import { FinanceProject } from "@/types/finance.types";
import { formatMoney } from "@/utils/formatFunctions";
import FinanceAdjustmentForm from "./FinanceAdjustment/FinanceAdjustmentForm";
import FinanceAdjustmentRow from "./FinanceAdjustment/FinanceAdjustmentRow";
import SelectActionIcon from "@/components/UI/ActionIcons/SelectActionIcon";
import {
  IconLinkPlus,
  IconTrendingUp,
  IconTrendingDown,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import MoreActionIcon from "@/components/UI/ActionIcons/MoreActionIcon";
import PlusActionIcon from "@/components/UI/ActionIcons/PlusActionIcon";
import FinanceClientBadge from "../FinanceClient/FinanceClientBadge";
import FinanceCategoryBadges from "../FinanceCategoryBadges";
import { Tables } from "@/types/db.types";

interface FinanceProjectCardProps extends CardProps {
  project: FinanceProject;
  selectedModeActive: boolean;
  isSelected: boolean;
  editProjectModalOpened: boolean;
  onToggleSelected: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onDelete: () => void;
  setEditProject: (project: FinanceProject) => void;
  onOpenEditProject: () => void;
}

export default function FinanceProjectCard({
  project,
  selectedModeActive,
  isSelected,
  editProjectModalOpened,
  onToggleSelected,
  onDelete,
  setEditProject,
  onOpenEditProject,
  ...props
}: FinanceProjectCardProps) {
  const { locale } = useSettingsStore();
  const { updateFinanceProject } = useFinanceStore();
  const [isEditing, { open: openEditing, close: closeEditing }] =
    useDisclosure(false);
  const { hovered, ref: hoverRef } = useHover();
  const [isMoreActionOpen, { open: openMoreAction, close: closeMoreAction }] =
    useDisclosure(false);
  const [
    isBadgePopoverOpen,
    { open: openBadgePopover, close: closeBadgePopover },
  ] = useDisclosure(false);
  const [
    isAdjustmentFormOpen,
    { open: openAdjustmentForm, close: closeAdjustmentForm },
  ] = useDisclosure(false);
  const [isDropdownOpen, { open: openDropdown, close: closeDropdown }] =
    useDisclosure(false);

  const ref = useClickOutside(() => {
    if (
      !isMoreActionOpen &&
      !isDropdownOpen &&
      !isAdjustmentFormOpen &&
      !editProjectModalOpened &&
      !isBadgePopoverOpen
    ) {
      closeEditing();
    }
  });
  const mergedRef = mergeRefs(ref, hoverRef);
  const totalAmount = project.adjustments.reduce(
    (acc, adjustment) => acc + adjustment.amount,
    project.start_amount
  );

  const handleAdjustmentClose = () => {
    if (!isDropdownOpen) {
      closeAdjustmentForm();
    }
  };

  const handleCategoryClose = (
    updatedCategories: Tables<"finance_category">[] | null
  ) => {
    closeBadgePopover();
    if (updatedCategories) {
      updateFinanceProject({
        ...project,
        categories: updatedCategories,
      });
    }
  };

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
        cursor: isEditing ? "default" : "pointer",
        border: isSelected
          ? "2px solid var(--mantine-color-blue-5)"
          : hovered || isEditing
            ? "1px solid light-dark(var(--mantine-color-blue-5), var(--mantine-color-blue-8))"
            : "",
        transition: "all 0.2s ease",
      }}
      onClick={(e) => {
        if (selectedModeActive) {
          onToggleSelected(e as any);
        } else {
          if (!isBadgePopoverOpen) {
            openEditing();
          }
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
        <Group justify="space-between" align="center" w="100%">
          <Group align="center" gap="xs" flex={2}>
            <Text fw={700} c={isPositive ? "green" : "red"}>
              {formatMoney(totalAmount, project.currency, locale)}
            </Text>
            <Text c="dimmed" size="sm">
              ({formatMoney(project.start_amount, project.currency, locale)})
            </Text>
            <Text size="sm" fw={700}>
              {project.title}
            </Text>
          </Group>

          <Group gap="md" wrap="wrap" flex={2}>
            {project.finance_client && (
              <FinanceClientBadge
                key={project.finance_client.id}
                client={project.finance_client}
                onPopoverOpen={openBadgePopover}
                onPopoverClose={closeBadgePopover}
              />
            )}
            <FinanceCategoryBadges
              categories={project.categories}
              onPopoverOpen={openBadgePopover}
              onPopoverClose={handleCategoryClose}
            />
          </Group>

          {/* Right Side */}
          <Group flex={1} justify="space-between">
            {/* Adjustments */}
            <Group gap="xs" align="center">
              <Divider orientation="vertical" />
              {hasAdjustments && (
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
                  <Text fw={600} c={adjustmentTotal > 0 ? "green" : "red"}>
                    {adjustmentTotal > 0 ? "+" : ""}
                    {formatMoney(adjustmentTotal, project.currency, locale)}
                  </Text>
                </Group>
              )}
            </Group>
            {/* More Actions */}
            <Transition mounted={isEditing}>
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
        </Group>

        {/* Adjustment Form */}
        <Collapse in={isEditing}>
          <Stack>
            <Divider />
            {/* Adjustments List */}
            <Stack gap="xs">
              <Grid
                gutter="xs"
                mb={isAdjustmentFormOpen ? 110 : 0}
                style={{ transition: "margin 0.2s ease" }}
              >
                <Grid.Col span={4}>
                  <Text size="sm" c="dimmed" fw={500} mb="xs">
                    {getLocalizedText("Anpassungen", "Adjustments")} (
                    {project.adjustments.length})
                  </Text>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Group justify="center">
                    <Popover
                      trapFocus
                      returnFocus
                      opened={isAdjustmentFormOpen}
                      onDismiss={handleAdjustmentClose}
                      onClose={handleAdjustmentClose}
                      onOpen={openAdjustmentForm}
                    >
                      <Popover.Target>
                        <PlusActionIcon
                          variant={isAdjustmentFormOpen ? "light" : "subtle"}
                          onClick={openAdjustmentForm}
                          w="100%"
                        />
                      </Popover.Target>
                      <Popover.Dropdown p={0}>
                        <Card withBorder shadow="sm" radius="md">
                          <FinanceAdjustmentForm
                            onClose={handleAdjustmentClose}
                            projectId={project.id}
                            onDropdownOpen={openDropdown}
                            onDropdownClose={closeDropdown}
                          />
                        </Card>
                      </Popover.Dropdown>
                    </Popover>
                  </Group>
                </Grid.Col>
                <Grid.Col span={4}></Grid.Col>
              </Grid>
              {hasAdjustments && (
                <Stack gap={5}>
                  {project.adjustments
                    .sort((a, b) => b.created_at.localeCompare(a.created_at))
                    .map((adjustment) => (
                      <FinanceAdjustmentRow
                        key={adjustment.id}
                        adjustment={adjustment}
                        currency={project.currency}
                      />
                    ))}
                </Stack>
              )}
            </Stack>
          </Stack>
        </Collapse>
      </Stack>
    </Card>
  );
}
