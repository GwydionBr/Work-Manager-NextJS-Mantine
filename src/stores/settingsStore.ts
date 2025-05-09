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
  roundingAmount: RoundingAmount;
  roundingMode: RoundingDirection;
}

interface SettingsActions {
  fetchSettings: () => void;
  setCurrency: (currency: Currency) => void;
  setRoundingAmount: (roundingAmount: RoundingAmount) => void;
  setRoundingMode: (roundingMode: RoundingDirection) => void;
}

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set, get) => ({
      settings: null,
      currency: "USD",
      roundingAmount: "min",
      roundingMode: "up",
      fetchSettings: async () => {
        const { data, error } = await actions.getSettings();
        if (data) {
          set({
            settings: data,
            currency: data.default_currency,
            roundingAmount: data.rounding_amount,
            roundingMode: data.rounding_direction,
          });
        }
      },
      setCurrency: async (currency: Currency) => {
        const { data, error } = await actions.updateSettings({
          id: get().settings?.id,
          default_currency: currency,
        });
        set({ currency: currency });
      },
      setRoundingAmount: async (roundingAmount: RoundingAmount) => {
        const { data, error } = await actions.updateSettings({
          id: get().settings?.id,
          rounding_amount: roundingAmount,
        });
        set({ roundingAmount: roundingAmount });
      },
      setRoundingMode: async (roundingMode: RoundingDirection) => {
        const { data, error } = await actions.updateSettings({
          id: get().settings?.id,
          rounding_direction: roundingMode,
        });
        set({ roundingMode: roundingMode });
      },
    }),
    {
      name: "settings",
    }
  )
);

export default useSettingsStore;
