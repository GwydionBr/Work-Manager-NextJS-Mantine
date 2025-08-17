"use client";

import { Box, Stack, Text } from "@mantine/core";

interface TimeColumnProps {
  headerHeight: number;
  hourHeight: number;
  startHour: number;
  endHour: number;
}

export function TimeColumn({
  headerHeight,
  hourHeight,
  startHour,
  endHour,
}: TimeColumnProps) {
  // Left time gutter with sticky header spacer and absolute-positioned labels.
  // Labels are vertically centered on each hour grid line for easier scanning.
  return (
    <Box style={{ width: 56, flex: "0 0 auto" }}>
      <Stack gap="xs">
        <Box
          style={{
            height: headerHeight,
            // borderBottom: "1px solid var(--mantine-color-gray-3)",
            background: "var(--mantine-color-body)",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        />
        <Box
          style={{
            position: "relative",
            height: hourHeight * (endHour - startHour),
          }}
        >
          {Array.from({ length: endHour - startHour + 1 }, (_, i) => (
            <Text
              key={i}
              size="xs"
              c="dimmed"
              style={{
                position: "absolute",
                top: i * hourHeight - 5,
                left: 0,
                width: "100%",
                textAlign: "right",
                paddingRight: 8,
              }}
            >
              {String(i + startHour).padStart(2, "0")}:00
            </Text>
          ))}
        </Box>
      </Stack>
    </Box>
  );
}
