import {
  Paper,
  Text,
  PaperProps,
  Grid,
  Group,
  Divider,
  TextInput,
} from "@mantine/core";
import { TimerState } from "@/types/timeTracker.types";

import classes from "./TimeTracker.module.css";

interface TimeTrackerRowProps extends PaperProps {
  icon: React.ReactNode;
  value: string | undefined;
  setMemo?: (memo: string) => void;
  isMemo?: boolean;
  secondValue?: string;
  state?: TimerState;
  activationState?: TimerState;
  color?: string;
}

export default function TimeTrackerRow({
  icon,
  value,
  setMemo,
  isMemo,
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
      style={{
        borderColor: isMemo
          ? "light-dark(var(--mantine-color-gray-5), var(--mantine-color-gray-6))"
          : state === activationState
            ? color
            : "",
      }}
      {...props}
    >
      <Grid justify="center" align="center">
        <Grid.Col span={2}>
          <div className={classes.icon}>{icon}</div>
        </Grid.Col>
        <Grid.Col span={1}>
          <Divider orientation="vertical" h={50} />
        </Grid.Col>
        <Grid.Col span={secondValue ? 4 : 7}>
          {isMemo && setMemo ? (
            <TextInput
              w="100%"
              value={value}
              onChange={(event) => setMemo(event.target.value)}
              styles={{
                input: {
                  border: "none",
                  background: "transparent",
                  padding: 0,
                  fontSize: "var(--mantine-font-size-sm)",
                  fontWeight: 400,
                  textAlign: "center",
                  color: "inherit",
                  "&:focus": {
                    border: "none",
                    background: "transparent",
                    outline: "none",
                  },
                  "&::placeholder": {
                    color: "var(--mantine-color-dimmed)",
                  },
                },
              }}
              placeholder="Add memo..."
            />
          ) : (
            <Group>
              <Text size="lg" fw={500} ta="center">
                {value}
              </Text>
            </Group>
          )}
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
