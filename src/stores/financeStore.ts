"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as actions from "@/actions";
import { Tables, TablesInsert, TablesUpdate } from "@/types/db.types";
import { UpdateManyToMany } from "@/types/action.types";
import {
  FinanceRule,
  FinanceTab,
  StoreFinanceProject,
  StoreSingleCashFlow,
  StoreRecurringCashFlow,
  OldFinanceProject,
} from "@/types/finance.types";

interface FinanceStoreState {
  singleCashFlows: StoreSingleCashFlow[];
  recurringCashFlows: StoreRecurringCashFlow[];
  financeCategories: Tables<"finance_category">[];
  financeClients: Tables<"finance_client">[];
  financeProjects: StoreFinanceProject[];
  financeRules: FinanceRule[];
  payouts: Tables<"payout">[];
  isFetching: boolean;
  lastFetch: Date | null;
  activeTab: FinanceTab;
  initialized: boolean | null;
  abortController: AbortController | null;
}

interface FinanceStoreActions {
  resetStore: () => void;
  fetchFinanceData: () => Promise<void>;
  fetchIfStale: (intervalMs?: number) => Promise<void>;
  abortFetch: () => void;
  addFinanceProject: (
    project: TablesInsert<"finance_project">,
    categoryIds: string[]
  ) => Promise<Tables<"finance_project"> | null>;
  deleteFinanceProjects: (ids: string[]) => Promise<boolean>;
  addSingleCashFlow: (
    singleCashFlow: TablesInsert<"single_cash_flow">,
    categoryIds: string[]
  ) => Promise<Tables<"single_cash_flow"> | null>;
  updateFinanceProject: (
    project: OldFinanceProject
  ) => Promise<StoreFinanceProject | null>;
  updateMultipleSingleCashFlows: (
    recurringCashFlowId: string,
    updates: Partial<TablesUpdate<"single_cash_flow">>,
    categoryUpdates: UpdateManyToMany
  ) => Promise<boolean>;
  updateFinanceAdjustment: (
    adjustment: TablesUpdate<"finance_project_adjustment">
  ) => Promise<Tables<"finance_project_adjustment"> | null>;
  addFinanceAdjustment: (
    adjustment: TablesInsert<"finance_project_adjustment">
  ) => Promise<Tables<"finance_project_adjustment"> | null>;
  deleteFinanceAdjustments: (ids: string[]) => Promise<boolean>;
  financeProjectAdjustmentPayout: (
    adjustment: Tables<"finance_project_adjustment">,
    categoryIds: string[],
    title: string
  ) => Promise<Tables<"finance_project_adjustment"> | null>;
  financeProjectPayout: (
    project: OldFinanceProject,
    title: string,
    justStartValue?: boolean
  ) => Promise<StoreFinanceProject | null>;
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
      singleCashFlows: [],
      recurringCashFlows: [],
      financeCategories: [],
      financeClients: [],
      financeRules: [],
      financeProjects: [],
      payouts: [],
      isFetching: false,
      lastFetch: null,
      activeTab: FinanceTab.Single,
      initialized: null,
      abortController: null,
      resetStore: () =>
        set({
          singleCashFlows: [],
          recurringCashFlows: [],
          financeCategories: [],
          financeClients: [],
          financeRules: [],
          payouts: [],
          isFetching: false,
          lastFetch: null,
          financeProjects: [],
          activeTab: FinanceTab.Single,
          initialized: null,
          abortController: null,
        }),

      async fetchIfStale(intervalMs = 5 * 60 * 1000) {
        const { lastFetch, isFetching, abortController } = get();
        const now = Date.now();
        const last = lastFetch ? new Date(lastFetch).getTime() : 0;
        const stale = !lastFetch || now - last > intervalMs;
        if (!stale || isFetching) return;

        // Abort any existing fetch
        if (abortController) {
          console.log("aborting finance fetch", new Date().toISOString());
          abortController.abort();
        }

        await get().fetchFinanceData();
      },

