import { Paper, Text, PaperProps, Grid, Group, Divider } from "@mantine/core";
import { TimerState } from "@/stores/timeTrackerStore";

import classes from "./TimeTracker.module.css";

interface TimeTrackerRowProps extends PaperProps {
  icon: React.ReactNode;
  value: string;
  secondValue?: string;
  state?: TimerState;
  activationState?: TimerState;
  color?: string;
}

export default function TimeTrackerRow({
  icon,
  value,
  secondValue,
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
      <Grid justify="center" align="center" >
        <Grid.Col span={2}>
          <div className={classes.icon}>{icon}</div>
        </Grid.Col>
        <Grid.Col span={1}>
          <Divider orientation="vertical" h={50} />
        </Grid.Col>
        <Grid.Col span={secondValue ? 4 : 7}>
          <Group>
            <Text size="lg" fw={500} ta="center">
              {value}
            </Text>
          </Group>
        </Grid.Col>
        <Grid.Col span={secondValue ? 4 : 0}>
          {secondValue && (
            <Text size="sm" c="dimmed" ta="center">
              {secondValue}
            </Text>
          )}
        </Grid.Col>
      </Grid>
    </Paper>
  );
}
