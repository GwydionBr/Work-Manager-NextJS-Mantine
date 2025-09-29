"use client";

import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useWorkStore } from "@/stores/workManagerStore";

import { Modal, TextInput, Group, Stack, ActionIcon } from "@mantine/core";
import { useForm } from "@mantine/form";
import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";
import { IconFolderPlus } from "@tabler/icons-react";
import CreateButton from "@/components/UI/Buttons/CreateButton";
import CancelButton from "@/components/UI/Buttons/CancelButton";
import DelayedTooltip from "@/components/UI/DelayedTooltip";

const folderSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

export default function NewFolderButton() {
  const [opened, { open, close }] = useDisclosure(false);
  const [submitting, setSubmitting] = useState(false);
  const { addProjectFolder } = useWorkStore();

  const form = useForm({
    initialValues: {
      title: "",
      description: "",
    },
    validate: zodResolver(folderSchema),
  });

  async function handleSubmit(values: { title: string; description: string }) {
    setSubmitting(true);
    const success = await addProjectFolder({ ...values });
    if (success) {
      handleClose();
      form.reset();
    }
    setSubmitting(false);
  }

  function handleClose() {
    close();
    form.reset();
  }

  return (
    <Group align="center" justify="flex-end">
      <Modal
        opened={opened}
        onClose={handleClose}
        title="Add Folder"
        size="md"
        padding="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              data-autofocus
              label="Title"
              placeholder="Enter folder title"
              {...form.getInputProps("title")}
            />
            <TextInput
              label="Description"
              placeholder="Enter folder description (optional)"
              {...form.getInputProps("description")}
            />
            <Group justify="flex-end">
              <CancelButton onClick={handleClose} />
              <CreateButton
                type="submit"
                onClick={form.onSubmit(handleSubmit)}
                loading={submitting}
                variant="filled"
                title="Create Folder"
              />
            </Group>
          </Stack>
        </form>
      </Modal>

      <DelayedTooltip label="Add folder">
        <ActionIcon
          aria-label="Add folder"
          onClick={open}
          size="sm"
          variant="transparent"
        >
          <IconFolderPlus />
        </ActionIcon>
      </DelayedTooltip>
    </Group>
  );
}
