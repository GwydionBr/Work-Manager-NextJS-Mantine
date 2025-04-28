import SchemeButtonGroup from "@/components/SchemeToggle/SchemeButtonGroup";
import classes from "./Settings.module.css";
import { Group, Title, Text } from "@mantine/core";

export default function SettingsPage() {
  return (
    <div className={classes.settingsMainContainer}>
      <Title order={1} pb="xl">Settings Page</Title>
      <Group>
        <Text>Choose your color scheme</Text>
        <SchemeButtonGroup />
      </Group>
    </div>
  );
}