"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as actions from "@/actions";
import { Tables, TablesInsert, TablesUpdate } from "@/types/db.types";
import { processRecurringCashFlows } from "@/utils/financeHelperFunction";
import {
  FinanceRule,
  FinanceTab,
  DeleteRecurringCashFlowMode,
  FetchedFinanceProject,
  StoreSingleCashFlow,
  StoreRecurringCashFlow,
} from "@/types/finance.types";

interface FinanceStoreState {
  singleCashFlows: StoreSingleCashFlow[];
  futureSingleCashFlows: StoreSingleCashFlow[];
  recurringCashFlows: StoreRecurringCashFlow[];
  financeCategories: Tables<"finance_category">[];
  financeClients: Tables<"finance_client">[];
  financeProjects: FetchedFinanceProject[];
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
  addFinanceClient: (
    client: TablesInsert<"finance_client">
  ) => Promise<Tables<"finance_client"> | null>;
  deleteFinanceClients: (ids: string[]) => Promise<boolean>;
  addFinanceProject: (
    project: TablesInsert<"finance_project">,
    clientIds: string[],
    categoryIds: string[]
  ) => Promise<Tables<"finance_project"> | null>;
  deleteFinanceProjects: (ids: string[]) => Promise<boolean>;
  addSingleCashFlow: (
    singleCashFlow: TablesInsert<"single_cash_flow">,
    categoryIds: string[]
  ) => Promise<boolean>;
  addExistingSingleCashFlow: (singleCashFlow: StoreSingleCashFlow) => boolean;
  addRecurringCashFlow: (
    recurringCashFlow: TablesInsert<"recurring_cash_flow">,
    categoryIds: string[]
  ) => Promise<boolean>;
  updateFinanceProject: (
    project: FetchedFinanceProject
  ) => Promise<FetchedFinanceProject | null>;
  updateFinanceClient: (
    client: TablesUpdate<"finance_client">
  ) => Promise<Tables<"finance_client"> | null>;
  updateSingleCashFlow: (
    singleCashFlow: StoreSingleCashFlow
  ) => Promise<boolean>;
  updateRecurringCashFlow: (
    recurringCashFlow: StoreRecurringCashFlow
  ) => Promise<boolean>;
  updateMultipleSingleCashFlows: (
    recurringCashFlowId: string,
    updates: Partial<TablesUpdate<"single_cash_flow">>
  ) => Promise<boolean>;
  updateFinanceAdjustment: (
    adjustment: TablesUpdate<"finance_project_adjustment">
  ) => Promise<Tables<"finance_project_adjustment"> | null>;
  deleteSingleCashFlows: (ids: string[]) => Promise<boolean>;
  deleteRecurringCashFlow: (
    id: string,
    mode: DeleteRecurringCashFlowMode
  ) => Promise<boolean>;
  addFinanceAdjustment: (
    adjustment: TablesInsert<"finance_project_adjustment">
  ) => Promise<Tables<"finance_project_adjustment"> | null>;
  deleteFinanceAdjustments: (ids: string[]) => Promise<boolean>;
  addFinanceCategory: (
    category: TablesInsert<"finance_category">
  ) => Promise<Tables<"finance_category"> | null>;
  updateFinanceCategory: (
    category: TablesUpdate<"finance_category">
  ) => Promise<Tables<"finance_category"> | null>;
  deleteFinanceCategories: (ids: string[]) => Promise<boolean>;
  sessionPayout: (
    sessionIds: string[],
    payout: TablesInsert<"payout">,
    categoryIds: string[]
  ) => Promise<Tables<"payout"> | null>;
  setActiveTab: (tab: FinanceTab) => void;
}

export const useFinanceStore = create<
  FinanceStoreState & FinanceStoreActions
