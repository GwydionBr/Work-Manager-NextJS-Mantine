import { Stack, Text } from "@mantine/core";

export default function NewSessionEvent({
  start,
  y,
  yToTime,
}: {
  start: number;
  y: number;
  yToTime: (y: number) => string;
}) {
  const actualStart = Math.min(start, y);
  const actualEnd = Math.max(start, y);
  const isStartDynamic = start > y;

  return (
    <Stack
      justify={isStartDynamic ? "flex-start" : "flex-end"}
      style={{
        position: "absolute",
        top: actualStart,
        height: actualEnd - actualStart,
        left: 0,
        right: 0,
        background:
          "light-dark(var(--mantine-color-teal-6), var(--mantine-color-teal-8))",
        borderTop: "3px solid var(--mantine-color-teal-6)",
      }}
    >
      <Text ta="center" fw={600}>
        {yToTime(actualStart)} - {yToTime(actualEnd)}
      </Text>
    </Stack>
  );
}
