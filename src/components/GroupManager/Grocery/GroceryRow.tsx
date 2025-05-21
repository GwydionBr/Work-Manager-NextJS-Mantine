import { Group, Checkbox, CheckIcon, ActionIcon } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";

import { Tables } from "@/types/db.types";

import classes from "./Grocery.module.css";

interface GroceryRowProps {
  item: Tables<"grocery_item">;
  handleCheckChange: (id: string, checked: boolean) => void;
  onDelete: (id: string) => void;
}

export default function GroceryRow({
  item,
  handleCheckChange,
  onDelete,
}: GroceryRowProps) {
  return (
    <Group justify="space-between" w="100%" className={classes.groceryRow}>
      <Group>
        <Checkbox
          icon={CheckIcon}
          checked={item.checked}
          onChange={(event) => handleCheckChange(item.id, event.target.checked)}
        />
        {item.title}
      </Group>
      <Group>
        {item.amount}
        <ActionIcon
          onClick={() => onDelete(item.id)}
          variant="transparent"
          color="red"
        >
          <IconTrash />
        </ActionIcon>
      </Group>
    </Group>
  );
}
