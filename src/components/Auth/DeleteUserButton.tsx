"use client";

import { useSettingsStore } from "@/stores/settingsStore";
import { useDeleteUserMutation } from "@/utils/queries/auth/use-auth";

import { Button, ButtonProps } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { showDeleteConfirmationModal } from "@/utils/notificationFunctions";

interface DeleteUserButtonProps extends ButtonProps {}

export default function DeleteUserButton({ ...props }: DeleteUserButtonProps) {
  const { mutate: deleteUser, isPending } = useDeleteUserMutation();
  const { locale } = useSettingsStore();

  async function handleDelete() {
    showDeleteConfirmationModal(
      locale === "de-DE" ? "Konto löschen" : "Delete Account",
      locale === "de-DE"
        ? "Sind Sie sicher, dass Sie Ihr Konto löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden."
        : "Are you sure you want to delete your account? This action cannot be undone.",
      async () => {
        deleteUser();
      },
      locale
    );
  }

  return (
    <Button
      size="xs"
      leftSection={<IconTrash size={24} />}
      color="red"
      onClick={handleDelete}
      variant="filled"
      loading={isPending}
      {...props}
    >
      Delete Account
    </Button>
  );
}
