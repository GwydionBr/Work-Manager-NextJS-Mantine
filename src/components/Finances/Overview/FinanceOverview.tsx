import { Box } from "@mantine/core";
import OverviewChart from "./OverviewChart";

import classes from "./FinanceOverview.module.css";

export default function FinanceOverview() {
  return (
    <Box className={classes.financeOverviewContainer}>
      <OverviewChart />
    </Box>
  );
}
