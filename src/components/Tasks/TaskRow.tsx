"use client";

import { useHover } from "@mantine/hooks";

import { Group, Checkbox, CheckIcon, Text } from "@mantine/core";
import DeleteActionIcon from "../UI/ActionIcons/DeleteActionIcon";

import { Tables } from "@/types/db.types";

interface TaskRowProps {
  task: Tables<"task">;
  handleCheckChange: (id: string, checked: boolean) => void;
  onDelete: (id: string) => void;
}

export default function TaskRow({
  task,
  handleCheckChange,
  onDelete,
}: TaskRowProps) {
  const { hovered, ref } = useHover();

  return (
    <Group
      justify="space-between"
      w="100%"
      ref={ref}
      style={{
        borderRadius: "5px",
        border: "1px solid var(--mantine-color-dark-3)",
        boxShadow: "var(--mantine-shadow-sm)",
        padding: "var(--mantine-spacing-xs)",
        transition: "all 0.2s ease-in-out",
      }}
    >
      <Group>
        <Checkbox
          icon={CheckIcon}
          checked={task.executed}
          onChange={(event) => handleCheckChange(task.id, event.target.checked)}
        />
        <Text size="sm">{task.title}</Text>
      </Group>
      <Group>
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
          onClick={() => onDelete(task.id)}
        />
      </Group>
    </Group>
  );
}
