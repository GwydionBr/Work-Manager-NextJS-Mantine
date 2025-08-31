"use client";

import { useSettingsStore } from "@/stores/settingsStore";

import { DateTimePicker, DateTimePickerProps } from "@mantine/dates";

export default function LocaleDateTimePicker({
  label,
  value,
  onChange,
  error,
  ...props
}: DateTimePickerProps) {
  const { locale } = useSettingsStore();

  return (
    <DateTimePicker
      valueFormat={
        locale === "de-DE" ? "DD. MMMM YYYY HH:mm" : "MMM DD, YYYY hh:mm A"
      }
      timePickerProps={{
        format: locale === "de-DE" ? "24h" : "12h",
      }}
      label={label}
      value={value}
      onChange={onChange}
      error={error}
      {...props}
    />
  );
}
