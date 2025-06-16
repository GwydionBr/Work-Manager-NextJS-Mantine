"use client";

import { useFinanceStore } from "@/stores/financeStore";

import { Grid, Stack, Text } from "@mantine/core";
import FinanceCategoryForm from "../Form/FinanceCategoryForm";

export default function FinanceCategorySettings() {
  const { financeCategories } = useFinanceStore();

  return (
    <Grid w="100%" h="100%">
      <Grid.Col span={6}>
        <Stack>
          <Text>All Categories</Text>
          {financeCategories.map((category) => (
            <Text fz="sm" key={category.id} c="dimmed">
              {category.title}
            </Text>
          ))}
        </Stack>
        </Grid.Col>
      <Grid.Col span={6}>
        <FinanceCategoryForm onClose={() => {}} />
      </Grid.Col>
    </Grid>
  );
}
