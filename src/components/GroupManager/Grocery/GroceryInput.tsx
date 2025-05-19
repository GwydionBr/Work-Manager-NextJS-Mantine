import { ActionIcon, Group, TextInput } from "@mantine/core";
import { IconX, IconPlus } from "@tabler/icons-react";
import classes from "./Grocery.module.css";

interface GroceryInputProps {
  placeholder: string;
  onValueChange: (value: string) => void;
  value: string;
  onSubmit: () => void;
  clearInput: () => void;
}

export default function GroceryInput({
  placeholder,
  onValueChange,
  clearInput,
  value,
  onSubmit,
}: GroceryInputProps) {
  return (
    <Group w="100%" justify="center">
      <TextInput
        style={{ flexGrow: 1 }}
        leftSection={
          <ActionIcon
            onClick={clearInput}
            disabled={!value}
            variant="transparent"
            color="red"
          >
            <IconX />
          </ActionIcon>
        }
        placeholder={placeholder}
        className={classes.groceryInput}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
      />
      <ActionIcon onClick={onSubmit}>
        <IconPlus />
      </ActionIcon>
    </Group>
  );
}
