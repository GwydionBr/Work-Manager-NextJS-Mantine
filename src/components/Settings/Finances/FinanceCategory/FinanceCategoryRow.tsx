import { Card, Group, Stack, Text } from "@mantine/core";
import { Tables } from "@/types/db.types";

interface FinanceCategoryRowProps {
  category: Tables<"finance_category">;
}

export default function FinanceCategoryRow({
  category,
}: FinanceCategoryRowProps) {
  return (
    <Card
      bg="light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))"
      withBorder
      key={category.id}
      radius="md"
      p="md"
      shadow="md"
      w="100%"
      maw={500}
    >
      <Group>
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
