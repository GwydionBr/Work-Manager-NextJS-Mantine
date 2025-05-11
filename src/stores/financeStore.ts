"use client";

import { create } from "zustand";
import * as actions from "@/actions";
import { Tables, TablesInsert, TablesUpdate } from "@/types/db.types";

interface FinanceStore {
  singleCashFlows: Tables<"single_cash_flow">[];
  recurringCashFlows: Tables<"recurring_cash_flow">[];
  fetchData: () => Promise<void>;
  addSingleCashFlow: (
    singleCashFlow: TablesInsert<"single_cash_flow">
  ) => Promise<boolean>;
  addRecurringCashFlow: (
    recurringCashFlow: TablesInsert<"recurring_cash_flow">
  ) => Promise<boolean>;
  updateSingleCashFlow: (
    singleCashFlow: TablesUpdate<"single_cash_flow">
  ) => Promise<boolean>;
  updateRecurringCashFlow: (
    recurringCashFlow: TablesUpdate<"recurring_cash_flow">
  ) => Promise<boolean>;
  deleteSingleCashFlow: (id: string) => Promise<boolean>;
  deleteRecurringCashFlow: (id: string) => Promise<boolean>;
}

export const useFinanceStore = create<FinanceStore>((set, get) => ({
  singleCashFlows: [],
  recurringCashFlows: [],

  async fetchData() {
    const [singleCashFlows, recurringCashFlows] = await Promise.all([
      actions.getAllSingleCashFlows(),
      actions.getAllRecurringCashFlows(),
    ]);

    if (!singleCashFlows.success || !recurringCashFlows.success) {
      return;
    }

    set({
      singleCashFlows: singleCashFlows.data,
      recurringCashFlows: recurringCashFlows.data,
    });
  },

  async addSingleCashFlow(singleCashFlow) {
    const newSingleCashFlow = await actions.createSingleCashFlow({
      cashFlow: singleCashFlow,
    });
    if (!newSingleCashFlow.success) return false;

    set({
      singleCashFlows: [...get().singleCashFlows, newSingleCashFlow.data],
    });
    return true;
  },

  async addRecurringCashFlow(recurringCashFlow) {
    const newRecurringCashFlow = await actions.createRecurringCashFlow({
      cashFlow: recurringCashFlow,
    });
    if (!newRecurringCashFlow.success) return false;

    set({
      recurringCashFlows: [
        ...get().recurringCashFlows,
        newRecurringCashFlow.data,
      ],
    });
    return true;
  },

  async updateRecurringCashFlow(recurringCashFlow) {
    const updatedRecurringCashFlow = await actions.updateRecurringCashFlow({
      updateRecurringCashFlow: recurringCashFlow,
    });
    if (!updatedRecurringCashFlow.success) return false;

    set({
      recurringCashFlows: get().recurringCashFlows.map((c) =>
        c.id === recurringCashFlow.id ? updatedRecurringCashFlow.data : c
      ),
    });
    return true;
  },

  async updateSingleCashFlow(singleCashFlow) {
    const updatedSingleCashFlow = await actions.updateSingleCashFlow({
      updateSingleCashFlow: singleCashFlow,
    });
    if (!updatedSingleCashFlow.success) return false;

    set({
      singleCashFlows: get().singleCashFlows.map((c) =>
        c.id === singleCashFlow.id ? updatedSingleCashFlow.data : c
      ),
    });
    return true;
  },

  async deleteRecurringCashFlow(id) {
    const deleted = await actions.deleteRecurringCashFlow({
      recurringCashFlowId: id,
    });
    if (!deleted.success) return false;

    set({
      recurringCashFlows: get().recurringCashFlows.filter((c) => c.id !== id),
    });
    return true;
  },

  async deleteSingleCashFlow(id) {
    const deleted = await actions.deleteSingleCashFlow({
      singleCashFlowId: id,
    });
    if (!deleted.success) return false;

    set({
      singleCashFlows: get().singleCashFlows.filter((c) => c.id !== id),
    });
    return true;
  },
}));
