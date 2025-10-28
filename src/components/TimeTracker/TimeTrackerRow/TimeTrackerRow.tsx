"use client";

import { Paper, PaperProps, Grid, Divider, Group, Flex } from "@mantine/core";

import classes from "../TimeTracker.module.css";

interface TimeTrackerRowProps extends PaperProps {
  icon: React.ReactNode;
  children?: React.ReactNode;
}

export default function TimeTrackerRow({
  icon,
  children,
  ...props
}: TimeTrackerRowProps) {
  // useEffect(() => {
  //   if (isMemo) {
  //     setOuterBorder(
  //       "2px solid light-dark(var(--mantine-color-gray-5), var(--mantine-color-gray-6))"
  //     );
  //   } else if (state === activationState) {
  //     setOuterBorder(`2px solid ${color}`);
  //   } else if (!color) {
  //     setOuterBorder(
  //       "1px solid light-dark(var(--mantine-color-gray-5), var(--mantine-color-gray-6))"
  //     );
  //   }
  // }, [isMemo, state, activationState, color]);

  return (
    <Paper w={200} radius="xl" withBorder {...props}>
      <Grid align="center" gutter={0} >
        <Grid.Col span={2.25}>
          <Group wrap="nowrap" w="100%" gap="0">
            {icon}
            <Divider orientation="vertical" h={50} />
          </Group>
        </Grid.Col>
        <Grid.Col span={9.75}>{children}</Grid.Col>
      </Grid>
    </Paper>
  );
}
