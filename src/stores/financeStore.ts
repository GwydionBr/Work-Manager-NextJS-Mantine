"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as actions from "@/actions";
import { Tables, TablesInsert, TablesUpdate } from "@/types/db.types";
import { processRecurringCashFlows } from "@/utils/financeHelperFunction";
import {
  FinanceProject,
  FinanceProjectUpdate,
  FinanceRule,
  FinanceTab,
  Payout,
} from "@/types/finance.types";

interface FinanceStoreState {
  singleCashFlows: Tables<"single_cash_flow">[];
  futureSingleCashFlows: Tables<"single_cash_flow">[];
  recurringCashFlows: Tables<"recurring_cash_flow">[];
  financeCategories: Tables<"finance_category">[];
  financeClients: Tables<"finance_client">[];
  financeProjects: FinanceProject[];
  financeRules: FinanceRule[];
  payouts: Payout[];
  isFetching: boolean;
  lastFetch: Date | null;
  activeTab: FinanceTab;
}

interface FinanceStoreActions {
  resetStore: () => void;
  fetchFinanceData: () => Promise<void>;
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
    singleCashFlow: TablesInsert<"single_cash_flow">
  ) => Promise<boolean>;
  addExistingSingleCashFlow: (
    singleCashFlow: Tables<"single_cash_flow">
  ) => boolean;
  addRecurringCashFlow: (
    recurringCashFlow: TablesInsert<"recurring_cash_flow">
  ) => Promise<boolean>;
  updateFinanceProject: (
    project: FinanceProjectUpdate
  ) => Promise<FinanceProject | null>;
  updateFinanceClient: (
    client: TablesUpdate<"finance_client">
  ) => Promise<Tables<"finance_client"> | null>;
  updateSingleCashFlow: (
    singleCashFlow: TablesUpdate<"single_cash_flow">
  ) => Promise<boolean>;
  updateRecurringCashFlow: (
    recurringCashFlow: TablesUpdate<"recurring_cash_flow">
  ) => Promise<boolean>;
  updateMultipleSingleCashFlows: (
    recurringCashFlowId: string,
    updates: Partial<TablesUpdate<"single_cash_flow">>
  ) => Promise<boolean>;
  updateFinanceAdjustment: (
    adjustment: TablesUpdate<"finance_project_adjustment">
  ) => Promise<Tables<"finance_project_adjustment"> | null>;
  deleteSingleCashFlow: (id: string) => Promise<boolean>;
  deleteRecurringCashFlow: (id: string) => Promise<boolean>;
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
      isFetching: true,
      lastFetch: null,
      activeTab: FinanceTab.Single,
      resetStore: () =>
        set({
          singleCashFlows: [],
          futureSingleCashFlows: [],
          recurringCashFlows: [],
          financeCategories: [],
          financeClients: [],
          financeRules: [],
          payouts: [],
          isFetching: true,
          lastFetch: null,
          financeProjects: [],
          activeTab: FinanceTab.Single,
        }),
      async fetchFinanceData() {
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

        if (
          !singleCashFlows.success ||
          !recurringCashFlows.success ||
          !financeCategories.success ||
          !financeClients.success ||
          !financeProjects.success ||
          !payouts.success
        ) {
          return;
        }

        const { pastAndCurrentFlows, futureFlows } = processRecurringCashFlows(
          recurringCashFlows.data,
          singleCashFlows.data
        );

        const newSingleCashFlows = await actions.createMultipleSingleCashFlows({
          cashFlows: pastAndCurrentFlows,
        });

        if (!newSingleCashFlows.success) return;

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
        });
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

      async addSingleCashFlow(singleCashFlow) {
        const { singleCashFlows } = get();

        const newSingleCashFlow = await actions.createSingleCashFlow({
          cashFlow: singleCashFlow,
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

      async addRecurringCashFlow(recurringCashFlow) {
        const { recurringCashFlows, futureSingleCashFlows, singleCashFlows } =
          get();

        const newRecurringCashFlow = await actions.createRecurringCashFlow({
          cashFlow: recurringCashFlow,
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
        const updatedProject = await actions.updateFinanceProject(project);
        if (!updatedProject.success) return null;
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

        const updatedRecurringCashFlow = await actions.updateRecurringCashFlow({
          updateRecurringCashFlow: recurringCashFlow,
        });

        console.log(updatedRecurringCashFlow);

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

        const updatedSingleCashFlow = await actions.updateSingleCashFlow({
          updateSingleCashFlow: singleCashFlow,
        });
        console.log(updatedSingleCashFlow);
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

      async deleteRecurringCashFlow(id) {
        const { recurringCashFlows } = get();

        const deleted = await actions.deleteRecurringCashFlow({
          recurringCashFlowId: id,
        });
        if (!deleted.success) return false;

        const updatedRecurringCashFlows = recurringCashFlows.filter(
          (c) => c.id !== id
        );

        set({
          recurringCashFlows: updatedRecurringCashFlows,
        });
        return true;
      },

      async deleteSingleCashFlow(id) {
        const { singleCashFlows } = get();

        const deleted = await actions.deleteSingleCashFlow({
          singleCashFlowId: id,
        });
        if (!deleted.success) return false;

        const updatedSingleCashFlows = singleCashFlows.filter(
          (c) => c.id !== id
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
