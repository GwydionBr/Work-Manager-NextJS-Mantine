"use client";

import { Box, Stack, Text } from "@mantine/core";

interface TimeColumnProps {
  hourHeight: number;
}

export function TimeColumn({
  hourHeight,
}: TimeColumnProps) {
  return (
    <Box w={56} style={{ flex: "0 0 auto" }} >
      <Stack gap="xs" >
        <Box
          style={{
            position: "relative",
            height: hourHeight * 24,
          }}
        >
          {Array.from({ length: 24 + 1 }, (_, i) => (
            <Text
              key={i}
              size="xs"
              c="light-dark(var(--mantine-color-gray-9), var(--mantine-color-gray-0))"
              style={{
                position: "absolute",
                top: i * hourHeight - 4,
                left: 2,
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
