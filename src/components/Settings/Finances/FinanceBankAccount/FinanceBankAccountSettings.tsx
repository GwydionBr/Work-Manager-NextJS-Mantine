"use client";

import { useEffect, useCallback, useMemo, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useFormatter } from "@/hooks/useFormatter";
import {
  useDeleteBankAccountMutation,
  useBankAccountQuery,
} from "@/utils/queries/finances/use-bank-account";

import { Stack, Text, Skeleton, Group, Collapse, List } from "@mantine/core";
import { IconBuildingBank, IconPlus } from "@tabler/icons-react";
import FinanceSettingsHeader from "@/components/Settings/Finances/FinanceSettingsHeader";
import BankAccountForm from "@/components/Finances/BankAccount/BankAccountForm";
import FinanceBankAccountRow from "./FinanceBankAccountRow";
import DeleteActionIcon from "@/components/UI/ActionIcons/DeleteActionIcon";
import SelectActionIcon from "@/components/UI/ActionIcons/SelectActionIcon";
import { showDeleteConfirmationModal } from "@/utils/notificationFunctions";

export default function FinanceBankAccountSettings() {
  const { getLocalizedText } = useFormatter();
  const [selectedBankAccounts, setSelectedBankAccounts] = useState<string[]>(
    []
  );
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(
    null
  );
  const { data: bankAccounts = [], isPending: isFetchingBankAccounts } =
    useBankAccountQuery();
  const { mutate: deleteBankAccountsMutation } = useDeleteBankAccountMutation();
  const [
    isBankAccountFormOpen,
    { open: openBankAccountForm, close: closeBankAccountForm },
  ] = useDisclosure(false);
  const [selectedModeActive, { toggle: toggleSelectedMode }] =
    useDisclosure(false);
  useEffect(() => {
    if (!selectedModeActive) {
      setSelectedBankAccounts([]);
    }
  }, [selectedModeActive]);

  const bankAccountIdList = useMemo(
    () => bankAccounts.map((b) => b.id),
    [bankAccounts]
  );

  const toggleAllBankAccounts = useCallback(() => {
    if (selectedBankAccounts.length > 0) {
      setSelectedBankAccounts([]);
    } else {
      setSelectedBankAccounts(bankAccounts.map((b) => b.id));
    }
  }, [bankAccounts, selectedBankAccounts]);

  const onDelete = (ids: string[]) => {
    showDeleteConfirmationModal(
      getLocalizedText("Konto löschen", "Delete Account"),
      <Stack>
        <Text>
          {getLocalizedText(
            "Sind Sie sicher, dass Sie diese Konten löschen möchten",
            "Are you sure you want to delete these accounts?"
          )}
        </Text>
        <List>
          {bankAccounts
            .filter((bankAccount) => ids.includes(bankAccount.id))
            .map((bankAccount) => (
              <List.Item key={bankAccount.id}>
                <Stack gap={0}>
                  <Text>{bankAccount.title}</Text>
                  <Text fz="xs" c="dimmed">
                    {bankAccount.description}
                  </Text>
                </Stack>
              </List.Item>
            ))}
        </List>
      </Stack>,
      () => {
        deleteBankAccountsMutation(ids);
      }
    );
  };

  const toggleBankAccountSelection = useCallback(
    (bankAccountId: string, index: number, range: boolean) => {
      if (range && lastSelectedIndex !== null) {
        const start = Math.min(lastSelectedIndex, index);
        const end = Math.max(lastSelectedIndex, index);
        const rangeIds = bankAccountIdList.slice(start, end + 1);
        setSelectedBankAccounts((prev) =>
          Array.from(new Set([...prev, ...rangeIds]))
        );
      } else {
        setSelectedBankAccounts((prev) =>
          prev.includes(bankAccountId)
            ? prev.filter((id) => id !== bankAccountId)
            : [...prev, bankAccountId]
        );
        setLastSelectedIndex(index);
      }
    },
    [bankAccountIdList, lastSelectedIndex]
  );

  return (
    <Group w="100%">
      <Stack align="center" w="100%">
        <FinanceSettingsHeader
          onAdd={openBankAccountForm}
          addDisabled={isFetchingBankAccounts}
          selectDisabled={isFetchingBankAccounts || bankAccounts.length === 0}
          selectedModeActive={selectedModeActive}
          toggleSelectedMode={toggleSelectedMode}
          modalTitle={
            <Group>
              <Group justify="center" align="center" gap={0}>
                <IconPlus size={20} color="teal" />
                <IconBuildingBank />
              </Group>
              <Text>{getLocalizedText("Konto hinzufügen", "Add account")}</Text>
            </Group>
          }
          modalChildren={<BankAccountForm onClose={closeBankAccountForm} />}
          modalOpened={isBankAccountFormOpen}
          modalOnClose={closeBankAccountForm}
          titleIcon={<IconBuildingBank />}
          titleText={getLocalizedText("Bankkonten", "Bank Accounts")}
        />
        {!isFetchingBankAccounts && bankAccounts.length === 0 ? (
          <Text fz="sm" c="dimmed">
            {getLocalizedText("Keine Konten gefunden", "No accounts found")}
          </Text>
        ) : (
          <Stack gap="xs" align="center" w="100%" maw={500}>
            <Collapse in={selectedModeActive} w="100%">
              <Group w="100%" justify="space-between">
                <Group
                  onClick={toggleAllBankAccounts}
                  style={{ cursor: "pointer" }}
                >
                  <SelectActionIcon
                    onClick={() => {}}
                    selected={
                      selectedBankAccounts.length === bankAccounts.length
                    }
                    partiallySelected={
                      selectedBankAccounts.length > 0 &&
                      selectedBankAccounts.length < bankAccounts.length
                    }
                  />
                  <Text fz="sm" c="dimmed">
                    {getLocalizedText("Alle", "All")}
                  </Text>
                </Group>
                <DeleteActionIcon
                  disabled={selectedBankAccounts.length === 0}
                  onClick={() => onDelete(selectedBankAccounts)}
                />
              </Group>
            </Collapse>
            {isFetchingBankAccounts
              ? Array.from({ length: 3 }, (_, i) => (
                  <Skeleton key={i} w="100%" h={60} radius="md" maw={500} />
                ))
              : bankAccounts.map((bankAccount, index) => (
                  <FinanceBankAccountRow
                    key={bankAccount.id}
                    bankAccount={bankAccount}
                    selectedModeActive={selectedModeActive}
                    isSelected={selectedBankAccounts.includes(bankAccount.id)}
                    onToggleSelected={(e) =>
                      toggleBankAccountSelection(
                        bankAccount.id,
                        index,
                        e.shiftKey
                      )
                    }
                    onDelete={onDelete}
                  />
                ))}
          </Stack>
        )}
      </Stack>
    </Group>
  );
}
