"use client";

import { useDisclosure } from "@mantine/hooks";
import { useFinanceStore } from "@/stores/financeStore";
import { useSettingsStore } from "@/stores/settingsStore";

import { Stack, Text, Skeleton, Group, Popover } from "@mantine/core";
import FinanceCategoryRow from "./FinanceCategoryRow";
import PlusActionIcon from "@/components/UI/ActionIcons/PlusActionIcon";
import FinanceCategoryForm from "@/components/Finances/Form/FinanceCategoryForm";
import SelectActionIcon from "@/components/UI/ActionIcons/SelectActionIcon";
import PencilActionIcon from "@/components/UI/ActionIcons/PencilActionIcon";
import { useCallback, useMemo, useState } from "react";

export default function FinanceCategorySettings() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(
    null
  );
  const { financeCategories, isFetching } = useFinanceStore();
  const { locale } = useSettingsStore();
  const [
    isCategoryFormOpen,
    { open: openCategoryForm, close: closeCategoryForm },
  ] = useDisclosure(false);
  const [selectedModeActive, { toggle: toggleSelectedMode }] =
    useDisclosure(false);

  const categoryIdList = useMemo(
    () => financeCategories.map((c) => c.id),
    [financeCategories]
  );

  const toggleCategorySelection = useCallback(
    (categoryId: string, index: number, range: boolean) => {
      if (range && lastSelectedIndex !== null) {
        const start = Math.min(lastSelectedIndex, index);
        const end = Math.max(lastSelectedIndex, index);
        const rangeIds = categoryIdList.slice(start, end + 1);
        setSelectedCategories((prev) =>
          Array.from(new Set([...prev, ...rangeIds]))
        );
      } else {
        setSelectedCategories((prev) =>
          prev.includes(categoryId)
            ? prev.filter((id) => id !== categoryId)
            : [...prev, categoryId]
        );
        setLastSelectedIndex(index);
      }
    },
    [categoryIdList, lastSelectedIndex]
  );

  return (
    <Group w="100%">
      <Stack align="center" w="100%">
        <Group justify="space-between" w="100%">
          <Popover
            opened={isCategoryFormOpen}
            onClose={closeCategoryForm}
            closeOnClickOutside
            withOverlay
            trapFocus
            returnFocus
          >
            <Popover.Target>
              <PlusActionIcon onClick={openCategoryForm} />
            </Popover.Target>
            <Popover.Dropdown>
              <FinanceCategoryForm onClose={closeCategoryForm} />
            </Popover.Dropdown>
          </Popover>
          <Text fw={500} mb="md">
            {locale === "de-DE" ? "Alle Kategorien" : "All Categories"}
          </Text>
          <PencilActionIcon
            tooltipLabel={
              locale === "de-DE"
                ? "Aktiviere Mehrfachauswahl"
                : "Activate bulk select"
            }
            filled={selectedModeActive}
            onClick={toggleSelectedMode}
          />
        </Group>
        {!isFetching && financeCategories.length === 0 ? (
          <Text fz="sm" c="dimmed">
            {locale === "de-DE"
              ? "Keine Kategorien gefunden"
              : "No categories found"}
          </Text>
        ) : (
          <Stack gap="xs" align="center" w="100%">
            {!isFetching &&
              financeCategories.map((category, index) => (
                <FinanceCategoryRow
                  key={category.id}
                  category={category}
                  selectedModeActive={selectedModeActive}
                  isSelected={selectedCategories.includes(category.id)}
                  onToggleSelected={(e) =>
                    toggleCategorySelection(category.id, index, e.shiftKey)
                  }
                />
              ))}
            {isFetching &&
              Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} w="100%" h={60} radius="md" maw={500} />
              ))}
          </Stack>
        )}
      </Stack>
    </Group>
  );
}
