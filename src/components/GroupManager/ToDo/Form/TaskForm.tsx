"use client";

import { useState } from "react";
import { useGroupStore } from "@/stores/groupStore";

import { Stack, Text, Switch, Group, Alert } from "@mantine/core";
import { IconReload, IconCircleDashedNumber1 } from "@tabler/icons-react";
import SingleTaskForm, { SingleTaskFormValues } from "./SingleTaskForm";
import RecurringTaskForm, {
  RecurringTaskFormValues,
} from "./RecurringTaskForm";

import classes from "@/components/UI/Switch.module.css";

interface TaskFormProps {
  onClose: () => void;
}

export default function TaskForm({ onClose }: TaskFormProps) {
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { addSingleGroupTask, addRecurringGroupTask, activeGroup } =
    useGroupStore();

  async function handleSingleTaskSubmit(values: SingleTaskFormValues) {
    setIsLoading(true);
    const success = await addSingleGroupTask({
      title: values.name,
      user_id: values.memberID,
      exectution_date: values.date.toISOString(),
      group_id: activeGroup?.id || "",
    });
    if (!success) {
      setError("Failed to add single group task. Please try again.");
      setIsLoading(false);
    } else {
      setIsLoading(false);
      onClose();
    }
  }

  async function handleRecurringTaskSubmit(values: RecurringTaskFormValues) {
    setIsLoading(true);
    const success = await addRecurringGroupTask({
      title: values.name,
      interval_days: 7,
      user_id: values.memberID,
      start_date: values.startDate.toISOString(),
      end_date: values.endDate?.toISOString(),
      group_id: activeGroup?.id || "",
    });
    if (!success) {
      setError("Failed to add recurring group task. Please try again.");
      setIsLoading(false);
    } else {
      setIsLoading(false);
      onClose();
    }
  }

  return (
    <Stack>
      <Group justify="center">
        <Text>Single</Text>
        <IconCircleDashedNumber1 size={16} />
        <Switch
          checked={isRecurring}
          onChange={(event) => setIsRecurring(event.currentTarget.checked)}
          classNames={classes}
          size="md"
        />
        <IconReload size={16} />
        <Text>Recurring</Text>
      </Group>
      {isRecurring ? (
        <RecurringTaskForm
          handleSubmit={handleRecurringTaskSubmit}
          isLoading={isLoading}
        />
      ) : (
        <SingleTaskForm
          handleSubmit={handleSingleTaskSubmit}
          isLoading={isLoading}
        />
      )}
      {error && (
        <Alert
          color="red"
          variant="filled"
          title="Error"
          withCloseButton
          onClose={() => setError(null)}
        >
          <Text>{error}</Text>
        </Alert>
      )}
    </Stack>
  );
}
