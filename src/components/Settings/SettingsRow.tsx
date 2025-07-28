"use client";

import { Grid, Text } from "@mantine/core";

import classes from "./Settings.module.css";

interface SettingsRowProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

export default function SettingsRow({
  title,
  description,
  children,
}: SettingsRowProps) {
  return (
    <Grid
      className={classes.settingRowContainer}
      align="center"
      justify="center"
    >
      <Grid.Col span={2} className={classes.borderRight}>
        <Text>{title ?? ""}</Text>
      </Grid.Col>
      <Grid.Col
        span={description ? 3 : 0}
        className={description ? classes.borderRight : ""}
      >
        <Text>{description ?? ""}</Text>
      </Grid.Col>
      <Grid.Col
        span={description ? 7 : 9}
        className={classes.childrenContainer}
      >
        {children}
      </Grid.Col>
    </Grid>
  );
}
