"use client";

import { useFormatter } from "@/hooks/useFormatter";
import { useDisclosure } from "@mantine/hooks";

import { Group, Stack, Text } from "@mantine/core";
import { IconBuildingBank, IconPlus } from "@tabler/icons-react";
import FinanceSettingsHeader from "@/components/Settings/Finances/FinanceSettingsHeader";
import BankAccountForm from "@/components/Finances/BankAccount/BankAccountForm";

export default function FinanceBankAccountSettings() {
  const { getLocalizedText } = useFormatter();
  const [
    isBankAccountFormOpen,
    { open: openBankAccountForm, close: closeBankAccountForm },
  ] = useDisclosure(false);
  return (
    <Stack>
      <FinanceSettingsHeader
        titleText={getLocalizedText("Bankkonten", "Bank Accounts")}
        titleIcon={<IconBuildingBank />}
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
        onAdd={openBankAccountForm}
      />
    </Stack>
  );
}
