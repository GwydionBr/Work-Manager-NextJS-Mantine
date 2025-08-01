import { Card, Stack, Text } from "@mantine/core";

interface TimeTrackerInfoCardProps {
  projectTitle: string;
  salary: string;
  hourlyPayment: boolean;
  currency: string;
  roundingMode: string;
}

export default function TimeTrackerInfoCard({
  projectTitle,
  salary,
  hourlyPayment,
  currency,
  roundingMode,
}: TimeTrackerInfoCardProps) {
  return (
    <Stack>
      <Text>Project Title: {projectTitle}</Text>
      <Text>Salary: {salary}</Text>
      <Text>Hourly Payment: {hourlyPayment ? "Yes" : "No"}</Text>
      <Text>Currency: {currency}</Text>
      <Text>Rounding Mode: {roundingMode}</Text>
    </Stack>
  );
}
