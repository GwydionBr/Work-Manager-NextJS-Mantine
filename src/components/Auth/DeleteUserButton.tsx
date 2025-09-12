"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDisclosure } from "@mantine/hooks";

import { Button, ButtonProps } from "@mantine/core";
import { useUserStore } from "@/stores/userStore";
import { IconLogout, IconTrash } from "@tabler/icons-react";
import ConfirmDeleteModal from "../UI/ConfirmDeleteModal";

interface DeleteUserButtonProps extends ButtonProps {}

export default function DeleteUserButton({ ...props }: DeleteUserButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [
    deleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);
  const { deleteUser } = useUserStore();
  const router = useRouter();

  async function handleDelete() {
    setIsLoading(true);
    const response = await deleteUser();
    if (response) {
      router.push("/");
    }
    setIsLoading(false);
  }

  return (
    <>
      <Button
        size="xs"
        leftSection={<IconTrash size={24} />}
        color="red"
        onClick={openDeleteModal}
        variant="filled"
        loading={isLoading}
        disabled={isLoading}
        {...props}
      >
        Delete Account
      </Button>
      <ConfirmDeleteModal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        onDelete={handleDelete}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone."
      />
    </>
  );
}
