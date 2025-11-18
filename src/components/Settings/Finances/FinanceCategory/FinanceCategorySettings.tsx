"use client";

import { useEffect, useCallback, useMemo, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useSettingsStore } from "@/stores/settingsStore";
import {
  useDeleteFinanceCategoryMutation,
  useFinanceCategoriesQuery,
} from "@/utils/queries/finances/use-finance-category";

import { Stack, Text, Skeleton, Group, Collapse, List } from "@mantine/core";
import { IconCategoryPlus } from "@tabler/icons-react";
import FinanceCategoryRow from "@/components/Settings/Finances/FinanceCategory/FinanceCategoryRow";
import FinanceSettingsHeader from "@/components/Settings/Finances/FinanceSettingsHeader";
import FinanceCategoryForm from "@/components/Finances/Category/FinanceCategoryForm";
import DeleteActionIcon from "@/components/UI/ActionIcons/DeleteActionIcon";
import SelectActionIcon from "@/components/UI/ActionIcons/SelectActionIcon";
import { showDeleteConfirmationModal } from "@/utils/notificationFunctions";

export default function FinanceCategorySettings() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(
    null
  );
  const { data: financeCategories = [], isPending: isFetchingCategories } =
    useFinanceCategoriesQuery();
  const { mutate: deleteFinanceCategoriesMutation } =
    useDeleteFinanceCategoryMutation();
  const { locale, getLocalizedText } = useSettingsStore();
  const [
    isCategoryFormOpen,
    { open: openCategoryForm, close: closeCategoryForm },
  ] = useDisclosure(false);
  const [selectedModeActive, { toggle: toggleSelectedMode }] =
    useDisclosure(false);
  useEffect(() => {
    if (!selectedModeActive) {
      setSelectedCategories([]);
    }
  }, [selectedModeActive]);

  const categoryIdList = useMemo(
    () => financeCategories.map((c) => c.id),
    [financeCategories]
  );

  const toggleAllCategories = useCallback(() => {
    if (selectedCategories.length > 0) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(financeCategories.map((c) => c.id));
    }
  }, [financeCategories, selectedCategories]);

  const onDelete = (ids: string[]) => {
    showDeleteConfirmationModal(
      getLocalizedText("Kategorie löschen", "Delete Category"),
      <Stack>
        <Text>
          {getLocalizedText(
            "Sind Sie sicher, dass Sie diese Kategorien löschen möchten",
            "Are you sure you want to delete these categories?"
          )}
        </Text>
        <List>
          {financeCategories
            .filter((category) => ids.includes(category.id))
            .map((category) => (
              <List.Item key={category.id}>
                <Stack gap={0}>
                  <Text>{category.title}</Text>
                  <Text fz="xs" c="dimmed">
                    {category.description}
                  </Text>
                </Stack>
              </List.Item>
            ))}
        </List>
      </Stack>,
      () => {
        deleteFinanceCategoriesMutation(ids);
      },
      locale
    );
  };

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
        <FinanceSettingsHeader
          onAdd={openCategoryForm}
          addDisabled={isFetchingCategories}
          selectDisabled={
            isFetchingCategories || financeCategories.length === 0
          }
          selectedModeActive={selectedModeActive}
          toggleSelectedMode={toggleSelectedMode}
          modalTitle={
            <Group>
              <IconCategoryPlus />
              <Text>
                {getLocalizedText("Kategorie hinzufügen", "Add Category")}
              </Text>
            </Group>
          }
          modalChildren={<FinanceCategoryForm onClose={closeCategoryForm} />}
          modalOpened={isCategoryFormOpen}
          modalOnClose={closeCategoryForm}
          titleIcon={<IconCategoryPlus />}
          titleText={getLocalizedText(
            "Finanz Kategorien",
            "Finance Categories"
          )}
        />
        {!isFetchingCategories && financeCategories.length === 0 ? (
          <Text fz="sm" c="dimmed">
            {getLocalizedText(
              "Keine Kategorien gefunden",
              "No categories found"
            )}
          </Text>
        ) : (
          <Stack gap="xs" align="center" w="100%" maw={500}>
            <Collapse in={selectedModeActive} w="100%">
              <Group w="100%" justify="space-between">
                <Group
                  onClick={toggleAllCategories}
                  style={{ cursor: "pointer" }}
                >
                  <SelectActionIcon
                    onClick={() => {}}
                    selected={
                      selectedCategories.length === financeCategories.length
                    }
                    partiallySelected={
                      selectedCategories.length > 0 &&
                      selectedCategories.length < financeCategories.length
                    }
                  />
                  <Text fz="sm" c="dimmed">
                    {getLocalizedText("Alle", "All")}
                  </Text>
                </Group>
                <DeleteActionIcon
                  disabled={selectedCategories.length === 0}
                  onClick={() => onDelete(selectedCategories)}
                />
              </Group>
            </Collapse>
            {!isFetchingCategories &&
              financeCategories.map((category, index) => (
                <FinanceCategoryRow
                  key={category.id}
                  category={category}
                  selectedModeActive={selectedModeActive}
                  isSelected={selectedCategories.includes(category.id)}
                  onToggleSelected={(e) =>
                    toggleCategorySelection(category.id, index, e.shiftKey)
                  }
                  onDelete={onDelete}
                />
              ))}
            {isFetchingCategories &&
              Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} w="100%" h={60} radius="md" maw={500} />
              ))}
          </Stack>
        )}
      </Stack>
    </Group>
  );
}
