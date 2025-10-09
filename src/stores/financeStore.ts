"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Tables, TablesInsert } from "@/types/db.types";
import {
  FinanceTab,
  FinanceProject,
  StoreSingleCashFlow,
} from "@/types/finance.types";

interface FinanceStoreState {
  activeTab: FinanceTab;
}

interface FinanceStoreActions {
  resetStore: () => void;
  financeProjectAdjustmentPayout: (
    adjustment: Tables<"finance_project_adjustment">,
    categoryIds: string[],
    title: string
  ) => Promise<Tables<"finance_project_adjustment"> | null>;
  financeProjectPayout: (
    project: FinanceProject,
    title: string,
    justStartValue?: boolean
  ) => Promise<FinanceProject | null>;
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
    (set, get) => ({
      resetStore: () => {
        set({ activeTab: FinanceTab.Single });
      },
      activeTab: FinanceTab.Single,

      async financeProjectAdjustmentPayout(adjustment, categoryIds, title) {
        // const { financeProjects } = get();
        // const project = financeProjects.find(
        //   (p) => p.id === adjustment.finance_project_id
        // );
        // if (!project) return null;

        // const singleCashFlow = await addSingleCashFlow(
        //   {
        //     title,
        //     amount: adjustment.amount,
        //     currency: project.currency,
        //   },
        //   categoryIds
        // );

        // if (!singleCashFlow) return null;

        // const updatedFinanceAdjustment = await actions.updateFinanceAdjustment({
        //   ...adjustment,
        //   single_cash_flow_id: singleCashFlow.id,
        // });

        // if (!updatedFinanceAdjustment.success) return null;

        // const updatedFinanceProjects = financeProjects.map((p) =>
        //   p.id === adjustment.finance_project_id
        //     ? {
        //         ...p,
        //         adjustments: p.adjustments.map((a) =>
        //           a.id === adjustment.id ? updatedFinanceAdjustment.data : a
        //         ),
        //       }
        //     : p
        // );
        // set({
        //   financeProjects: updatedFinanceProjects,
        // });

        return null;
      },

      async financeProjectPayout(project, title, justStartValue = true) {
        // const { financeProjects } =
        //   get();

        // const singleCashFlow = await addSingleCashFlow(
        //   {
        //     title,
        //     amount: project.start_amount,
        //     currency: project.currency,
        //   },
        //   project.categories.map((c) => c.id)
        // );

        // if (!singleCashFlow) return null;

        // const updatedFinanceProject = await updateFinanceProject({
        //   ...project,
        //   single_cash_flow_id: singleCashFlow.id,
        // });

        // if (!updatedFinanceProject) return null;

        // const updatedFinanceProjects = financeProjects.map((p) =>
        //   p.id === project.id ? updatedFinanceProject : p
        // );

        // set({
        //   financeProjects: updatedFinanceProjects,
        // });

        // return updatedFinanceProject;
        return null;
      },

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
