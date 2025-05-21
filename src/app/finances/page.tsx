import classes from "./Finances.module.css";

import { Box } from "@mantine/core";
import FinancesTab from "@/components/Finances/FinancesTab";
import Header from "@/components/Header/Header";

export default function FinancesPage() {
  return (
    <Box className={classes.financesMainContainer} px="xl">
      <Header headerTitle="Finances" />
      <FinancesTab />
    </Box>
  );
}
