"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as actions from "@/actions";

import { SettingsTab } from "@/components/Settings/SettingsModal";

import { Currency, RoundingDirection, Locale } from "@/types/settings.types";
import { TimerRoundingSettings } from "@/types/timeTracker.types";

interface SettingsState {
  isModalOpen: boolean;
  selectedTab: SettingsTab;
  settingsId: string | null;
  defaultSalaryCurrency: Currency;
  defaultSalaryAmount: number;
  defaultFinanceCurrency: Currency;
  defaultProjectHourlyPayment: boolean;
  timerRoundingSettings: TimerRoundingSettings;
  showCalendarTime: boolean;
  defaultGroupColor: string | null;
  isAsideOpen: boolean;
  isWorkNavbarOpen: boolean;
  isFinanceNavbarOpen: boolean;
  isFetching: boolean;
  lastFetch: Date | null;
  automaticlyStopOtherTimer: boolean;
  locale: Locale;
  format24h: boolean;
}

interface SettingsActions {
  resetStore: () => void;
  fetchSettings: () => Promise<void>;
  setSelectedTab: (tab: SettingsTab) => void;
  setIsModalOpen: (isModalOpen: boolean) => void;
  toggleWorkNavbar: () => void;
  toggleFinanceNavbar: () => void;
  setDefaultSalaryCurrency: (currency: Currency) => void;
  setDefaultSalaryAmount: (salaryAmount: number) => void;
  setDefaultFinanceCurrency: (financeCurrency: Currency) => void;
  setDefaultProjectHourlyPayment: (projectHourlyPayment: boolean) => void;
  setRoundingDirection: (roundingDirection: RoundingDirection) => Promise<void>;
  setRoundingInterval: (roundingInterval: number) => Promise<void>;
  setDefaultGroupColor: (color: string | null) => void;
  setIsAsideOpen: (isAsideOpen: boolean) => void;
  setRoundInTimeFragments: (roundInTimeFragments: boolean) => Promise<void>;
  setTimeFragmentInterval: (timeFragmentInterval: number) => Promise<void>;
  setAutomaticlyStopOtherTimer: (
    automaticlyStopOtherTimer: boolean
  ) => Promise<void>;
  setLocale: (locale: Locale) => Promise<void>;
  setFormat24h: (format24h: boolean) => Promise<void>;
  setShowCalendarTime: (showCalendarTime: boolean) => Promise<void>;
  getLocalizedText: (de: string, en: string) => string;
}

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set, get) => ({
      isModalOpen: false,
      selectedTab: SettingsTab.GENERAL,
      settingsId: null,
      defaultSalaryCurrency: "USD",
      defaultFinanceCurrency: "USD",
      defaultProjectHourlyPayment: true,
      roundingDirection: "up",
      roundingInterval: 1,
      timerRoundingSettings: {
        roundingInterval: 1,
        roundingDirection: "up",
        roundInTimeFragments: false,
        timeFragmentInterval: 10,
      },
      defaultSalaryAmount: 0,
      defaultGroupColor: null,
      showCalendarTime: true,
      isAsideOpen: false,
      isWorkNavbarOpen: false,
      isFinanceNavbarOpen: false,
      isFetching: true,
      lastFetch: null,
      roundInTimeFragments: false,
      timeFragmentInterval: 10,
      automaticlyStopOtherTimer: false,
      locale: "en-US",
      format24h: false,

      resetStore: () =>
        set({
          isModalOpen: false,
          selectedTab: SettingsTab.GENERAL,
          settingsId: null,
          defaultSalaryCurrency: "USD",
          defaultSalaryAmount: 0,
          defaultFinanceCurrency: "USD",
          defaultProjectHourlyPayment: true,
          timerRoundingSettings: {
            roundingInterval: 1,
            roundingDirection: "up",
            roundInTimeFragments: false,
            timeFragmentInterval: 10,
          },
          defaultGroupColor: null,
          showCalendarTime: true,
          isAsideOpen: false,
          isWorkNavbarOpen: false,
          isFinanceNavbarOpen: false,
          isFetching: true,
          lastFetch: null,
          automaticlyStopOtherTimer: false,
          locale: "en-US",
          format24h: false,
        }),
      fetchSettings: async () => {
        const { data } = await actions.getSettings();
        if (data) {
          set({
            settingsId: data.id,
            defaultSalaryCurrency: data.default_currency,
            defaultSalaryAmount: data.default_salary_amount,
            defaultFinanceCurrency: data.default_finance_currency,
            defaultProjectHourlyPayment: data.default_project_hourly_payment,
            showCalendarTime: data.show_calendar_time,
            timerRoundingSettings: {
              roundingInterval: data.rounding_interval,
              roundingDirection: data.rounding_direction,
              roundInTimeFragments: data.round_in_time_sections,
              timeFragmentInterval: data.time_section_interval,
            },
            defaultGroupColor: data.default_group_color,
            automaticlyStopOtherTimer: data.automaticly_stop_other_timer,
            locale: data.locale,
            format24h: data.format_24h,
          });
        }
        set({ isFetching: false, lastFetch: new Date() });
      },
      setSelectedTab: (tab: SettingsTab) => {
        set({ selectedTab: tab });
      },
      setIsModalOpen: (isModalOpen: boolean) => {
        set({ isModalOpen: isModalOpen });
      },
      toggleWorkNavbar: () => {
        set({ isWorkNavbarOpen: !get().isWorkNavbarOpen });
      },
      toggleFinanceNavbar: () => {
        set({ isFinanceNavbarOpen: !get().isFinanceNavbarOpen });
      },
      setDefaultSalaryCurrency: async (currency: Currency) => {
        await actions.updateSettings({
          id: get().settingsId ?? "",
          default_currency: currency,
        });
        set({ defaultSalaryCurrency: currency });
      },
      setDefaultSalaryAmount: async (salaryAmount: number) => {
        await actions.updateSettings({
          id: get().settingsId ?? "",
          default_salary_amount: salaryAmount,
        });
        set({ defaultSalaryAmount: salaryAmount });
      },
      setDefaultProjectHourlyPayment: async (projectHourlyPayment: boolean) => {
        await actions.updateSettings({
          id: get().settingsId ?? "",
          default_project_hourly_payment: projectHourlyPayment,
        });
        set({ defaultProjectHourlyPayment: projectHourlyPayment });
      },
      setShowCalendarTime: async (showCalendarTime: boolean) => {
        await actions.updateSettings({
          id: get().settingsId ?? "",
          show_calendar_time: showCalendarTime,
        });
        set({ showCalendarTime: showCalendarTime });
      },

      setRoundingDirection: async (roundingDirection: RoundingDirection) => {
        const { timerRoundingSettings } = get();
        await actions.updateSettings({
          id: get().settingsId ?? "",
          rounding_direction: roundingDirection,
        });
        set({
          timerRoundingSettings: {
            ...timerRoundingSettings,
            roundingDirection: roundingDirection,
          },
        });
      },
      setRoundingInterval: async (roundingInterval: number) => {
        const { timerRoundingSettings } = get();
        await actions.updateSettings({
          id: get().settingsId ?? "",
          rounding_interval: roundingInterval,
        });
        set({
          timerRoundingSettings: {
            ...timerRoundingSettings,
            roundingInterval: roundingInterval,
          },
        });
      },

      setDefaultFinanceCurrency: async (financeCurrency: Currency) => {
        await actions.updateSettings({
          id: get().settingsId ?? "",
          default_finance_currency: financeCurrency,
        });
        set({ defaultFinanceCurrency: financeCurrency });
      },
      setDefaultGroupColor: async (color: string | null) => {
        await actions.updateSettings({
          id: get().settingsId ?? "",
          default_group_color: color,
        });
        set({ defaultGroupColor: color });
      },
      setIsAsideOpen: (isAsideOpen: boolean) => {
        set({ isAsideOpen: isAsideOpen });
      },
      setRoundInTimeFragments: async (roundInTimeSections: boolean) => {
        const { timerRoundingSettings } = get();
        await actions.updateSettings({
          id: get().settingsId ?? "",
          round_in_time_sections: roundInTimeSections,
        });
        set({
          timerRoundingSettings: {
            ...timerRoundingSettings,
            roundInTimeFragments: roundInTimeSections,
          },
        });
      },
      setTimeFragmentInterval: async (timeSectionInterval: number) => {
        const { timerRoundingSettings } = get();
        await actions.updateSettings({
          id: get().settingsId ?? "",
          time_section_interval: timeSectionInterval,
        });
        set({
          timerRoundingSettings: {
            ...timerRoundingSettings,
            timeFragmentInterval: timeSectionInterval,
          },
        });
      },
      setAutomaticlyStopOtherTimer: async (
        automaticlyStopOtherTimer: boolean
      ) => {
        await actions.updateSettings({
          id: get().settingsId ?? "",
          automaticly_stop_other_timer: automaticlyStopOtherTimer,
        });
        console.log(automaticlyStopOtherTimer);
        set({ automaticlyStopOtherTimer: automaticlyStopOtherTimer });
      },
      setLocale: async (locale: Locale) => {
        await actions.updateSettings({
          id: get().settingsId ?? "",
          locale: locale,
        });
        set({ locale: locale });
      },
      setFormat24h: async (format24h: boolean) => {
        await actions.updateSettings({
          id: get().settingsId ?? "",
          format_24h: format24h,
        });
        set({ format24h: format24h });
      },
      getLocalizedText(de, en) {
        return get().locale === "de-DE" ? de : en;
      },
    }),
    {
      name: "settings",
    }
  )
);

export default useSettingsStore;
