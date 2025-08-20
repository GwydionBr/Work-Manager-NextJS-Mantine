"use client";

import { useSettingsStore } from "@/stores/settingsStore";

import { Group, Select, Text } from "@mantine/core";

import { Locale } from "@/types/settings.types";
import ReactCountryFlag from "react-country-flag";

const locales = [
  {
    value: "en-US",
    label: "English",
    flag: "US",
  },
  {
    value: "de-DE",
    label: "German",
    flag: "DE",
  },
] as const;

export default function LocaleSettings() {
  const { locale, setLocale } = useSettingsStore();

  const currentLocale = locales.find((l) => l.value === locale);

  return (
    <Group>
      <Select
        data={locales}
        label="Locale"
        placeholder="Select Locale"
        value={locale}
        allowDeselect={false}
        onChange={(value) => setLocale(value as Locale)}
        leftSection={
          currentLocale && (
            <ReactCountryFlag
              countryCode={currentLocale.flag}
              svg
              style={{ width: "1.2em", height: "1.2em" }}
            />
          )
        }
        renderOption={({ option, ...others }) => {
          const localeData = locales.find((l) => l.value === option.value);
          return (
            <div {...others}>
              <Group gap="xs">
                <ReactCountryFlag
                  countryCode={localeData?.flag || "US"}
                  svg
                  style={{ width: "1.2em", height: "1.2em" }}
                />
                <Text>{option.label}</Text>
              </Group>
            </div>
          );
        }}
      />
    </Group>
  );
}
