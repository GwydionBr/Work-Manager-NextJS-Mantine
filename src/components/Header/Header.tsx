import { Text, Title, Stack, Group } from "@mantine/core";

interface HeaderProps {
  headerTitle?: string;
  description?: string;
  primaryButton?: React.ReactNode;
  secondaryButton?: React.ReactNode;
}

export default function Header({
  headerTitle,
  description,
  primaryButton,
  secondaryButton,
}: HeaderProps) {
  return (
    <Stack align="center" justify="center" py="xl">
      <Group align="center" justify="center">
        <Title order={1}>{headerTitle}</Title>
        {description && <Text>{description}</Text>}
        {primaryButton && primaryButton}
      </Group>
      {secondaryButton && secondaryButton}
    </Stack>
  );
}
