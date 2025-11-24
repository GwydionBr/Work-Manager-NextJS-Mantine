"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useFormatter } from "@/hooks/useFormatter";

import { Stack, Text, Skeleton, Group, Collapse, List } from "@mantine/core";
import FinanceClientRow from "./FinanceClientRow";
import FinanceSettingsHeader from "@/components/Settings/Finances/FinanceSettingsHeader";
import FinanceClientForm from "@/components/Finances/FinanceClient/FinanceClientForm";
import DeleteActionIcon from "@/components/UI/ActionIcons/DeleteActionIcon";
import SelectActionIcon from "@/components/UI/ActionIcons/SelectActionIcon";
import { IconUserPlus, IconUsers } from "@tabler/icons-react";
import { showDeleteConfirmationModal } from "@/utils/notificationFunctions";
import {
  useDeleteFinanceClientMutation,
  useFinanceClientQuery,
} from "@/utils/queries/finances/use-finance-client";

export default function FinanceClientSettings() {
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(
    null
  );
  const { data: financeClients = [], isPending: isFetchingFinanceClients } =
    useFinanceClientQuery();
  const { mutate: deleteFinanceClientsMutation } =
    useDeleteFinanceClientMutation();
  const { getLocalizedText } = useFormatter();
  const [isClientFormOpen, { open: openClientForm, close: closeClientForm }] =
    useDisclosure(false);
  const [selectedModeActive, { toggle: toggleSelectedMode }] =
    useDisclosure(false);
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

  const onDelete = (ids: string[]) => {
    showDeleteConfirmationModal(
      getLocalizedText("Kunde löschen", "Delete Client"),
      <Stack>
        <Text>
          {getLocalizedText(
            "Sind Sie sicher, dass Sie diese Kunden löschen möchten",
            "Are you sure you want to delete these clients"
          )}
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
      </Stack>,
      () => {
        deleteFinanceClientsMutation(ids);
      }
    );
  };

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
        <FinanceSettingsHeader
          onAdd={openClientForm}
          addDisabled={isFetchingFinanceClients}
          selectDisabled={
            isFetchingFinanceClients || financeClients.length === 0
          }
          selectedModeActive={selectedModeActive}
          toggleSelectedMode={toggleSelectedMode}
          modalTitle={
            <Group>
              <IconUserPlus />
              <Text>{getLocalizedText("Kunde hinzufügen", "Add Client")}</Text>
            </Group>
          }
          modalChildren={<FinanceClientForm onClose={closeClientForm} />}
          modalOpened={isClientFormOpen}
          modalOnClose={closeClientForm}
          titleIcon={<IconUsers size={20} />}
          titleText={getLocalizedText("Finanz Kunden", "Finance Clients")}
        />
        {!isFetchingFinanceClients && financeClients.length === 0 ? (
          <Text fz="sm" c="dimmed">
            {getLocalizedText("Keine Kunden gefunden", "No clients found")}
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
                    {getLocalizedText("Alle", "All")}
                  </Text>
                </Group>
                <DeleteActionIcon
                  disabled={selectedClients.length === 0}
                  onClick={() => onDelete(selectedClients)}
                />
              </Group>
            </Collapse>
            {!isFetchingFinanceClients &&
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
            {isFetchingFinanceClients &&
              Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} w="100%" h={60} radius="md" maw={500} />
              ))}
          </Stack>
        )}
      </Stack>
    </Group>
  );
}
