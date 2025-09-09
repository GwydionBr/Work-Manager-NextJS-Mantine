"use client";

import { useDisclosure } from "@mantine/hooks";
import { useFinanceStore } from "@/stores/financeStore";
import { useSettingsStore } from "@/stores/settingsStore";

import { Stack, Text, Box, Skeleton, Group, Popover } from "@mantine/core";
import FinanceCategoryRow from "./FinanceCategoryRow";
import PlusActionIcon from "@/components/UI/ActionIcons/PlusActionIcon";
import FinanceCategoryForm from "@/components/Finances/Form/FinanceCategoryForm";

export default function FinanceCategorySettings() {
  const { financeCategories, isFetching } = useFinanceStore();
  const { locale } = useSettingsStore();
  const [
    isCategoryFormOpen,
    { open: openCategoryForm, close: closeCategoryForm },
  ] = useDisclosure(false);

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
              financeCategories.map((category) => (
                <FinanceCategoryRow key={category.id} category={category} />
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
