"use client";

import { useDisclosure } from "@mantine/hooks";

import {
  Modal,
  TextInput,
  Group,
  Stack,
  ActionIcon,
  ActionIconProps,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";
import { IconFolderPlus } from "@tabler/icons-react";
import CreateButton from "@/components/UI/Buttons/CreateButton";
import CancelButton from "@/components/UI/Buttons/CancelButton";
import DelayedTooltip from "@/components/UI/DelayedTooltip";
import { useCreateWorkFolderMutation } from "@/utils/queries/work/use-work-folder";

const folderSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

export default function NewFolderButton({ ...props }: ActionIconProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const { mutate: createFolderMutation, isPending: isCreatingFolder } =
    useCreateWorkFolderMutation({
      onSuccess: () => {
        handleClose();
        form.reset();
      },
    });

  const form = useForm({
    initialValues: {
      title: "",
      description: "",
    },
    validate: zodResolver(folderSchema),
  });

  async function handleSubmit(values: { title: string; description: string }) {
    createFolderMutation({ folder: { ...values } });
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
                loading={isCreatingFolder}
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
          variant="subtle"
          {...props}
        >
          <IconFolderPlus size={20} />
        </ActionIcon>
      </DelayedTooltip>
    </Group>
  );
}
