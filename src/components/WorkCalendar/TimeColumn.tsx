"use client";

import { Box, Stack, Text } from "@mantine/core";

interface TimeColumnProps {
  hourHeight: number;
}

export function TimeColumn({
  hourHeight,
}: TimeColumnProps) {
  // Left time gutter with sticky header spacer and absolute-positioned labels.
  // Labels are vertically centered on each hour grid line for easier scanning.
  return (
    <Box style={{ width: 56, flex: "0 0 auto" }}>
      <Stack gap="xs">
        <Box
          style={{
            position: "relative",
            height: hourHeight * 24,
          }}
        >
          {Array.from({ length: 24 }, (_, i) => (
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
              {String(i).padStart(2, "0")}:00
            </Text>
          ))}
        </Box>
      </Stack>
    </Box>
  );
}
