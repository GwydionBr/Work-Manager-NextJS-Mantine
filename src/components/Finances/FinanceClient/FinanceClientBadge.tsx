"use client ";

import { useDisclosure, useHover } from "@mantine/hooks";

import { Tables } from "@/types/db.types";
import { Badge, Popover } from "@mantine/core";
import { IconUser } from "@tabler/icons-react";
import FinanceClientCard from "./FinanceClientCard";

interface FinanceClientBadgeProps {
  client: Tables<"finance_client">;
  onPopoverOpen: () => void;
  onPopoverClose: () => void;
}

export default function FinanceClientBadge({
  client,
  onPopoverOpen,
  onPopoverClose,
}: FinanceClientBadgeProps) {
  const [
    isClientPopoverOpen,
    { open: openClientPopover, close: closeClientPopover },
  ] = useDisclosure(false);
  const { hovered, ref } = useHover();

  const handlePopoverOpen = () => {
    onPopoverOpen();
    openClientPopover();
  };

  const handlePopoverClose = () => {
    onPopoverClose();
    closeClientPopover();
  };

  return (
    <Popover
      key={client.id}
      onDismiss={handlePopoverClose}
      opened={isClientPopoverOpen}
      onClose={handlePopoverClose}
    >
      <Popover.Target ref={ref}>
        <Badge
          ref={ref}
          onClick={(e) => {
            e.stopPropagation();
            handlePopoverOpen();
          }}
          color="blue"
          variant="light"
          leftSection={<IconUser size={12} />}
          style={{
            cursor: "pointer",
            border: hovered
              ? "1px solid var(--mantine-color-blue-5)"
              : "1px solid transparent",
          }}
        >
          {client.name}
        </Badge>
      </Popover.Target>
      <Popover.Dropdown>
        <FinanceClientCard client={client} />
      </Popover.Dropdown>
    </Popover>
  );
}
