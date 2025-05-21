import { Group, Checkbox, CheckIcon } from "@mantine/core";
import { Tables } from "@/types/db.types";

interface GroceryRowProps {
  item: Tables<"grocery_item">;
  handleCheckChange: (id: string, checked: boolean) => void;
}

export default function GroceryRow({
  item,
  handleCheckChange,
}: GroceryRowProps) {

  return (
    <Group>
      <Checkbox
        icon={CheckIcon}
        checked={item.checked}
        onChange={(event) => handleCheckChange(item.id, event.target.checked)}
      />
      {item.title}
    </Group>
  );
}
