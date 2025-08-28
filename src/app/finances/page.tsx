"use client";

import { useFinanceStore } from "@/stores/financeStore";
import { useSettingsStore } from "@/stores/settingsStore";

import { Box, Loader } from "@mantine/core";
import FinancesTab from "@/components/Finances/FinancesTab";
import Header from "@/components/Header/Header";

import classes from "./Finances.module.css";

export default function FinancesPage() {
  const { locale } = useSettingsStore();
  const { isFetching } = useFinanceStore();

  return (
    <Box className={classes.financesMainContainer} px="xl">
      <Header headerTitle={locale === "de-DE" ? "Finanzen" : "Finances"} />
      {isFetching ? <Loader /> : <FinancesTab />}
    </Box>
  );
}
