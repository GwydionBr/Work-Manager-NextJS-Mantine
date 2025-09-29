"use client ";

import { useEffect, useState } from "react";
import { useDisclosure, useHover } from "@mantine/hooks";
import { useFinanceStore } from "@/stores/financeStore";
import { useSettingsStore } from "@/stores/settingsStore";

import {
  Badge,
  Popover,
  Stack,
  Select,
  Group,
  Button,
  Collapse,
  Transition,
} from "@mantine/core";
import { IconUser, IconUserPlus, IconPlus } from "@tabler/icons-react";
import FinanceClientCard from "./FinanceClientCard";
import FinanceClientForm from "./FinanceClientForm";

import { Tables } from "@/types/db.types";

interface FinanceClientBadgeProps {
  client: Tables<"finance_client"> | null;
  showAddClient?: boolean;
  onPopoverOpen: () => void;
  onPopoverClose: (client: Tables<"finance_client"> | null) => void;
}

export default function FinanceClientBadge({
  client,
  showAddClient = true,
  onPopoverOpen,
  onPopoverClose,
}: FinanceClientBadgeProps) {
  const [
    isClientPopoverOpen,
    { open: openClientPopover, close: closeClientPopover },
  ] = useDisclosure(false);
  const [isClientFormOpen, { open: openClientForm, close: closeClientForm }] =
    useDisclosure(false);
  const { hovered, ref } = useHover();
  const { financeClients } = useFinanceStore();
  const { getLocalizedText } = useSettingsStore();
  const [selectedClient, setSelectedClient] =
    useState<Tables<"finance_client"> | null>(null);

  useEffect(() => {
    setSelectedClient(client ? client : null);
  }, [client]);

  const handlePopoverOpen = () => {
    onPopoverOpen();
    openClientPopover();
  };

  const handlePopoverClose = () => {
    onPopoverClose(null);
    closeClientForm();
    closeClientPopover();
  };

  return (
    <Popover
      onDismiss={handlePopoverClose}
      opened={isClientPopoverOpen}
      onClose={handlePopoverClose}
    >
      <Popover.Target ref={ref}>
        {client ? (
          <Badge
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
            {selectedClient?.name}
          </Badge>
        ) : (
          <Transition
            mounted={showAddClient}
            transition="fade-left"
            duration={200}
          >
            {(styles) => (
              <Badge
                onClick={(e) => {
                  e.stopPropagation();
                  handlePopoverOpen();
                }}
                leftSection={<IconUserPlus size={12} />}
                color="blue"
                variant="light"
                style={{
                  cursor: "pointer",
                  border: hovered
                    ? "1px solid var(--mantine-color-blue-5)"
                    : "1px solid transparent",
                  ...styles,
                }}
              />
            )}
          </Transition>
        )}
      </Popover.Target>
      <Popover.Dropdown>
        {client ? (
          <FinanceClientCard client={client} />
        ) : (
          <Stack>
            <Group>
              <Select
                data={financeClients.map((c) => ({
                  label: c.name,
                  value: c.id,
                }))}
                comboboxProps={{ withinPortal: false }}
                value={selectedClient?.id}
                onChange={(value) => {
                  setSelectedClient(
                    financeClients.find((c) => c.id === value) || null
                  );
                }}
              />
              <Button
                size="compact-sm"
                variant="subtle"
                leftSection={<IconPlus />}
                onClick={openClientForm}
              >
                {getLocalizedText("Kunde", "Client")}
              </Button>
            </Group>
            <Collapse in={isClientFormOpen}>
              <FinanceClientForm
                onClose={closeClientForm}
                onSuccess={(client) => setSelectedClient(client)}
              />
            </Collapse>
          </Stack>
        )}
      </Popover.Dropdown>
    </Popover>
  );
}
