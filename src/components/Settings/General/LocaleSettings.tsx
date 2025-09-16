"use client";

import { useSettingsStore } from "@/stores/settingsStore";

import { Group, Select, Switch, Text } from "@mantine/core";

import { Locale } from "@/types/settings.types";
import ReactCountryFlag from "react-country-flag";
import { locales } from "@/constants/settings";

export default function LocaleSettings() {
  const { locale, setLocale, format24h, setFormat24h } = useSettingsStore();

  const currentLocale = locales.find((l) => l.value === locale);

  return (
    <Group>
      <Select
        data={locales}
        label={locale === "de-DE" ? "Sprache & Format" : "Language & Format"}
        placeholder={
          locale === "de-DE"
            ? "Sprache & Format auswählen"
            : "Select Language & Format"
        }
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
      <Select
        data={[
          { value: "24h", label: "24h" },
          { value: "12h", label: "12h" },
        ]}
        label={locale === "de-DE" ? "Zeitformat" : "Time Format"}
        placeholder={
          locale === "de-DE" ? "Zeitformat auswählen" : "Select Time Format"
        }
        value={format24h ? "24h" : "12h"}
        onChange={(value) => setFormat24h(value === "24h")}
      />
    </Group>
  );
}
