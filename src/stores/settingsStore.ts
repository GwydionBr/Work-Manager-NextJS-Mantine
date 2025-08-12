"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Currency,
  RoundingAmount,
  RoundingDirection,
  RoundingInTimeSections,
} from "@/types/settings.types";
import * as actions from "@/actions";

import { SettingsTab } from "@/components/Settings/SettingsModal";

interface SettingsState {
  isModalOpen: boolean;
  selectedTab: SettingsTab;
  settingsId: string | null;
  defaultSalaryCurrency: Currency;
  defaultSalaryAmount: number;
  defaultFinanceCurrency: Currency;
  defaultProjectHourlyPayment: boolean;
  roundingAmount: RoundingAmount;
  roundingMode: RoundingDirection;
  customRoundingAmount: number;
  defaultGroupColor: string | null;
  isAsideOpen: boolean;
  isFetching: boolean;
  lastFetch: Date | null;
  roundInTimeSections: boolean;
  timeSectionInterval: number;
  automaticlyStopOtherTimer: boolean;
}

interface SettingsActions {
  fetchSettings: () => Promise<void>;
  setSelectedTab: (tab: SettingsTab) => void;
  setIsModalOpen: (isModalOpen: boolean) => void;
  setDefaultSalaryCurrency: (currency: Currency) => void;
  setDefaultSalaryAmount: (salaryAmount: number) => void;
  setDefaultFinanceCurrency: (financeCurrency: Currency) => void;
  setDefaultProjectHourlyPayment: (projectHourlyPayment: boolean) => void;
  setRoundingAmount: (roundingAmount: RoundingAmount) => Promise<void>;
  setRoundingMode: (roundingMode: RoundingDirection) => Promise<void>;
  setCustomRoundingAmount: (customRoundingAmount: number) => Promise<void>;
  setDefaultGroupColor: (color: string | null) => void;
  setIsAsideOpen: (isAsideOpen: boolean) => void;
  setRoundInTimeSections: (roundInTimeSections: boolean) => Promise<void>;
  setTimeSectionInterval: (timeSectionInterval: number) => Promise<void>;
  setAutomaticlyStopOtherTimer: (automaticlyStopOtherTimer: boolean) => Promise<void>;
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
      roundingAmount: "s",
      roundingMode: "up",
      customRoundingAmount: 0,
      defaultSalaryAmount: 0,
      defaultGroupColor: null,
      isAsideOpen: false,
      isFetching: true,
      lastFetch: null,
      roundInTimeSections: false,
      timeSectionInterval: 10,
      automaticlyStopOtherTimer: false,

      fetchSettings: async () => {
        const { data } = await actions.getSettings();
        if (data) {
          set({
            settingsId: data.id,
            defaultSalaryCurrency: data.default_currency,
            defaultSalaryAmount: data.default_salary_amount,
            defaultFinanceCurrency: data.default_finance_currency,
            defaultProjectHourlyPayment: data.default_project_hourly_payment,
            roundingAmount: data.rounding_amount,
            roundingMode: data.rounding_direction,
            customRoundingAmount: data.rounding_custom_amount,
            defaultGroupColor: data.default_group_color,
            roundInTimeSections: data.round_in_time_sections,
            timeSectionInterval: data.time_section_interval,
            automaticlyStopOtherTimer: data.automaticly_stop_other_timer,
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
      setRoundingAmount: async (roundingAmount: RoundingAmount) => {
        await actions.updateSettings({
          id: get().settingsId ?? "",
          rounding_amount: roundingAmount,
        });
        set({ roundingAmount: roundingAmount });
      },
      setRoundingMode: async (roundingMode: RoundingDirection) => {
        await actions.updateSettings({
          id: get().settingsId ?? "",
          rounding_direction: roundingMode,
        });
        set({ roundingMode: roundingMode });
      },
      setCustomRoundingAmount: async (customRoundingAmount: number) => {
        await actions.updateSettings({
          id: get().settingsId ?? "",
          rounding_custom_amount: customRoundingAmount,
        });
        set({ customRoundingAmount: customRoundingAmount });
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
      setRoundInTimeSections: async (roundInTimeSections: boolean) => {
        await actions.updateSettings({
          id: get().settingsId ?? "",
          round_in_time_sections: roundInTimeSections,
        });
        set({ roundInTimeSections: roundInTimeSections });
      },
      setTimeSectionInterval: async (timeSectionInterval: number) => {
        await actions.updateSettings({
          id: get().settingsId ?? "",
          time_section_interval: timeSectionInterval,
        });
        set({ timeSectionInterval: timeSectionInterval });
      },
      setAutomaticlyStopOtherTimer: async (automaticlyStopOtherTimer: boolean) => {
        await actions.updateSettings({
          id: get().settingsId ?? "",
          automaticly_stop_other_timer: automaticlyStopOtherTimer,
        });
        console.log(automaticlyStopOtherTimer);
        set({ automaticlyStopOtherTimer: automaticlyStopOtherTimer });
      },
    }),
    {
      name: "settings",
    }
  )
);

export default useSettingsStore;
