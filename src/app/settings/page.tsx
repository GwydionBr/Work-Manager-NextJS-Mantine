import SchemeButtonGroup from "@/components/SchemeToggle/SchemeButtonGroup";
import classes from "./Settings.module.css";
import { Group, Text } from "@mantine/core";
import Header from "@/components/Header/Header";

export default function SettingsPage() {
  return (
    <div className={classes.settingsMainContainer}>
      <Header headerTitle="Settings Page" />
      <Group>
        <Text pt="xl">Choose your color scheme</Text>
        <SchemeButtonGroup />
      </Group>
    </div>
  );
}