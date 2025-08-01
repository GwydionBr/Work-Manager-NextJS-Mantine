import { Group, NumberInput, Paper, Stack, Text } from "@mantine/core";

interface TimeInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  error?: React.ReactNode;
  icon?: React.ReactNode;
  color?: string;
  autoFocus?: boolean;
}

// Helper function to convert seconds to hours, minutes, seconds
function secondsToTimeComponents(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return { hours, minutes, seconds: secs };
}

// Helper function to convert hours, minutes, seconds to total seconds
function timeComponentsToSeconds(
  hours: number,
  minutes: number,
  seconds: number
) {
  return hours * 3600 + minutes * 60 + seconds;
}

export default function TimeInput({
  label,
  value,
  onChange,
  error,
  icon,
  color = "blue",
  autoFocus = false,
}: TimeInputProps) {
  const timeComponents = secondsToTimeComponents(value);

  const handleHoursChange = (hours: string | number) => {
    const numHours = typeof hours === "string" ? parseInt(hours) || 0 : hours;
    const newSeconds = timeComponentsToSeconds(
      numHours,
      timeComponents.minutes,
      timeComponents.seconds
    );
    onChange(newSeconds);
  };

  const handleMinutesChange = (minutes: string | number) => {
    const numMinutes =
      typeof minutes === "string" ? parseInt(minutes) || 0 : minutes;
    const newSeconds = timeComponentsToSeconds(
      timeComponents.hours,
      numMinutes,
      timeComponents.seconds
    );
    onChange(newSeconds);
  };

  const handleSecondsChange = (seconds: string | number) => {
    const numSeconds =
      typeof seconds === "string" ? parseInt(seconds) || 0 : seconds;
    const newSeconds = timeComponentsToSeconds(
      timeComponents.hours,
      timeComponents.minutes,
      numSeconds
    );
    onChange(newSeconds);
  };

  return (
    <Paper p="md" withBorder>
      <Stack gap="md">
        <Group gap="xs">
          {icon}
          <Text size="sm" fw={600} c={color}>
            {label}
          </Text>
        </Group>

        <Group gap="lg" justify="center">
          <Stack gap="xs" align="center">
            <NumberInput
              w={90}
              allowNegative={false}
              allowLeadingZeros={false}
              allowDecimal={false}
              min={0}
              max={999}
              placeholder="0"
              label="Hours"
              size="sm"
              value={
                timeComponents.hours > 0 ? timeComponents.hours : undefined
              }
              onChange={handleHoursChange}
            />
          </Stack>

          <Text size="xl" fw={700} c="dimmed" style={{ marginTop: "20px" }}>
            :
          </Text>

          <Stack gap="xs" align="center">
            <NumberInput
              w={90}
              allowNegative={false}
              allowLeadingZeros={false}
              allowDecimal={false}
              min={0}
              max={59}
              placeholder="0"
              label="Minutes"
              size="sm"
              value={
                timeComponents.minutes > 0 ? timeComponents.minutes : undefined
              }
              onChange={handleMinutesChange}
              data-autofocus={autoFocus}
            />
          </Stack>

          <Text size="xl" fw={700} c="dimmed" style={{ marginTop: "20px" }}>
            :
          </Text>

          <Stack gap="xs" align="center">
            <NumberInput
              w={90}
              allowNegative={false}
              allowLeadingZeros={false}
              allowDecimal={false}
              min={0}
              max={59}
              placeholder="0"
              label="Seconds"
              size="sm"
              value={
                timeComponents.seconds > 0 ? timeComponents.seconds : undefined
              }
              onChange={handleSecondsChange}
            />
          </Stack>
        </Group>

        {error && (
          <Text size="xs" c="red" ta="center">
            {error}
          </Text>
        )}
      </Stack>
    </Paper>
  );
}
