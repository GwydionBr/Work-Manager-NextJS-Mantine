"use client";

import { useEffect } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useFinanceStore } from "@/stores/financeStore";
import { useSettingsStore } from "@/stores/settingsStore";

import {
  Stack,
  Text,
  Skeleton,
  Group,
  Popover,
  Collapse,
  List,
} from "@mantine/core";
import FinanceClientRow from "./FinanceClientRow";
import PlusActionIcon from "@/components/UI/ActionIcons/PlusActionIcon";
import FinanceClientForm from "@/components/Finances/FinanceClient/FinanceClientForm";
import { useCallback, useMemo, useState } from "react";
import DeleteActionIcon from "@/components/UI/ActionIcons/DeleteActionIcon";
import SelectActionIcon from "@/components/UI/ActionIcons/SelectActionIcon";
import ConfirmDeleteModal from "@/components/UI/ConfirmDeleteModal";
import { IconUsers } from "@tabler/icons-react";

export default function FinanceClientSettings() {
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(
    null
  );
  const { financeClients, isFetching, deleteFinanceClients } =
    useFinanceStore();
  const { locale } = useSettingsStore();
  const [isClientFormOpen, { open: openClientForm, close: closeClientForm }] =
    useDisclosure(false);
  const [selectedModeActive, { toggle: toggleSelectedMode }] =
    useDisclosure(false);
  const [
    deleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);
  const [modalInformation, setModalInformation] = useState<{
    title: string;
    message: React.ReactNode;
    onDelete: () => void;
  } | null>(null);
  useEffect(() => {
    if (!selectedModeActive) {
      setSelectedClients([]);
    }
  }, [selectedModeActive]);

  const clientIdList = useMemo(
    () => financeClients.map((c) => c.id),
    [financeClients]
  );

  const toggleAllClients = useCallback(() => {
    if (selectedClients.length > 0) {
      setSelectedClients([]);
    } else {
      setSelectedClients(financeClients.map((c) => c.id));
    }
  }, [financeClients, selectedClients]);

  const onDelete = useCallback(
    (ids: string[]) => {
      setModalInformation({
        title: locale === "de-DE" ? "Kunde löschen" : "Delete Client",
        message:
          locale === "de-DE" ? (
            <Stack>
              <Text>
                Sind Sie sicher, dass Sie diese Kunden
                {ids.length > 1 ? "n" : ""} löschen möchten?
              </Text>
              <List>
                {financeClients
                  .filter((client) => ids.includes(client.id))
                  .map((client) => (
                    <List.Item key={client.id}>
                      <Stack gap={0}>
                        <Text>{client.name}</Text>
                        <Text fz="xs" c="dimmed">
                          {client.description}
                        </Text>
                      </Stack>
                    </List.Item>
                  ))}
              </List>
            </Stack>
          ) : (
            <Stack>
              <Text>
                Are you sure you want to delete{" "}
                {ids.length > 1 ? "these clients" : "this client"}?
              </Text>
              <List>
                {financeClients
                  .filter((client) => ids.includes(client.id))
                  .map((client) => (
                    <List.Item key={client.id}>
                      <Stack gap={0}>
                        <Text>{client.name}</Text>
                        <Text fz="xs" c="dimmed">
                          {client.description}
                        </Text>
                      </Stack>
                    </List.Item>
                  ))}
              </List>
            </Stack>
          ),
        onDelete: async () => {
          const deleted = await deleteFinanceClients(ids);
          if (deleted) {
            setSelectedClients([]);
            closeDeleteModal();
          }
        },
      });
      openDeleteModal();
    },
    [financeClients, locale, deleteFinanceClients]
  );

  const toggleClientSelection = useCallback(
    (clientId: string, index: number, range: boolean) => {
      if (range && lastSelectedIndex !== null) {
        const start = Math.min(lastSelectedIndex, index);
        const end = Math.max(lastSelectedIndex, index);
        const rangeIds = clientIdList.slice(start, end + 1);
        setSelectedClients((prev) =>
          Array.from(new Set([...prev, ...rangeIds]))
        );
      } else {
        setSelectedClients((prev) =>
          prev.includes(clientId)
            ? prev.filter((id) => id !== clientId)
            : [...prev, clientId]
        );
        setLastSelectedIndex(index);
      }
    },
    [clientIdList, lastSelectedIndex]
  );

  return (
    <Group w="100%">
      <Stack align="center" w="100%">
        <Group justify="space-between" w="100%">
          <Popover
            opened={isClientFormOpen}
            onClose={closeClientForm}
            closeOnClickOutside
            withOverlay
            trapFocus
            returnFocus
          >
            <Popover.Target>
              <PlusActionIcon onClick={openClientForm} disabled={isFetching} />
            </Popover.Target>
            <Popover.Dropdown>
              <FinanceClientForm onClose={closeClientForm} />
            </Popover.Dropdown>
          </Popover>
          <Group
            align="center"
            gap="xs"
            mb="md"
            style={{
              borderBottom:
                "1px solid light-dark(var(--mantine-color-gray-5), var(--mantine-color-dark-3))",
            }}
          >
            <IconUsers size={20} />
            <Text fw={500} fz="lg">
              {locale === "de-DE" ? "Finanz Kunden" : "Finance Clients"}
            </Text>
          </Group>
          <SelectActionIcon
            disabled={isFetching || financeClients.length === 0}
            tooltipLabel={
              locale === "de-DE"
                ? "Aktiviere Mehrfachauswahl"
                : "Activate bulk select"
            }
            filled={selectedModeActive}
            selected={selectedModeActive}
            onClick={toggleSelectedMode}
          />
        </Group>
        {!isFetching && financeClients.length === 0 ? (
          <Text fz="sm" c="dimmed">
            {locale === "de-DE" ? "Keine Kunden gefunden" : "No clients found"}
          </Text>
        ) : (
          <Stack gap="xs" align="center" w="100%" maw={500}>
            <Collapse in={selectedModeActive} w="100%">
              <Group w="100%" justify="space-between">
                <Group onClick={toggleAllClients} style={{ cursor: "pointer" }}>
                  <SelectActionIcon
                    onClick={() => {}}
                    selected={selectedClients.length === financeClients.length}
                    partiallySelected={
                      selectedClients.length > 0 &&
                      selectedClients.length < financeClients.length
                    }
                  />
                  <Text fz="sm" c="dimmed">
                    {locale === "de-DE" ? "Alle" : "All"}
                  </Text>
                </Group>
                <DeleteActionIcon
                  disabled={selectedClients.length === 0}
                  onClick={() => onDelete(selectedClients)}
                />
              </Group>
            </Collapse>
            {!isFetching &&
              financeClients.map((client, index) => (
                <FinanceClientRow
                  key={client.id}
                  client={client}
                  selectedModeActive={selectedModeActive}
                  isSelected={selectedClients.includes(client.id)}
                  onToggleSelected={(e) =>
                    toggleClientSelection(client.id, index, e.shiftKey)
                  }
                  onDelete={onDelete}
                />
              ))}
            {isFetching &&
              Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} w="100%" h={60} radius="md" maw={500} />
              ))}
          </Stack>
        )}
      </Stack>
      <ConfirmDeleteModal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        onDelete={modalInformation?.onDelete || (() => {})}
        title={modalInformation?.title || ""}
        message={modalInformation?.message || ""}
      />
    </Group>
  );
}
