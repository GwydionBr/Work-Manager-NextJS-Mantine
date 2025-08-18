import { Box, Group, Stack, Text, Indicator } from "@mantine/core";
import { TimerState } from "@/stores/timeTrackerStore";
import { TimerData } from "@/stores/timeTrackerManagerStore";

interface ActiveTimeTrackerProps {
  toY: (date: Date) => number;
  realHeight: number;
  height: number;
  top: number;
  bottom: number;
  timer: TimerData;
}

export default function ActiveTimeTracker({
  toY,
  realHeight,
  height,
  top,
  bottom,
  timer,
}: ActiveTimeTrackerProps) {
  return (
    <Box>
      <Box
        h={height}
        w="100%"
        style={{
          position: "absolute",
          top: bottom - height,
          left: 0,
          right: 0,
          zIndex: 10,
          background:
            "light-dark(var(--mantine-color-white), var(--mantine-color-dark-9))",
        }}
      >
        <Stack
          h={height}
          w="100%"
          gap={0}
          p={0}
          justify="space-between"
          style={{
            border: "1px solid red",
            borderBottom: "2px solid red",
            borderRadius: 5,
          }}
        >
          <Group justify="center" align="center" px="xs">
            <Indicator
              size={10}
              color={"var(--mantine-color-red-6)"}
              processing={timer.state === TimerState.Running}
            />
            <Text size="xs" ta="center" fw={600}>
              {timer.activeTime}
            </Text>
          </Group>
        </Stack>
      </Box>
      <Box
        style={{
          position: "absolute",
          visibility: realHeight > 2 ? "visible" : "hidden",
          left: 0,
          top: top,
          width: 6,
          height: realHeight,
          background: "var(--mantine-color-red-6)",
          borderRadius: 5,
          zIndex: 10,
        }}
      />
    </Box>
  );
}
