"use client";

import { useFinanceStore } from "@/stores/financeStore";

import { Divider, Grid, Group, Stack, Text } from "@mantine/core";
import FinanceCategoryForm from "../Form/FinanceCategoryForm";

export default function FinanceCategorySettings() {
  const { financeCategories } = useFinanceStore();

  return (
    <Grid w="100%" h="100%">
      <Grid.Col span={6}>
        <Stack align="center" w="100%">
          <Text>All Categories</Text>
          {financeCategories.map((category) => (
            <Text fz="sm" key={category.id} c="dimmed">
              {category.title}
            </Text>
          ))}
        </Stack>
      </Grid.Col>
      <Grid.Col span={6}>
        <Group w="100%">
          <Divider orientation="vertical" />
          <Stack align="center" w="90%">
            <Text>Add Category</Text>
            <FinanceCategoryForm onClose={() => {}} />
          </Stack>
        </Group>
      </Grid.Col>
    </Grid>
  );
}
