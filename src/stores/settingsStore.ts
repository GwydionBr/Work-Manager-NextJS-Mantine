"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Currency,
  RoundingAmount,
  RoundingDirection,
} from "@/types/settings.types";

interface SettingsState {
  currency: Currency;
  roundingAmount: RoundingAmount;
  roundingMode: RoundingDirection;
}

interface SettingsActions {
  setCurrency: (currency: Currency) => void;
  setRoundingAmount: (roundingAmount: RoundingAmount) => void;
  setRoundingMode: (roundingMode: RoundingDirection) => void;
}

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set, get) => ({
      currency: "USD",
      roundingAmount: "min",
      roundingMode: "up",
      setCurrency: (currency: Currency) => {
        set({ currency });
      },
      setRoundingAmount: (roundingAmount: RoundingAmount) => {
        set({ roundingAmount });
      },
      setRoundingMode: (roundingMode: RoundingDirection) => {
        set({ roundingMode });
      },
    }),
    {
      name: "settings",
    }
  )
);

export default useSettingsStore;
