"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import { Currency, Locale } from "@/types/settings.types";
import { shortCurrencies } from "@/constants/settings";

interface LocaleContextValue {
  // Formatting functions
  formatDate: (date: Date) => string;
  formatMonth: (month: number) => string;
  formatTime: (seconds: number) => string;
  formatDateTime: (date: Date) => string;
  formatTimeSpan: (start: Date, end: Date) => string;
  formatMoney: (amount: number, currency: Currency) => string;
  getCurrencySymbol: (currency: Currency) => string;
  // Locale functions
  getLocalizedText: (de: string, en: string) => string;
  // Shared values
  locale: Locale;
  isClient: boolean;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = useSettingsStore((state) => state.locale);
  const format24h = useSettingsStore((state) => state.format24h);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // During SSR, always use English to prevent hydration mismatch
  const currentLocale: Locale = isClient ? locale : "en-US";

  const value = useMemo<LocaleContextValue>(() => {
    const formatDate = (date: Date): string => {
      return date.toLocaleDateString(currentLocale, {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
    };

    const formatMonth = (month: number): string => {
      return new Date(2023, month - 1, 1).toLocaleString(currentLocale, {
        month: "long",
      });
    };

    const formatTime = (seconds: number): string => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.ceil((seconds % 3600) / 60);

      if (hours === 0) {
        return `${minutes} min`;
      }

      return `${hours}h - ${minutes}min`;
    };

    const formatDateTime = (date: Date): string => {
      const localeForTime = format24h ? "de-DE" : "en-US";
      return date.toLocaleString(localeForTime, {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const formatTimeSpan = (start: Date, end: Date): string => {
      const localeForTime = format24h ? "de-DE" : "en-US";
      const formatSingleDateTime = (date: Date): string => {
        return date.toLocaleString(localeForTime, {
          hour: "2-digit",
          minute: "2-digit",
        });
      };
      return `${formatSingleDateTime(start)} - ${formatSingleDateTime(end)}`;
    };

    const formatMoney = (amount: number, currency: Currency): string => {
      return amount.toLocaleString(currentLocale, {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
    };

    const getCurrencySymbol = (currency: Currency): string => {
      return shortCurrencies.find((c) => c.value === currency)?.label ?? "$";
    };

    const getLocalizedText = (de: string, en: string): string => {
      return currentLocale === "de-DE" ? de : en;
    };

    return {
      formatDate,
      formatMonth,
      formatTime,
      formatDateTime,
      formatTimeSpan,
      formatMoney,
      getCurrencySymbol,
      getLocalizedText,
      locale: currentLocale,
      isClient,
    };
  }, [currentLocale, format24h, isClient]);

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useFormatter() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error("useFormatter must be used within a FormatterProvider");
  }
  return context;
}

/**
 * Alias for useFormatter - provides locale-specific text formatting.
 * This is kept for backward compatibility.
 */
export function useLocale() {
  const { getLocalizedText, locale, isClient } = useFormatter();
  return {
    getLocalizedText,
    locale,
    isClient,
  };
}
