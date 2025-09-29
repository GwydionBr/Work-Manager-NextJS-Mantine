"use client ";

import { useMemo, useState, useEffect } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useFinanceStore } from "@/stores/financeStore";
import { useSettingsStore } from "@/stores/settingsStore";

import {
  Card,
  Popover,
  MultiSelect,
  Group,
  Button,
  Box,
  Collapse,
  Fieldset,
  Stack,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";

import { Tables } from "@/types/db.types";
import FinanceCategorySingleBadge from "./FinanceCategorySingleBadge";
import FinanceCategoryForm from "./FinanceCategoryForm";

interface FinanceCategoryBadgesProps {
  categories: Tables<"finance_category">[];
  onPopoverOpen: () => void;
  onPopoverClose: (categories: Tables<"finance_category">[] | null) => void;
}

export default function FinanceCategoryBadges({
  categories,
  onPopoverOpen,
  onPopoverClose,
}: FinanceCategoryBadgesProps) {
  const { locale } = useSettingsStore();
  const { financeCategories } = useFinanceStore();

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categories.map((c) => c.id)
  );

  useEffect(() => {
    setSelectedCategories(categories.map((c) => c.id));
  }, [categories]);

  const [
    isCategoryFormOpen,
    { open: openCategoryForm, close: closeCategoryForm },
  ] = useDisclosure(false);
  const [
    isCategoryPopoverOpen,
    { open: openCategoryPopover, close: closeCategoryPopover },
  ] = useDisclosure(false);

  const handlePopoverOpen = () => {
    onPopoverOpen();
    openCategoryPopover();
  };

  const handlePopoverClose = () => {
    onPopoverClose(
      currentCategorySelection !== categories ? currentCategorySelection : null
    );
    closeCategoryForm();
    closeCategoryPopover();
  };

  const currentCategorySelection = useMemo(() => {
    return financeCategories.filter((category) =>
      selectedCategories.includes(category.id)
    );
  }, [financeCategories, selectedCategories]);

  return (
    <Box>
      <Popover
        trapFocus
        onDismiss={handlePopoverClose}
        opened={isCategoryPopoverOpen}
        onClose={handlePopoverClose}
      >
        <Popover.Target>
          <Group
            onClick={(e) => {
              e.stopPropagation();
              handlePopoverOpen();
            }}
            style={{
              cursor: "pointer",
            }}
          >
            {currentCategorySelection.length > 0 ? (
              currentCategorySelection.map((category) => (
                <FinanceCategorySingleBadge
                  key={category.id}
                  category={category}
                />
              ))
            ) : (
              <FinanceCategorySingleBadge />
            )}
          </Group>
        </Popover.Target>
        <Popover.Dropdown
          style={{
            border:
              "1px solid light-dark(var(--mantine-color-gray-2), var(--mantine-color-dark-2))",
          }}
        >
          <Stack align="center">
            <Group>
              <MultiSelect
                searchable
                clearable
                comboboxProps={{ withinPortal: false }}
                hidePickedOptions
                nothingFoundMessage={
                  locale === "de-DE"
                    ? "Keine Kategorien gefunden"
                    : "No categories found"
                }
                data={financeCategories.map((c) => ({
                  label: c.title,
                  value: c.id,
                }))}
                value={selectedCategories}
                onChange={(value) => {
                  setSelectedCategories(value);
                }}
                data-autofocus
              />
              <Button
                onClick={openCategoryForm}
                size="compact-sm"
                variant="subtle"
                leftSection={<IconPlus size={16} />}
              >
                {locale === "de-DE" ? "Kategorie" : "Category"}
              </Button>
            </Group>
            <Collapse in={isCategoryFormOpen}>
              <Fieldset
                legend={locale === "de-DE" ? "Neue Kategorie" : "New Category"}
                mt="lg"
                maw={400}
                miw={300}
              >
                <FinanceCategoryForm
                  onClose={closeCategoryForm}
                  onSuccess={(category) => {
                    setSelectedCategories((prev) => [...prev, category.id]);
                    closeCategoryForm();
                  }}
                />
              </Fieldset>
            </Collapse>
          </Stack>
        </Popover.Dropdown>
      </Popover>
    </Box>
  );
}
