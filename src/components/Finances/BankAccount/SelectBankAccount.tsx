import { useBankAccountQuery } from "@/utils/queries/finances/use-bank-account";
import { useFinanceStore } from "@/stores/financeStore";

import { Select } from "@mantine/core";

export default function SelectBankAccount() {
  const { data: bankAccounts = [] } = useBankAccountQuery();
  const { activeBankAccountId, setActiveBankAccountId } = useFinanceStore();

  return (
    <Select
      data={bankAccounts.map((bankAccount) => ({
        label: bankAccount.title,
        value: bankAccount.id,
      }))}
      styles={{
        input: {
          textAlign: "center"
        }
      }}
      value={activeBankAccountId}
      onChange={(value) => setActiveBankAccountId(value as string)}
    />
  );
}
