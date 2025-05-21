"use client";

import { useDisclosure } from "@mantine/hooks";

import { Button } from "@mantine/core";

import { logout } from "@/actions";

export default function LogoutButton() {
  const [loading, { open, close }] = useDisclosure(false);

  async function handleLogout() {
    open();
    await logout();
    close();
  }

  return (
    <Button
      color="red"
      onClick={handleLogout}
      variant="filled"
      loading={loading}
      disabled={loading}
    >
      Logout
    </Button>
  );
}
