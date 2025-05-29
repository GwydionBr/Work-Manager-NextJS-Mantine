import { Box } from "@mantine/core";
import Header from "@/components/Header/Header";

import classes from "./Analytics.module.css";

export default function AnalyticsPage() {
  return (
    <Box className={classes.analyticsMainContainer}>
      <Header headerTitle="Analytics" />
    </Box>
  );
}
