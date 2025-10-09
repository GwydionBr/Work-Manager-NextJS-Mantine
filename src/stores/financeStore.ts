"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TablesInsert } from "@/types/db.types";
import { FinanceTab, StoreSingleCashFlow } from "@/types/finance.types";

interface FinanceStoreState {
  activeTab: FinanceTab;
}

interface FinanceStoreActions {
  resetStore: () => void;
  sessionPayout: (
    sessionIds: string[],
    cashflow: TablesInsert<"single_cash_flow">,
    categoryIds: string[]
  ) => Promise<StoreSingleCashFlow | null>;
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

      async sessionPayout(sessionIds, cashflow, categoryIds) {
        // const { singleCashFlows } = get();

        // const payoutResult = await actions.payoutSessions({
        //   date: new Date(),
        //   cashflow,
        //   sessionIds,
        //   categoryIds,
        // });

        // console.log("payoutResult", payoutResult);

        // if (!payoutResult.success) {
        //   return null;
        // }

        // const updatedSingleCashFlows = [...singleCashFlows, payoutResult.data];
        // set({
        //   singleCashFlows: updatedSingleCashFlows,
        // });

        // return payoutResult.data;
        return null;
      },

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
