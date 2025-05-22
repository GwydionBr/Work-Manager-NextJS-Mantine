"use client";

import { useHover } from "@mantine/hooks";

import { Group, Checkbox, CheckIcon, Space } from "@mantine/core";
import DeleteActionIcon from "@/components/UI/Buttons/DeleteActionIcon";

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
  const { hovered, ref } = useHover();

  return (
    <Group
      justify="space-between"
      w="100%"
      className={classes.groceryRow}
      ref={ref}
    >
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
        <DeleteActionIcon
          style={
            hovered
              ? {
                  opacity: 1,
                }
              : {
                  opacity: 0,
                }
          }
          size="sm"
          aria-label="Delete grocery item"
          onClick={() => onDelete(item.id)}
        />
      </Group>
    </Group>
  );
}
