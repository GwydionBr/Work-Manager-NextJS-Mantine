"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSettingsStore } from "@/stores/settingsStore";

import { Button, ButtonProps } from "@mantine/core";
import { useUserStore } from "@/stores/userStore";
import { IconTrash } from "@tabler/icons-react";
import {
  showActionErrorNotification,
  showActionSuccessNotification,
  showDeleteConfirmationModal,
} from "@/utils/notificationFunctions";

interface DeleteUserButtonProps extends ButtonProps {}

export default function DeleteUserButton({ ...props }: DeleteUserButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { deleteUser } = useUserStore();
  const router = useRouter();
  const { locale } = useSettingsStore();

  async function handleDelete() {
    showDeleteConfirmationModal(
      locale === "de-DE" ? "Konto löschen" : "Delete Account",
      locale === "de-DE"
        ? "Sind Sie sicher, dass Sie Ihr Konto löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden."
        : "Are you sure you want to delete your account? This action cannot be undone.",
      async () => {
        setIsLoading(true);
        const response = await deleteUser();
        if (response) {
          router.push("/");
          showActionSuccessNotification(
            locale === "de-DE"
              ? "Konto erfolgreich gelöscht"
              : "Account deleted successfully",
            locale
          );
        } else {
          showActionErrorNotification(
            locale === "de-DE"
              ? "Konto konnte nicht gelöscht werden"
              : "Account could not be deleted",
            locale
          );
        }
        setIsLoading(false);
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
      loading={isLoading}
      disabled={isLoading}
      {...props}
    >
      Delete Account
    </Button>
  );
}
