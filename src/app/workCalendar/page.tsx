import WorkCalendar from "@/components/Work/Calendar/WorkCalendar";
import { Box } from "@mantine/core";
import Header from "@/components/Header/Header";

export default function WorkCalendarPage() {
  return (
    <Box>
      <Header headerTitle="Work Calendar" />
      <WorkCalendar />
    </Box>
  );
}
