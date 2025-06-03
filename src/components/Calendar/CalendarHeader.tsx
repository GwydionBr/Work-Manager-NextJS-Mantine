import { Box, Grid, Group, Text } from "@mantine/core";
import PrevActionIcon from "../UI/Buttons/PrevActionIcon";
import NextActionIcon from "../UI/Buttons/NextActionIcon";
import dayjs from "dayjs";
import classes from "./Calendar.module.css";
import AddAppointmentButton from "./Appointment/AddAppointmentButton";

interface CalendarHeaderProps {
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

export default function CalendarHeader({
  currentDate,
  onPreviousMonth,
  onNextMonth,
}: CalendarHeaderProps) {
  return (
    <Grid>
      <Grid.Col span={1}>
        <Group justify="center" px="sm">
          <AddAppointmentButton />
        </Group>
      </Grid.Col>
      <Grid.Col span={10}>
        <Group justify="center" w="100%" mb="md">
          <PrevActionIcon onClick={onPreviousMonth} iconSize={35} size={35} />
          <Text fw={500} size="lg" className={classes.calendarDayNumberNormal}>
            {dayjs(currentDate).format("MMMM YYYY")}
          </Text>
          <NextActionIcon onClick={onNextMonth} iconSize={35} size={35} />
        </Group>
      </Grid.Col>
    </Grid>
  );
}
