"use client ";

import { useState } from "react";
import { useDisclosure, useHover } from "@mantine/hooks";
import { useFinanceStore } from "@/stores/financeStore";
import { useSettingsStore } from "@/stores/settingsStore";

import { Badge, Card, Popover, MultiSelect } from "@mantine/core";
import { IconTag } from "@tabler/icons-react";

import { Tables } from "@/types/db.types";

interface FinanceClientBadgeProps {
  category: Tables<"finance_category">;
  onPopoverOpen: () => void;
  onPopoverClose: () => void;
}

export default function FinanceClientBadge({
  category,
  onPopoverOpen,
  onPopoverClose,
}: FinanceClientBadgeProps) {
  const { locale } = useSettingsStore();
  const { financeCategories } = useFinanceStore();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    category.id,
  ]);
  const [
    isClientPopoverOpen,
    { open: openClientPopover, close: closeClientPopover },
  ] = useDisclosure(false);
  const [isDropdownOpen, { open: openDropdown, close: closeDropdown }] =
    useDisclosure(false);
  const { hovered, ref } = useHover();

  const handlePopoverOpen = () => {
    onPopoverOpen();
    openClientPopover();
  };

  const handlePopoverClose = () => {
    if (!isDropdownOpen) {
      onPopoverClose();
      closeClientPopover();
    }
  };

  return (
    <Popover
      trapFocus
      returnFocus
      key={category.id}
      onDismiss={handlePopoverClose}
      opened={isClientPopoverOpen}
      onClose={handlePopoverClose}
    >
      <Popover.Target ref={ref}>
        <Badge
          ref={ref}
          onClick={(e) => {
            e.stopPropagation();
            handlePopoverOpen();
          }}
          color="grape"
          variant="light"
          leftSection={<IconTag size={12} />}
          style={{
            cursor: "pointer",
            border: hovered
              ? "1px solid var(--mantine-color-grape-5)"
              : "1px solid transparent",
          }}
        >
          {category.title}
        </Badge>
      </Popover.Target>
      <Popover.Dropdown p={0}>
        <Card miw={200}>
          <MultiSelect
            onDropdownClose={closeDropdown}
            onDropdownOpen={openDropdown}
            searchable
            clearable
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
        </Card>
      </Popover.Dropdown>
    </Popover>
  );
}
