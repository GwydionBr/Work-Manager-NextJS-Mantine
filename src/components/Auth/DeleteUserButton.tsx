"use client";

import { useFormatter } from "@/hooks/useFormatter";
import { useDeleteUserMutation } from "@/utils/queries/auth/use-auth";

import { Button, ButtonProps } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { showDeleteConfirmationModal } from "@/utils/notificationFunctions";

interface DeleteUserButtonProps extends ButtonProps {}

export default function DeleteUserButton({ ...props }: DeleteUserButtonProps) {
  const { mutate: deleteUser, isPending } = useDeleteUserMutation();
  const { getLocalizedText } = useFormatter();

  async function handleDelete() {
    showDeleteConfirmationModal(
      getLocalizedText("Konto löschen", "Delete Account"),
      getLocalizedText(
        "Sind Sie sicher, dass Sie Ihr Konto löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.",
        "Are you sure you want to delete your account? This action cannot be undone."
      ),
      async () => {
        deleteUser();
      }
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
