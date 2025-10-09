"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FinanceTab } from "@/types/finance.types";

interface FinanceStoreState {
  activeTab: FinanceTab;
}

interface FinanceStoreActions {
  resetStore: () => void;
  setActiveTab: (tab: FinanceTab) => void;
}

export const useFinanceStore = create<
  FinanceStoreState & FinanceStoreActions
>()(
  persist(
    (set) => ({
      resetStore: () => {
        set({ activeTab: FinanceTab.Single });
      },
      activeTab: FinanceTab.Single,

      setActiveTab(tab) {
        set({ activeTab: tab });
      },
    }),
    {
      name: "finance-store",
      partialize: (state) => ({
        activeTab: state.activeTab,
      }),
    }
  )
);
