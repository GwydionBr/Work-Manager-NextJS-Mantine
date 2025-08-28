"use client";

import { useFinanceStore } from "@/stores/financeStore";
import { useSettingsStore } from "@/stores/settingsStore";

import { Divider, Grid, Group, Stack, Text } from "@mantine/core";
import FinanceCategoryForm from "@/components/Finances/Form/FinanceCategoryForm";
import classes from "./FinanceSettings.module.css";

export default function FinanceCategorySettings() {
  const { financeCategories } = useFinanceStore();
  const { locale } = useSettingsStore();

  return (
    <Grid w="100%">
      <Grid.Col span={6}>
        <Stack align="center" w="100%">
          <Text fw={500} mb="md">
            {locale === "de-DE" ? "Alle Kategorien" : "All Categories"}
          </Text>
          <Stack gap="xs" align="flex-start">
            {financeCategories.map((category) => (
              <Text fz="sm" key={category.id} c="dimmed" fw={500}>
                {category.title}
              </Text>
            ))}
          </Stack>
        </Stack>
      </Grid.Col>
      <Grid.Col span={6}>
        <Group w="100%" align="flex-start">
          <Divider orientation="vertical" className={classes.divider} />
          <Stack align="center" w="90%">
            <Text fw={500} mb="md">
              {locale === "de-DE" ? "Kategorie hinzufügen" : "Add Category"}
            </Text>
            <FinanceCategoryForm onClose={() => {}} />
          </Stack>
        </Group>
      </Grid.Col>
    </Grid>
  );
}
