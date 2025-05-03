"use client";

import { create } from "zustand";
import * as actions from "@/actions";
import { Tables, TablesInsert, TablesUpdate } from "@/types/db.types";

interface FinanceStore {
  incomes: Tables<"income">[];
  expenses: Tables<"expense">[];
  recurringIncomes: Tables<"recurringIncome">[];
  recurringExpenses: Tables<"recurringExpense">[];
  fetchData: () => Promise<void>;
  addIncome: (income: TablesInsert<"income">) => Promise<boolean>;
  addExpense: (expense: TablesInsert<"expense">) => Promise<boolean>;
  addRecurringIncome: (
    income: TablesInsert<"recurringIncome">
  ) => Promise<boolean>;
  addRecurringExpense: (
    expense: TablesInsert<"recurringExpense">
  ) => Promise<boolean>;
  updateIncome: (income: TablesUpdate<"income">) => Promise<boolean>;
  updateExpense: (expense: TablesUpdate<"expense">) => Promise<boolean>;
  updateRecurringIncome: (
    income: TablesUpdate<"recurringIncome">
  ) => Promise<boolean>;
  updateRecurringExpense: (
    expense: TablesUpdate<"recurringExpense">
  ) => Promise<boolean>;
  deleteIncome: (id: number) => Promise<boolean>;
  deleteExpense: (id: number) => Promise<boolean>;
  deleteRecurringIncome: (id: number) => Promise<boolean>;
  deleteRecurringExpense: (id: number) => Promise<boolean>;
}

export const useFinanceStore = create<FinanceStore>((set, get) => ({
  incomes: [],
  expenses: [],
  recurringIncomes: [],
  recurringExpenses: [],

  async fetchData() {
    const [incomes, expenses, recurringIncomes, recurringExpenses] =
      await Promise.all([
        actions.getAllIncomes(),
        actions.getAllExpenses(),
        actions.getAllRecurringIncomes(),
        actions.getAllRecurringExpenses(),
      ]);

    if (
      !incomes.success ||
      !expenses.success ||
      !recurringIncomes.success ||
      !recurringExpenses.success
    ) {
      return;
    }

    set({
      incomes: incomes.data,
      expenses: expenses.data,
      recurringIncomes: recurringIncomes.data,
      recurringExpenses: recurringExpenses.data,
    });
  },

  async addIncome(income) {
    const newIncome = await actions.createIncome({ income });
    if (!newIncome.success) return false;

    set({ incomes: [...get().incomes, newIncome.data] });
    return true;
  },

  async addExpense(expense) {
    const newExpense = await actions.createExpense({ expense });
    if (!newExpense.success) return false;

    set({ expenses: [...get().expenses, newExpense.data] });
    return true;
  },

  async addRecurringIncome(income) {
    const newIncome = await actions.createRecurringIncome({ income });
    if (!newIncome.success) return false;

    set({ recurringIncomes: [...get().recurringIncomes, newIncome.data] });
    return true;
  },

  async addRecurringExpense(expense) {
    const newExpense = await actions.createRecurringExpense({ expense });
    if (!newExpense.success) return false;

    set({ recurringExpenses: [...get().recurringExpenses, newExpense.data] });
    return true;
  },

  async updateIncome(income) {
    const updatedIncome = await actions.updateIncome({ updateIncome: income });
    if (!updatedIncome.success) return false;

    set({
      incomes: get().incomes.map((i) =>
        i.id === income.id ? updatedIncome.data : i
      ),
    });
    return true;
  },

  async updateExpense(expense) {
    const updatedExpense = await actions.updateExpense({
      updateExpense: expense,
    });
    if (!updatedExpense.success) return false;

    set({
      expenses: get().expenses.map((e) =>
        e.id === expense.id ? updatedExpense.data : e
      ),
    });
    return true;
  },

  async updateRecurringIncome(income) {
    const updatedIncome = await actions.updateRecurringIncome({
      updateRecurringIncome: income,
    });
    if (!updatedIncome.success) return false;

    set({
      recurringIncomes: get().recurringIncomes.map((i) =>
        i.id === income.id ? updatedIncome.data : i
      ),
    });
    return true;
  },

  async updateRecurringExpense(expense) {
    const updatedExpense = await actions.updateRecurringExpense({
      updateRecurringExpense: expense,
    });
    if (!updatedExpense.success) return false;

    set({
      recurringExpenses: get().recurringExpenses.map((e) =>
        e.id === expense.id ? updatedExpense.data : e
      ),
    });
    return true;
  },

  async deleteIncome(id) {
    const deleted = await actions.deleteIncome({ incomeId: id });
    if (!deleted.success) return false;

    set({ incomes: get().incomes.filter((i) => i.id !== id) });
    return true;
  },

  async deleteExpense(id) {
    const deleted = await actions.deleteExpense({ expenseId: id });
    if (!deleted.success) return false;

    set({ expenses: get().expenses.filter((e) => e.id !== id) });
    return true;
  },

  async deleteRecurringIncome(id) {
    const deleted = await actions.deleteRecurringIncome({
      recurringIncomeId: id,
    });
    if (!deleted.success) return false;

    set({
      recurringIncomes: get().recurringIncomes.filter((i) => i.id !== id),
    });
    return true;
  },

  async deleteRecurringExpense(id) {
    const deleted = await actions.deleteRecurringExpense({
      recurringExpenseId: id,
    });
    if (!deleted.success) return false;

    set({
      recurringExpenses: get().recurringExpenses.filter((e) => e.id !== id),
    });
    return true;
  },
}));