      async fetchFinanceData() {
        // Create new AbortController for this fetch
        const abortController = new AbortController();
        set({ isFetching: true, abortController });

        try {
          const financeProjects = await actions.getAllFinanceProjects();
          const payouts = await actions.getAllPayouts();

          // Check if fetch was aborted
          if (abortController.signal.aborted) {
            console.log("fetch aborted", new Date().toISOString());
            return;
          }

          if (!financeProjects.success || !payouts.success) {
            set({
              isFetching: false,
              initialized: false,
              abortController: null,
            });
            return;
          }

          // Check if fetch was aborted
          if (abortController.signal.aborted) {
            return;
          }

          set({
            financeProjects: financeProjects.data,
            payouts: payouts.data,
            isFetching: false,
            lastFetch: new Date(),
            initialized: true,
            abortController: null,
          });
        } catch (error) {
          // If fetch was aborted, don't update state
          if (abortController.signal.aborted) {
            return;
          }

          // For other errors, reset fetching state
          set({ isFetching: false, initialized: false, abortController: null });
        }
      },

      abortFetch() {
        const { abortController } = get();
        if (abortController) {
          abortController.abort();
          set({ isFetching: false, abortController: null });
        }
      },

      async addFinanceProject(project, categoryIds) {
        const { financeProjects } = get();
        const {
          data: newProject,
          success,
          error,
        } = await actions.createFinanceProject({
          project,
          categoryIds,
        });
        if (!success) return null;

        const newFinanceProjects = [...financeProjects, newProject];
        set({
          financeProjects: newFinanceProjects,
        });

        return newProject;
      },

      async deleteFinanceProjects(ids) {
        const { financeProjects } = get();
        const deleted = await actions.deleteFinanceProjects(ids);
        if (!deleted.success) return false;

        const updatedFinanceProjects = financeProjects.filter(
          (p) => !ids.includes(p.id)
        );
        set({
          financeProjects: updatedFinanceProjects,
        });

        return true;
      },

      async addSingleCashFlow(singleCashFlow, categoryIds) {
        const { singleCashFlows } = get();

        const newSingleCashFlow = await actions.createSingleCashFlow({
          cashFlow: singleCashFlow,
          categoryIds,
        });
        if (!newSingleCashFlow.success) return null;

        const newSingleCashFlows = [...singleCashFlows, newSingleCashFlow.data];

        set({
          singleCashFlows: newSingleCashFlows,
        });

        return newSingleCashFlow.data;
      },

      async updateFinanceProject(project) {
        const { financeProjects } = get();

        const oldProject = financeProjects.find((p) => p.id === project.id);
        if (!oldProject) return null;

        const { categories, finance_client, ...projectData } = project;

        const updatedProject = await actions.updateFinanceProject(oldProject, {
          ...projectData,
          categoryIds: categories.map((c) => c.id),
        });

        if (!updatedProject.success) {
          return null;
        }

        const updatedFinanceProjects = financeProjects.map((p) =>
          p.id === project.id ? updatedProject.data : p
        );
        set({
          financeProjects: updatedFinanceProjects,
        });
        return updatedProject.data;
      },

      async updateMultipleSingleCashFlows(
        recurringCashFlowId,
        updates,
        categoryUpdates
      ) {
        const { singleCashFlows, recurringCashFlows } = get();

        const originalRecurringCashFlow = recurringCashFlows.find(
          (c) => c.id === recurringCashFlowId
        );
        if (!originalRecurringCashFlow) return false;

        const result = await actions.updateMultipleSingleCashFlows({
          recurringCashFlowId,
          updates,
          categoryUpdates,
        });

        if (!result.success) return false;

        // Update all single cash flows that belong to this recurring cash flow
        const updatedSingleCashFlows = singleCashFlows.map((flow) => {
          if (flow.recurring_cash_flow_id === recurringCashFlowId) {
            const filteredCategoryIds = flow.categoryIds.filter(
              (id) => !categoryUpdates.deleteIds.includes(id)
            );
            const newCategoryIds = [
              ...filteredCategoryIds,
              ...categoryUpdates.addIds,
            ];
            return { ...flow, ...updates, categoryIds: newCategoryIds };
          }
          return flow;
        });

        set({
          singleCashFlows: updatedSingleCashFlows,
        });
        return true;
      },

