"use client";

import { create } from "zustand";
import * as actions from "@/actions";
import { Tables, TablesInsert, TablesUpdate } from "@/types/db.types";
import { FinanceInterval } from "@/types/settings.types";
import { processRecurringCashFlows } from "@/utils/financeHelperFunction";

interface FinanceStoreState {
  singleCashFlows: Tables<"single_cash_flow">[];
  futureSingleCashFlows: Tables<"single_cash_flow">[];
  recurringCashFlows: Tables<"recurring_cash_flow">[];
  financeCategories: Tables<"cash_flow_category">[];
  isFetching: boolean;
  lastFetch: Date | null;
}

interface FinanceStoreActions {
  fetchFinanceData: () => Promise<void>;
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
  addFinanceCategory: (
    category: TablesInsert<"cash_flow_category">
  ) => Promise<boolean>;
  updateFinanceCategory: (
    category: TablesUpdate<"cash_flow_category">
  ) => Promise<boolean>;
  deleteFinanceCategory: (id: string) => Promise<boolean>;

  // filter functions
  getChartData: (
    interval: FinanceInterval
  ) => Promise<{ date: string; expense: number; income: number }[]>;
}

export const useFinanceStore = create<FinanceStoreState & FinanceStoreActions>(
  (set, get) => ({
    singleCashFlows: [],
    futureSingleCashFlows: [],
    recurringCashFlows: [],
    financeCategories: [],
    isFetching: true,
    lastFetch: null,

    async fetchFinanceData() {
      const [singleCashFlows, recurringCashFlows, financeCategories] =
        await Promise.all([
          actions.getAllSingleCashFlows(),
          actions.getAllRecurringCashFlows(),
          actions.getAllFinanceCategories(),
        ]);

      if (
        !singleCashFlows.success ||
        !recurringCashFlows.success ||
        !financeCategories.success
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
        isFetching: false,
        lastFetch: new Date(),
      });
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

    async getChartData(interval) {
      const { singleCashFlows } = get();

      // Group cash flows by interval
      const groupedData: {
        [key: string]: { expense: number; income: number };
      } = {};

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

        if (flow.type === "expense") {
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

    async addFinanceCategory(category) {
      const { financeCategories } = get();

      const newCategory = await actions.createFinanceCategory({
        category,
      });
      if (!newCategory.success) return false;

      const newFinanceCategories = [...financeCategories, newCategory.data];

      set({
        financeCategories: newFinanceCategories,
      });

      return true;
    },

    async updateFinanceCategory(category) {
      const { financeCategories } = get();

      const updatedCategory = await actions.updateFinanceCategory({
        category,
      });
      if (!updatedCategory.success) return false;

      const updatedFinanceCategories = financeCategories.map((c) =>
        c.id === category.id ? updatedCategory.data : c
      );

      set({
        financeCategories: updatedFinanceCategories,
      });
      return true;
    },

    async deleteFinanceCategory(id) {
      const { financeCategories } = get();

      const deleted = await actions.deleteFinanceCategory({
        categoryId: id,
      });
      if (!deleted.success) return false;

      const updatedFinanceCategories = financeCategories.filter(
        (c) => c.id !== id
      );

      set({
        financeCategories: updatedFinanceCategories,
      });
      return true;
    },
  })
);