>()(
  persist(
    (set, get) => ({
      singleCashFlows: [],
      futureSingleCashFlows: [],
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
          futureSingleCashFlows: [],
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
          abortController.abort();
        }

        await get().fetchFinanceData();
      },

      async fetchFinanceData() {
        // Create new AbortController for this fetch
        const abortController = new AbortController();
        set({ isFetching: true, abortController });

        try {
          const [
            singleCashFlows,
            recurringCashFlows,
            financeCategories,
            financeClients,
            financeProjects,
            payouts,
          ] = await Promise.all([
            actions.getAllSingleCashFlows(),
            actions.getAllRecurringCashFlows(),
            actions.getAllFinanceCategories(),
            actions.getAllFinanceClients(),
            actions.getAllFinanceProjects(),
            actions.getAllPayouts(),
          ]);

          // Check if fetch was aborted
          if (abortController.signal.aborted) {
            return;
          }

          if (
            !singleCashFlows.success ||
            !recurringCashFlows.success ||
            !financeCategories.success ||
            !financeClients.success ||
            !financeProjects.success ||
            !payouts.success
          ) {
            set({
              isFetching: false,
              initialized: false,
              abortController: null,
            });
            return;
          }

          const { pastAndCurrentFlows, futureFlows } =
            processRecurringCashFlows(
              recurringCashFlows.data,
              singleCashFlows.data
            );

          const newSingleCashFlows =
            await actions.createMultipleSingleCashFlows({
              cashFlows: pastAndCurrentFlows,
              recurringCashFlows: recurringCashFlows.data,
            });

          // Check if fetch was aborted
          if (abortController.signal.aborted) {
            return;
          }

          if (!newSingleCashFlows.success) {
            set({
              isFetching: false,
              initialized: false,
              abortController: null,
            });
            return;
          }

          set({
            singleCashFlows: [
              ...singleCashFlows.data,
              ...newSingleCashFlows.data,
            ],
            futureSingleCashFlows: futureFlows,
            recurringCashFlows: recurringCashFlows.data,
            financeCategories: financeCategories.data,
            financeClients: financeClients.data,
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

      async addFinanceProject(project, clientIds, categoryIds) {
        const { financeProjects } = get();
        const {
          data: newProject,
          success,
          error,
        } = await actions.createFinanceProject({
          project,
          clientIds,
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

      async addSingleCashFlow(singleCashFlow, categoryIds) {
        const { singleCashFlows } = get();

        const newSingleCashFlow = await actions.createSingleCashFlow({
          cashFlow: singleCashFlow,
          categoryIds,
        });
        if (!newSingleCashFlow.success) return false;

        const newSingleCashFlows = [...singleCashFlows, newSingleCashFlow.data];

        set({
          singleCashFlows: newSingleCashFlows,
        });

        return true;
      },

      addExistingSingleCashFlow(singleCashFlow) {
        const { singleCashFlows } = get();
        const newSingleCashFlows = [...singleCashFlows, singleCashFlow];
        set({
          singleCashFlows: newSingleCashFlows,
        });
        return true;
      },

      async addRecurringCashFlow(recurringCashFlow, categoryIds) {
        const { recurringCashFlows, futureSingleCashFlows, singleCashFlows } =
          get();

        const newRecurringCashFlow = await actions.createRecurringCashFlow({
          cashFlow: recurringCashFlow,
          categoryIds,
        });
        if (!newRecurringCashFlow.success) return false;

        const newRecurringCashFlows = [
          ...recurringCashFlows,
          newRecurringCashFlow.data,
        ];

        set({
          recurringCashFlows: newRecurringCashFlows,
        });

        const { pastAndCurrentFlows, futureFlows } = processRecurringCashFlows(
          [newRecurringCashFlow.data],
          []
        );

        const {
          data: newSingleCashFlowsData,
          success: newSingleCashFlowsSuccess,
        } = await actions.createMultipleSingleCashFlows({
          cashFlows: pastAndCurrentFlows,
          recurringCashFlows: [newRecurringCashFlow.data],
        });

        if (!newSingleCashFlowsSuccess) return false;

        const newFutureSingleCashFlows = [
          ...futureSingleCashFlows,
          ...futureFlows,
        ];

        const newSingleCashFlows = [
          ...singleCashFlows,
          ...newSingleCashFlowsData,
        ];

        set({
          singleCashFlows: newSingleCashFlows,
          futureSingleCashFlows: newFutureSingleCashFlows,
        });

        return true;
      },

      async updateFinanceProject(project) {
        const { financeProjects } = get();

        const oldProject = financeProjects.find((p) => p.id === project.id);
        if (!oldProject) return null;

        const updatedProject = await actions.updateFinanceProject(
          oldProject,
          project
        );
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

        const originalSingleCashFlow = singleCashFlows.find(
          (c) => c.id === singleCashFlow.id
        );
        if (!originalSingleCashFlow) return false;

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

        const updatedSingleCashFlows = singleCashFlows.map((c) =>
          c.id === singleCashFlow.id ? updatedSingleCashFlow.data : c
        );

        set({
          singleCashFlows: updatedSingleCashFlows,
        });
        return true;
      },

      async updateMultipleSingleCashFlows(recurringCashFlowId, updates) {
        // TODO: Add categoryIds to the updates
        const { singleCashFlows } = get();

        const result = await actions.updateMultipleSingleCashFlows({
          recurringCashFlowId,
          updates,
        });

        if (!result.success) return false;

        // Update all single cash flows that belong to this recurring cash flow
        const updatedSingleCashFlows = singleCashFlows.map((flow) => {
          if (flow.recurring_cash_flow_id === recurringCashFlowId) {
            return { ...flow, ...updates };
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

      async sessionPayout(sessionIds, payout, categoryIds) {
        const { payouts, singleCashFlows } = get();

        const payoutResult = await actions.payoutSessions({
          date: new Date(),
          payout,
          sessionIds,
          categoryIds,
        });

        if (!payoutResult.success) {
          return null;
        }

        const updatedPayouts = [payoutResult.data.payout, ...payouts];
        const updatedSingleCashFlows = [
          ...singleCashFlows,
          payoutResult.data.cashflow,
        ];
        set({
          payouts: updatedPayouts,
          singleCashFlows: updatedSingleCashFlows,
        });

        return payoutResult.data.payout;
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
