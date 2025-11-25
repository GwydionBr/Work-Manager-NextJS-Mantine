"use client";

import { useFormatter } from "@/hooks/useFormatter";

import { Center, Text } from "@mantine/core";

export default function ErrorPage() {
  const { getLocalizedText } = useFormatter();
  return (
    <Center>
      <Text>
        {getLocalizedText(
          "Etwas ist schiefgelaufen",
          "Sorry, something went wrong"
        )}
      </Text>
    </Center>
  );
}
