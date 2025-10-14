"use client";

import { useLogoutMutation } from "@/utils/queries/auth/use-auth";

import { Button, ButtonProps } from "@mantine/core";
import { IconLogout } from "@tabler/icons-react";

interface LogoutButtonProps extends ButtonProps {}

export default function LogoutButton({ ...props }: LogoutButtonProps) {
  const { mutate: logout, isPending } = useLogoutMutation();

  return (
    <Button
      leftSection={<IconLogout size={24} />}
      color="red"
      onClick={() => logout()}
      variant="filled"
      loading={isPending}
      {...props}
    >
      Logout
    </Button>
  );
}
