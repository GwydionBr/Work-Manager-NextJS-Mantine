import { Text, Title, Stack, Group } from "@mantine/core";

interface HeaderProps {
  headerTitle?: string;
  salary?: string;
  paymentPerProject?: boolean;
  description?: string;
  primaryButton?: React.ReactNode;
  secondaryButton?: React.ReactNode;
}

export default function Header({
  headerTitle,
  salary,
  paymentPerProject,
  description,
  primaryButton,
  secondaryButton,
}: HeaderProps) {
  return (
    <Stack align="center" justify="center" py="xl">
      <Group align="center" justify="center">
        {paymentPerProject && <Text>{salary}</Text>}
        <Title order={1}>{headerTitle}</Title>
        {!paymentPerProject && <Text>{salary} / hour</Text>}
        {primaryButton && primaryButton}
      </Group>
      {description && (
        <Title order={2} size="sm">
          {description}
        </Title>
      )}
      {secondaryButton && secondaryButton}
    </Stack>
  );
}
