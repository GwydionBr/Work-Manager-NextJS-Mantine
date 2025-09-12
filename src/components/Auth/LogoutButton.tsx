"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button, ButtonProps } from "@mantine/core";
import { useUserStore } from "@/stores/userStore";
import { IconLogout } from "@tabler/icons-react";

interface LogoutButtonProps extends ButtonProps {

}

export default function LogoutButton({ ...props }: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { logout } = useUserStore();
  const router = useRouter();

  async function handleLogout() {
    setIsLoading(true);
    const response = await logout();
    if (response) {
      router.push("/");
    }
    setIsLoading(false);
  }

  return (
    <Button
      leftSection={<IconLogout size={24} />}
      color="red"
      onClick={handleLogout}
      variant="filled"
      loading={isLoading}
      disabled={isLoading}
      {...props}
    >
      Logout
    </Button>
  );
}
