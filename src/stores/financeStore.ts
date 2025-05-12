"use client";

import { create } from "zustand";
import * as actions from "@/actions";
import { Tables, TablesInsert, TablesUpdate } from "@/types/db.types";
import { FinanceInterval } from "@/types/settings.types";

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

  // filter functions
  getChartData: (
    interval: FinanceInterval
  ) => Promise<{ date: string; expense: number; income: number }[]>;
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

  async getChartData(interval) {
    const { singleCashFlows } = get();

    // Group cash flows by interval
    const groupedData: { [key: string]: { expense: number; income: number } } =
      {};

    singleCashFlows.forEach((flow) => {
      const date = new Date(flow.date);
      let key: string;

      switch (interval) {
        case "day":
          key = date.toISOString().split("T")[0];
          break;
        case "week":
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split("T")[0];
          break;
        case "month":
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          break;
        case "1/4 year":
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          key = `${date.getFullYear()}-Q${quarter}`;
          break;
        case "1/2 year":
          const half = Math.floor(date.getMonth() / 6) + 1;
          key = `${date.getFullYear()}-H${half}`;
          break;
        case "year":
          key = date.getFullYear().toString();
          break;
        default:
          key = date.toISOString().split("T")[0];
      }

      if (!groupedData[key]) {
        groupedData[key] = { expense: 0, income: 0 };
      }

      if (flow.amount < 0) {
        groupedData[key].expense += flow.amount;
      } else {
        groupedData[key].income += flow.amount;
      }
    });

    // Convert to array and sort by date
    const chartData = Object.entries(groupedData)
      .map(([date, values]) => ({
        date,
        expense: values.expense,
        income: values.income,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return chartData;
  },
}));
