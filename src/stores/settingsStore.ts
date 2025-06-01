"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Currency,
  RoundingAmount,
  RoundingDirection,
} from "@/types/settings.types";
import * as actions from "@/actions";

interface SettingsState {
  settingsId: string | null;
  defaultSalaryCurrency: Currency;
  defaultSalaryAmount: number;
  defaultFinanceCurrency: Currency;
  roundingAmount: RoundingAmount;
  roundingMode: RoundingDirection;
  customRoundingAmount: number;
  isAsideOpen: boolean;
}

interface SettingsActions {
  fetchSettings: () => void;
  setDefaultSalaryCurrency: (currency: Currency) => void;
  setDefaultSalaryAmount: (salaryAmount: number) => void;
  setDefaultFinanceCurrency: (financeCurrency: Currency) => void;
  setRoundingAmount: (roundingAmount: RoundingAmount) => void;
  setRoundingMode: (roundingMode: RoundingDirection) => void;
  setCustomRoundingAmount: (customRoundingAmount: number) => void;
  setIsAsideOpen: (isAsideOpen: boolean) => void;
}

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set, get) => ({
      settingsId: null,
      defaultSalaryCurrency: "USD",
      defaultFinanceCurrency: "USD",
      roundingAmount: "s",
      roundingMode: "up",
      customRoundingAmount: 0,
      defaultSalaryAmount: 0,
      isAsideOpen: true,

      fetchSettings: async () => {
        const { data } = await actions.getSettings();
        if (data) {
          set({
            settingsId: data.id,
            defaultSalaryCurrency: data.default_currency,
            defaultSalaryAmount: data.default_salary_amount,
            defaultFinanceCurrency: data.default_finance_currency,
            roundingAmount: data.rounding_amount,
            roundingMode: data.rounding_direction,
            customRoundingAmount: data.rounding_custom_amount,
          });
        }
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
      setIsAsideOpen: (isAsideOpen: boolean) => {
        set({ isAsideOpen: isAsideOpen });
      },
    }),
    {
      name: "settings",
    }
  )
);

export default useSettingsStore;
