"use client";

import { useHover, useDisclosure } from "@mantine/hooks";
import { useSettingsStore } from "@/stores/settingsStore";

import { Card, Group, Stack, Text } from "@mantine/core";
import { Tables } from "@/types/db.types";
import SelectActionIcon from "@/components/UI/ActionIcons/SelectActionIcon";
import React from "react";

interface FinanceCategoryRowProps {
  category: Tables<"finance_category">;
  selectedModeActive: boolean;
  isSelected?: boolean;
  onToggleSelected?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function FinanceCategoryRow({
  category,
  selectedModeActive,
  isSelected,
  onToggleSelected,
}: FinanceCategoryRowProps) {
  const { hovered, ref } = useHover();
  const { locale } = useSettingsStore();

  return (
    <Card
      bg={
        isSelected
          ? "light-dark(var(--mantine-color-blue-0), var(--mantine-color-dark-5))"
          : "light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))"
      }
      withBorder
      key={category.id}
      radius="md"
      p="md"
      shadow="md"
      w="100%"
      maw={500}
      ref={ref}
    >
      <Group justify="flex-start">
        {selectedModeActive && (
          <SelectActionIcon
            tooltipLabel={
              locale === "de-DE" ? "Kategorie auswählen" : "Select category"
            }
            onClick={onToggleSelected ?? (() => {})}
            selected={isSelected}
          />
        )}
        <Stack gap="xs">
          <Text fz="sm" fw={500}>
            {category.title}
          </Text>
          <Text fz="xs" c="dimmed">
            {category.description}
          </Text>
        </Stack>
      </Group>
    </Card>
  );
}
