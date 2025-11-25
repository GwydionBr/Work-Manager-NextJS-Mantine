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
import {
  formatDate as formatDateUtil,
  formatMonth as formatMonthUtil,
  formatTime as formatTimeUtil,
  formatDateTime as formatDateTimeUtil,
  formatTimeSpan as formatTimeSpanUtil,
  formatMoney as formatMoneyUtil,
  getCurrencySymbol as getCurrencySymbolUtil,
  getLocalizedText as getLocalizedTextUtil,
} from "@/utils/formatFunctions";

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
  format24h: boolean;
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
  const currentFormat24h = isClient ? format24h : true;

  const value = useMemo<LocaleContextValue>(() => {
    const formatDate = (date: Date): string => {
      return formatDateUtil(date, currentLocale);
    };

    const formatMonth = (month: number): string => {
      return formatMonthUtil(month, currentLocale);
    };

    const formatTime = (seconds: number): string => {
      return formatTimeUtil(seconds);
    };

    const formatDateTime = (date: Date): string => {
      return formatDateTimeUtil(date, currentFormat24h);
    };

    const formatTimeSpan = (start: Date, end: Date): string => {
      return formatTimeSpanUtil(start, end, currentFormat24h);
    };

    const formatMoney = (amount: number, currency: Currency): string => {
      return formatMoneyUtil(amount, currency, currentLocale);
    };

    const getCurrencySymbol = (currency: Currency): string => {
      return getCurrencySymbolUtil(currency);
    };

    const getLocalizedText = (de: string, en: string): string => {
      return getLocalizedTextUtil(de, en, currentLocale);
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
      format24h: currentFormat24h,
      isClient,
    };
  }, [currentLocale, currentFormat24h, isClient]);

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
