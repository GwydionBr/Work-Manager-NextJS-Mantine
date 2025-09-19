"use client";

import { Stack } from "@mantine/core";
import { useFinanceStore } from "@/stores/financeStore";
import PayoutRowCard from "./PayoutRowCard";

export default function PayoutTab() {
  const { payouts } = useFinanceStore();
  return (
    <Stack w="100%" align="center" mb="xl">
      {payouts.map((payout) => (
        <PayoutRowCard key={payout.id} payout={payout} />
      ))}
    </Stack>
  );
}
