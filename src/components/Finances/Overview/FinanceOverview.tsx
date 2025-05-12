import { Box, Text } from "@mantine/core";
import classes from "./FinanceOverview.module.css";
import OverviewChart from "./OverviewChart";

export default function FinanceOverview() {
  return (
    <Box className={classes.financeOverviewContainer}>
      <OverviewChart />
    </Box>
  );
}
