"use client";

import { useEffect } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useFinanceStore } from "@/stores/financeStore";
import { useSettingsStore } from "@/stores/settingsStore";

import {
  Stack,
  Text,
  Skeleton,
  Group,
  Popover,
  Collapse,
  List,
} from "@mantine/core";
import FinanceCategoryRow from "./FinanceCategoryRow";
import PlusActionIcon from "@/components/UI/ActionIcons/PlusActionIcon";
import FinanceCategoryForm from "@/components/Finances/Form/FinanceCategoryForm";
import { useCallback, useMemo, useState } from "react";
import DeleteActionIcon from "@/components/UI/ActionIcons/DeleteActionIcon";
import SelectActionIcon from "@/components/UI/ActionIcons/SelectActionIcon";
import ConfirmDeleteModal from "@/components/UI/ConfirmDeleteModal";

export default function FinanceCategorySettings() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(
    null
  );
  const { financeCategories, isFetching, deleteFinanceCategories } =
    useFinanceStore();
  const { locale } = useSettingsStore();
  const [
    isCategoryFormOpen,
    { open: openCategoryForm, close: closeCategoryForm },
  ] = useDisclosure(false);
  const [selectedModeActive, { toggle: toggleSelectedMode }] =
    useDisclosure(false);
  const [
    deleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);
  const [modalInformation, setModalInformation] = useState<{
    title: string;
    message: React.ReactNode;
    onDelete: () => void;
  } | null>(null);
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

  const onDelete = useCallback(
    (ids: string[]) => {
      setModalInformation({
        title: locale === "de-DE" ? "Kategorie löschen" : "Delete Category",
        message:
          locale === "de-DE" ? (
            <Stack>
              <Text>
                Sind Sie sicher, dass Sie diese Kategorie
                {ids.length > 1 ? "n" : ""} löschen möchten?
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
            </Stack>
          ) : (
            <Stack>
              <Text>
                Are you sure you want to delete{" "}
                {ids.length > 1 ? "these categories" : "this category"}?
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
            </Stack>
          ),
        onDelete: async () => {
          const deleted = await deleteFinanceCategories(ids);
          if (deleted) {
            setSelectedCategories([]);
            closeDeleteModal();
          }
        },
      });
      openDeleteModal();
    },
    [financeCategories, locale, deleteFinanceCategories]
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
              <PlusActionIcon
                onClick={openCategoryForm}
                disabled={isFetching}
              />
            </Popover.Target>
            <Popover.Dropdown>
              <FinanceCategoryForm onClose={closeCategoryForm} />
            </Popover.Dropdown>
          </Popover>
          <Text fw={500} mb="md">
            {locale === "de-DE" ? "Alle Kategorien" : "All Categories"}
          </Text>
          <SelectActionIcon
            disabled={isFetching || financeCategories.length === 0}
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
                  />
                  <Text fz="sm" c="dimmed">
                    {locale === "de-DE" ? "Alle" : "All"}
                  </Text>
                </Group>
                <DeleteActionIcon
                  disabled={selectedCategories.length === 0}
                  onClick={() => onDelete(selectedCategories)}
                />
              </Group>
            </Collapse>
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
                  onDelete={onDelete}
                />
              ))}
            {isFetching &&
              Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} w="100%" h={60} radius="md" maw={500} />
              ))}
          </Stack>
        )}
      </Stack>
      <ConfirmDeleteModal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        onDelete={modalInformation?.onDelete || (() => {})}
        title={modalInformation?.title || ""}
        message={modalInformation?.message || ""}
      />
    </Group>
  );
}