      async addFinanceAdjustment(adjustment) {
        const { financeProjects } = get();
        const newAdjustment = await actions.createFinanceAdjustment(adjustment);
        if (!newAdjustment.success) return null;

        const newFinanceProjects = [
          ...financeProjects.map((p) =>
            p.id === adjustment.finance_project_id
              ? {
                  ...p,
                  adjustments: [...p.adjustments, newAdjustment.data],
                }
              : p
          ),
        ];
        set({
          financeProjects: newFinanceProjects,
        });
        return newAdjustment.data;
      },

      async updateFinanceAdjustment(adjustment) {
        const { financeProjects } = get();
        const updatedAdjustment =
          await actions.updateFinanceAdjustment(adjustment);
        if (!updatedAdjustment.success) return null;

        const updatedFinanceProjects = financeProjects.map((p) =>
          p.id === adjustment.finance_project_id
            ? { ...p, adjustments: [...p.adjustments, updatedAdjustment.data] }
            : p
        );

        set({
          financeProjects: updatedFinanceProjects,
        });
        return updatedAdjustment.data;
      },

      async deleteFinanceAdjustments(ids) {
        const { financeProjects } = get();
        const deleted = await actions.deleteFinanceAdjustments(ids);
        if (!deleted.success) return false;

        const updatedFinanceProjects = financeProjects.map((p) => ({
          ...p,
          adjustments: p.adjustments.filter((a) => !ids.includes(a.id)),
        }));

        set({
          financeProjects: updatedFinanceProjects,
        });
        return true;
      },

      async financeProjectAdjustmentPayout(adjustment, categoryIds, title) {
        const { financeProjects, addSingleCashFlow } = get();
        const project = financeProjects.find(
          (p) => p.id === adjustment.finance_project_id
        );
        if (!project) return null;

        const singleCashFlow = await addSingleCashFlow(
          {
            title,
            amount: adjustment.amount,
            currency: project.currency,
          },
          categoryIds
        );

        if (!singleCashFlow) return null;

        const updatedFinanceAdjustment = await actions.updateFinanceAdjustment({
          ...adjustment,
          single_cash_flow_id: singleCashFlow.id,
        });

        if (!updatedFinanceAdjustment.success) return null;

        const updatedFinanceProjects = financeProjects.map((p) =>
          p.id === adjustment.finance_project_id
            ? {
                ...p,
                adjustments: p.adjustments.map((a) =>
                  a.id === adjustment.id ? updatedFinanceAdjustment.data : a
                ),
              }
            : p
        );
        set({
          financeProjects: updatedFinanceProjects,
        });

        return updatedFinanceAdjustment.data;
      },

      async financeProjectPayout(project, title, justStartValue = true) {
        const { financeProjects, addSingleCashFlow, updateFinanceProject } =
          get();

        const singleCashFlow = await addSingleCashFlow(
          {
            title,
            amount: project.start_amount,
            currency: project.currency,
          },
          project.categories.map((c) => c.id)
        );

        if (!singleCashFlow) return null;

        const updatedFinanceProject = await updateFinanceProject({
          ...project,
          single_cash_flow_id: singleCashFlow.id,
        });

        if (!updatedFinanceProject) return null;

        const updatedFinanceProjects = financeProjects.map((p) =>
          p.id === project.id ? updatedFinanceProject : p
        );

        set({
          financeProjects: updatedFinanceProjects,
        });

        return updatedFinanceProject;
      },

      async sessionPayout(sessionIds, cashflow, categoryIds) {
        const { singleCashFlows } = get();

        const payoutResult = await actions.payoutSessions({
          date: new Date(),
          cashflow,
          sessionIds,
          categoryIds,
        });

        console.log("payoutResult", payoutResult);

        if (!payoutResult.success) {
          return null;
        }

        const updatedSingleCashFlows = [...singleCashFlows, payoutResult.data];
        set({
          singleCashFlows: updatedSingleCashFlows,
        });

        return payoutResult.data;
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
