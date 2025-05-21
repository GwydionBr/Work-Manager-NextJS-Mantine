import { ActionIcon, Alert, Group, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconX, IconPlus } from "@tabler/icons-react";
import classes from "./Grocery.module.css";

interface GroceryInputProps {
  placeholder: string;
  onValueChange: (value: string) => void;
  value: string;
  onSubmit: () => void;
  clearInput: () => void;
  isLoading: boolean;
  error: string | null;
  onCloseError: () => void;
}

export default function GroceryInput({
  placeholder,
  onValueChange,
  clearInput,
  value,
  onSubmit,
  isLoading,
  error,
  onCloseError,
}: GroceryInputProps) {
  const form = useForm({
    initialValues: {
      value: "",
    },
  });
  return (
    <Stack w="100%">
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Group justify="center">
          <TextInput
            style={{ flexGrow: 1 }}
            leftSection={
              value !== "" && (
                <ActionIcon
                  onClick={clearInput}
                  disabled={!value}
                  variant="transparent"
                  color="red"
              >
                <IconX />
                </ActionIcon>
              )
            }
            placeholder={placeholder}
            className={classes.groceryInput}
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
          />
          <ActionIcon onClick={onSubmit} loading={isLoading}>
            <IconPlus />
          </ActionIcon>
        </Group>
        {error && (
          <Alert withCloseButton color="red" onClose={onCloseError}>
            {error}
          </Alert>
        )}
      </form>
    </Stack>
  );
}
