import { Paper, Text, PaperProps, Grid } from "@mantine/core";
import { TimerState } from "@/stores/timeTrackerStore";

import classes from "./TimeTracker.module.css";

interface TimeTrackerRowProps extends PaperProps {
  icon: React.ReactNode;
  value: string;
  state?: TimerState;
  activationState?: TimerState;
  color?: string;
}

export default function TimeTrackerRow({
  icon,
  value,
  state,
  activationState,
  color,
  ...props
}: TimeTrackerRowProps) {
  return (
    <Paper
      w={200}
      radius="xl"
      withBorder
      style={{ borderColor: state === activationState ? color : "" }}
      {...props}
    >
      <Grid justify="center" align="center">
        <Grid.Col span={2}>
          <div className={classes.icon}>{icon}</div>
        </Grid.Col>
        <Grid.Col span={6}>
          <Text size="lg" fw={500} ta="center" className={classes.text}>
            {value}
          </Text>
        </Grid.Col>
        <Grid.Col span={2}></Grid.Col>
      </Grid>
    </Paper>
  );
}
