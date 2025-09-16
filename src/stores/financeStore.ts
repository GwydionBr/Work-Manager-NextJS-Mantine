"use client";

import { create } from "zustand";
import * as actions from "@/actions";
import { Tables, TablesInsert, TablesUpdate } from "@/types/db.types";
import { processRecurringCashFlows } from "@/utils/financeHelperFunction";
import { FinanceProject, FinanceRule } from "@/types/finance.types";

interface FinanceStoreState {
  singleCashFlows: Tables<"single_cash_flow">[];
  futureSingleCashFlows: Tables<"single_cash_flow">[];
  recurringCashFlows: Tables<"recurring_cash_flow">[];
  financeCategories: Tables<"finance_category">[];
  clients: Tables<"client">[];
  financeProjects: FinanceProject[];
  financeRules: FinanceRule[];
  isFetching: boolean;
  lastFetch: Date | null;
}

interface FinanceStoreActions {
  resetStore: () => void;
  fetchFinanceData: () => Promise<void>;
  addFinanceClient: (
    client: TablesInsert<"client">
  ) => Promise<Tables<"client"> | null>;
  updateFinanceClient: (
    client: TablesUpdate<"client">
  ) => Promise<Tables<"client"> | null>;
  deleteFinanceClient: (id: string) => Promise<boolean>;
  addFinanceProject: (
    project: TablesInsert<"finance_project">
  ) => Promise<Tables<"finance_project"> | null>;
  deleteFinanceProject: (id: string) => Promise<boolean>;
  addSingleCashFlow: (
    singleCashFlow: TablesInsert<"single_cash_flow">
  ) => Promise<boolean>;
  addExistingSingleCashFlow: (
    singleCashFlow: Tables<"single_cash_flow">
  ) => boolean;
  addRecurringCashFlow: (
    recurringCashFlow: TablesInsert<"recurring_cash_flow">
  ) => Promise<boolean>;
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
  deleteSingleCashFlow: (id: string) => Promise<boolean>;
  deleteRecurringCashFlow: (id: string) => Promise<boolean>;
  addFinanceCategory: (
    category: TablesInsert<"finance_category">
  ) => Promise<Tables<"finance_category"> | null>;
  updateFinanceCategory: (
    category: TablesUpdate<"finance_category">
  ) => Promise<Tables<"finance_category"> | null>;
  deleteFinanceCategories: (ids: string[]) => Promise<boolean>;
}

export const useFinanceStore = create<FinanceStoreState & FinanceStoreActions>(
  (set, get) => ({
    singleCashFlows: [],
    futureSingleCashFlows: [],
    recurringCashFlows: [],
    financeCategories: [],
    clients: [],
    financeRules: [],
    financeProjects: [],
    isFetching: true,
    lastFetch: null,

    resetStore: () =>
      set({
        singleCashFlows: [],
        futureSingleCashFlows: [],
        recurringCashFlows: [],
        financeCategories: [],
        clients: [],
        financeRules: [],
        isFetching: true,
        lastFetch: null,
        financeProjects: [],
      }),
    async fetchFinanceData() {
      const [
        singleCashFlows,
        recurringCashFlows,
        financeCategories,
        clients,
        financeProjects,
      ] = await Promise.all([
        actions.getAllSingleCashFlows(),
        actions.getAllRecurringCashFlows(),
        actions.getAllFinanceCategories(),
        actions.getAllFinanceClients(),
        actions.getAllFinanceProjects(),
      ]);

      if (
        !singleCashFlows.success ||
        !recurringCashFlows.success ||
        !financeCategories.success ||
        !clients.success ||
        !financeProjects.success
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
        singleCashFlows: [...singleCashFlows.data, ...newSingleCashFlows.data],
        futureSingleCashFlows: futureFlows,
        recurringCashFlows: recurringCashFlows.data,
        financeCategories: financeCategories.data,
        clients: clients.data,
        financeProjects: financeProjects.data,
        isFetching: false,
        lastFetch: new Date(),
      });
    },

    async addFinanceClient(client) {
      const { clients } = get();
      const newClient = await actions.createFinanceClient(client);
      if (!newClient.success) return null;

      const newClients = [...clients, newClient.data];
      set({
        clients: newClients,
      });

      return newClient.data;
    },

    async updateFinanceClient(client) {
      const { clients } = get();
      const updatedClient = await actions.updateFinanceClient(client);
      if (!updatedClient.success) return null;

      const updatedClients = clients.map((c) =>
        c.id === client.id ? updatedClient.data : c
      );
      set({
        clients: updatedClients,
      });

      return updatedClient.data;
    },

    async deleteFinanceClient(id) {
      const { clients } = get();
      const deleted = await actions.deleteFinanceClient(id);
      if (!deleted.success) return false;

      const updatedClients = clients.filter((c) => c.id !== id);
      set({
        clients: updatedClients,
      });

      return true;
    },

    async addFinanceProject(project) {
      const { financeProjects } = get();
      const newProject = await actions.createFinanceProject(project);
      if (!newProject.success) return null;

      const newFinanceProjects = [
        ...financeProjects,
        { ...newProject.data, adjustments: [] },
      ];
      set({
        financeProjects: newFinanceProjects,
      });

      return newProject.data;
    },

    async deleteFinanceProject(id) {
      const { financeProjects } = get();
      const deleted = await actions.deleteFinanceProject(id);
      if (!deleted.success) return false;

      const updatedFinanceProjects = financeProjects.filter((p) => p.id !== id);
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

      const updatedSingleCashFlows = singleCashFlows.filter((c) => c.id !== id);

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
  })
);
