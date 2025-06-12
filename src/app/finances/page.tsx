"use client";

import { useFinanceStore } from "@/stores/financeStore";

import { Box, Loader } from "@mantine/core";
import FinancesTab from "@/components/Finances/FinancesTab";
import Header from "@/components/Header/Header";

import classes from "./Finances.module.css";

export default function FinancesPage() {
  const { isFetching } = useFinanceStore();

  return (
    <Box className={classes.financesMainContainer} px="xl">
      <Header headerTitle="Finances" />
      {isFetching ? <Loader /> : <FinancesTab />}
    </Box>
  );
}
