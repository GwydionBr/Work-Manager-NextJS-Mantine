"use client";

import { useState } from "react";
import { useForm } from "@mantine/form";
import { useTaskStore } from "@/stores/taskStore";

import { ActionIcon, Alert, Group, Stack, TextInput } from "@mantine/core";
import { IconX, IconPlus } from "@tabler/icons-react";

import AddActionIcon from "@/components/UI/ActionIcons/PlusActionIcon";

interface TaskInputProps {}

export default function TaskInput({}: TaskInputProps) {
  const { createTask } = useTaskStore();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm({
    initialValues: {
      title: "",
    },
  });

  const onSubmit = async (values: typeof form.values) => {
    setIsLoading(true);
    await createTask({
      title: values.title,
    });
    form.reset();
    setIsLoading(false);
  };

  return (
    <Stack w="100%">
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Group justify="center">
          <TextInput
            style={{ flexGrow: 1, borderRadius: "5px" }}
            leftSection={
              form.values.title !== "" && (
                <ActionIcon
                  onClick={() => form.reset()}
                  disabled={!form.values.title}
                  variant="transparent"
                  color="red"
                >
                  <IconX />
                </ActionIcon>
              )
            }
            placeholder="Add a task"
            value={form.values.title}
            onChange={(e) => form.setFieldValue("title", e.target.value)}
          />
          <AddActionIcon
            onClick={form.onSubmit(onSubmit)}
            loading={isLoading}
            aria-label="Add task"
            tooltipLabel="Add task"
            variant="filled"
          />
        </Group>
        {form.errors.title && (
          <Alert
            withCloseButton
            color="red"
            onClose={() => form.setErrors({ title: null })}
          >
            {form.errors.title}
          </Alert>
        )}
      </form>
    </Stack>
  );
}
