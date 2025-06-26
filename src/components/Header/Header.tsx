import { Text, Title, Stack, Group } from "@mantine/core";

interface HeaderProps {
  headerTitle?: string;
  leftSalary?: string;
  rightSalary?: string;
  description?: string;
  primaryButton?: React.ReactNode;
  secondaryButton?: React.ReactNode;
}

export default function Header({
  headerTitle,
  leftSalary,
  rightSalary,
  description,
  primaryButton,
  secondaryButton,
}: HeaderProps) {
  return (
    <Stack align="center" justify="center" py="xl">
      <Group align="center" justify="center">
        {leftSalary && (
          <Text c="red" fw={700}>
            {leftSalary}
          </Text>
        )}
        <Title order={1}>{headerTitle}</Title>
        {rightSalary && (
          <Text c={leftSalary ? "blue" : "red"} fw={leftSalary ? 400 : 700}>
            {rightSalary} / hour
          </Text>
        )}
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
