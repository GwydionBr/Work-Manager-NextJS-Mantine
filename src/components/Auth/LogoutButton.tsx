"use client";

import { useLogoutMutation } from "@/utils/queries/auth/use-auth";
import { useFormatter } from "@/hooks/useFormatter";

import { Button, ButtonProps } from "@mantine/core";
import { IconLogout } from "@tabler/icons-react";

interface LogoutButtonProps extends ButtonProps {}

export default function LogoutButton({ ...props }: LogoutButtonProps) {
  const { mutate: logout, isPending } = useLogoutMutation();
  const { getLocalizedText } = useFormatter();
  return (
    <Button
      leftSection={<IconLogout size={24} />}
      color="red"
      onClick={() => logout()}
      variant="light"
      loading={isPending}
      {...props}
    >
      {getLocalizedText("Abmelden", "Logout")}
    </Button>
  );
}
