"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Currency,
  RoundingAmount,
  RoundingDirection,
} from "@/types/settings.types";
import * as actions from "@/actions";
import { Tables } from "@/types/db.types";

interface SettingsState {
  settings: Tables<"settings"> | null;
  currency: Currency;
  financeCurrency: Currency;
  roundingAmount: RoundingAmount;
  roundingMode: RoundingDirection;
  customRoundingAmount: number;
  isAsideOpen: boolean;
}

interface SettingsActions {
  fetchSettings: () => void;
  setCurrency: (currency: Currency) => void;
  setRoundingAmount: (roundingAmount: RoundingAmount) => void;
  setRoundingMode: (roundingMode: RoundingDirection) => void;
  setCustomRoundingAmount: (customRoundingAmount: number) => void;
  setFinanceCurrency: (financeCurrency: Currency) => void;
  setIsAsideOpen: (isAsideOpen: boolean) => void;
}

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set, get) => ({
      settings: null,
      currency: "USD",
      financeCurrency: "USD",
      roundingAmount: "min",
      roundingMode: "up",
      customRoundingAmount: 0,
      isAsideOpen: true,

      fetchSettings: async () => {
        const { data } = await actions.getSettings();
        if (data) {
          set({
            settings: data,
            currency: data.default_currency,
            roundingAmount: data.rounding_amount,
            roundingMode: data.rounding_direction,
            customRoundingAmount: data.rounding_custom_amount,
            financeCurrency: data.default_finance_currency,
          });
        }
      },
      setCurrency: async (currency: Currency) => {
        await actions.updateSettings({
          id: get().settings?.id,
          default_currency: currency,
        });
        set({ currency: currency });
      },
      setRoundingAmount: async (roundingAmount: RoundingAmount) => {
        await actions.updateSettings({
          id: get().settings?.id,
          rounding_amount: roundingAmount,
        });
        set({ roundingAmount: roundingAmount });
      },
      setRoundingMode: async (roundingMode: RoundingDirection) => {
        await actions.updateSettings({
          id: get().settings?.id,
          rounding_direction: roundingMode,
        });
        set({ roundingMode: roundingMode });
      },
      setCustomRoundingAmount: async (customRoundingAmount: number) => {
        await actions.updateSettings({
          id: get().settings?.id,
          rounding_custom_amount: customRoundingAmount,
        });
        set({ customRoundingAmount: customRoundingAmount });
      },
      setFinanceCurrency: async (financeCurrency: Currency) => {
        await actions.updateSettings({
          id: get().settings?.id,
          default_finance_currency: financeCurrency,
        });
        set({ financeCurrency: financeCurrency });
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
