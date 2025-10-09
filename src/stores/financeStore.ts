"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as actions from "@/actions";
import { Tables, TablesInsert, TablesUpdate } from "@/types/db.types";
import { UpdateManyToMany } from "@/types/action.types";
import { processRecurringCashFlows } from "@/utils/financeHelperFunction";
import {
  FinanceRule,
  FinanceTab,
  DeleteRecurringCashFlowMode,
  StoreFinanceProject,
  StoreSingleCashFlow,
  OldFinanceProject,
} from "@/types/finance.types";

interface FinanceStoreState {
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
      financeRules: [],
      payouts: [],
      isFetching: false,
      lastFetch: null,
      activeTab: FinanceTab.Single,
      initialized: null,
      abortController: null,
      resetStore: () =>
        set({
          financeRules: [],
          payouts: [],
          isFetching: false,
          lastFetch: null,
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
          // Fetch each API call individually to identify which one is failing
          const payouts = await actions.getAllPayouts();

          // Check if fetch was aborted
          if (abortController.signal.aborted) {
            return;
          }

          if (
            !payouts.success
          ) {
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
          console.log("aborting finance fetch", new Date().toISOString());
          abortController.abort();
          set({ isFetching: false, abortController: null });
        }
      },

      async addFinanceClient(client) {
        const { financeClients } = get();

        const newClient = await actions.createFinanceClient(client);

        if (!newClient.success) return null;

        const newClients = [...financeClients, newClient.data];

        set({
          financeClients: newClients,
        });

        return newClient.data;
      },

      async updateFinanceClient(client) {
        const { financeClients } = get();

        const updatedClient = await actions.updateFinanceClient(client);

        if (!updatedClient.success) return null;

        const updatedClients = financeClients.map((c) =>
          c.id === client.id ? updatedClient.data : c
        );

        set({
          financeClients: updatedClients,
        });

        return updatedClient.data;
      },

      async deleteFinanceClients(ids) {
        const { financeClients } = get();
        const deleted = await actions.deleteFinanceClients(ids);
        if (!deleted.success) return false;

        const updatedClients = financeClients.filter(
          (c) => !ids.includes(c.id)
        );
        set({
          financeClients: updatedClients,
        });

        return true;
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
        console.log(error);
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

      async updateRecurringCashFlow(recurringCashFlow) {
        const { recurringCashFlows } = get();

        const originalRecurringCashFlow = recurringCashFlows.find(
          (c) => c.id === recurringCashFlow.id
        );
        if (!originalRecurringCashFlow) return false;

        const updatedRecurringCashFlow = await actions.updateRecurringCashFlow({
          updateRecurringCashFlow: recurringCashFlow,
          categoryUpdates: {
            deleteIds: originalRecurringCashFlow.categoryIds.filter(
              (id) => !recurringCashFlow.categoryIds.includes(id)
            ),
            addIds: recurringCashFlow.categoryIds.filter(
              (id) => !originalRecurringCashFlow.categoryIds.includes(id)
            ),
          },
        });

        if (!updatedRecurringCashFlow.success) return false;

        const updatedRecurringCashFlows = recurringCashFlows.map((c) =>
          c.id === recurringCashFlow.id ? updatedRecurringCashFlow.data : c
        );

        set({
          recurringCashFlows: updatedRecurringCashFlows,
        });
        return true;
      },

      async updateSingleCashFlow(singleCashFlow) {
        const { singleCashFlows } = get();

        // Find the original single cash flow
        const originalSingleCashFlow = singleCashFlows.find(
          (c) => c.id === singleCashFlow.id
        );
        if (!originalSingleCashFlow) return false;

        // Update the database single cash flow
        const updatedSingleCashFlow = await actions.updateSingleCashFlow({
          updateSingleCashFlow: singleCashFlow,
          categoryUpdates: {
            deleteIds: originalSingleCashFlow.categoryIds.filter(
              (id) => !singleCashFlow.categoryIds.includes(id)
            ),
            addIds: singleCashFlow.categoryIds.filter(
              (id) => !originalSingleCashFlow.categoryIds.includes(id)
            ),
          },
        });

        if (!updatedSingleCashFlow.success) return false;

        // Update the store single cash flows
        const updatedSingleCashFlows = singleCashFlows.map((c) =>
          c.id === singleCashFlow.id ? updatedSingleCashFlow.data : c
        );

        set({
          singleCashFlows: updatedSingleCashFlows,
        });
        return true;
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

      async deleteRecurringCashFlow(id, mode) {
        const { recurringCashFlows, singleCashFlows } = get();

        const deleted = await actions.deleteRecurringCashFlow({
          recurringCashFlowId: id,
          mode,
        });
        if (!deleted.success) return false;

        const updatedRecurringCashFlows = recurringCashFlows.filter(
          (c) => c.id !== id
        );

        if (mode === DeleteRecurringCashFlowMode.delete_all) {
          const updatedSingleCashFlows = singleCashFlows.filter(
            (c) => c.recurring_cash_flow_id !== id
          );
          set({
            singleCashFlows: updatedSingleCashFlows,
          });
        }

        set({
          recurringCashFlows: updatedRecurringCashFlows,
        });
        return true;
      },

      async deleteSingleCashFlows(ids) {
        const { singleCashFlows } = get();

        const deleted = await actions.deleteSingleCashFlows({
          ids,
        });
        if (!deleted.success) return false;

        const updatedSingleCashFlows = singleCashFlows.filter(
          (c) => !ids.includes(c.id)
        );

        set({
          singleCashFlows: updatedSingleCashFlows,
        });
        return true;
      },

      async addFinanceCategory(category) {
        const { financeCategories } = get();

        const newCategory = await actions.createFinanceCategory({
          category,
        });
        if (!newCategory.success) return null;

        const newFinanceCategories = [...financeCategories, newCategory.data];

        set({
          financeCategories: newFinanceCategories,
        });

        return newCategory.data;
      },

      async updateFinanceCategory(category) {
        const { financeCategories } = get();

        const updatedCategory = await actions.updateFinanceCategory({
          category,
        });
        if (!updatedCategory.success) return null;

        const updatedFinanceCategories = financeCategories.map((c) =>
          c.id === category.id ? updatedCategory.data : c
        );

        set({
          financeCategories: updatedFinanceCategories,
        });
        return updatedCategory.data;
      },

      async deleteFinanceCategories(ids) {
        const { financeCategories } = get();

        const deleted = await actions.deleteFinanceCategories({
          categoryIds: ids,
        });
        console.log(deleted);
        if (!deleted.success) return false;

        const updatedFinanceCategories = financeCategories.filter(
          (c) => !ids.includes(c.id)
        );

        set({
          financeCategories: updatedFinanceCategories,
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
