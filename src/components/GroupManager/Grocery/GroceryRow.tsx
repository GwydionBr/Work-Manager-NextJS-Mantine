import { Group } from "@mantine/core";
import { Tables } from "@/types/db.types";

interface GroceryRowProps {
  item: Tables<"grocery_item">;
}

export default function GroceryRow({ item }: GroceryRowProps) {
  return (
    <Group>
      {item.title}
    </Group>
  );
}