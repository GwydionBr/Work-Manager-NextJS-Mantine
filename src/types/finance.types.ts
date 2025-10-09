import { Tables, TablesInsert, TablesUpdate } from "./db.types";

export interface Payout extends Tables<"payout"> {
  cashflow: Tables<"single_cash_flow"> | null;
  timer_project: Tables<"timer_project"> | null;
  timer_sessions: Tables<"timer_session">[];
  timer_session_project: Tables<"timer_project"> | null;
}

export type SingleCashFlow = Tables<"single_cash_flow"> & {
  categories: { finance_category: Tables<"finance_category"> }[];
};

export interface InsertSingleCashFlow extends TablesInsert<"single_cash_flow"> {
  categories: { finance_category: Tables<"finance_category"> }[];
}

export interface UpdateSingleCashFlow extends TablesUpdate<"single_cash_flow"> {
  categories: { finance_category: Tables<"finance_category"> }[];
}

export type RecurringCashFlow = Tables<"recurring_cash_flow"> & {
  categories: { finance_category: Tables<"finance_category"> }[];
};

export interface InsertRecurringCashFlow
  extends TablesInsert<"recurring_cash_flow"> {
  categories: { finance_category: Tables<"finance_category"> }[];
}

export interface UpdateRecurringCashFlow
  extends TablesUpdate<"recurring_cash_flow"> {
  categories: { finance_category: Tables<"finance_category"> }[];
}

export interface FinanceProject extends Tables<"finance_project"> {
  adjustments: Tables<"finance_project_adjustment">[];
  finance_client: Tables<"finance_client"> | null;
  categories: { finance_category: Tables<"finance_category"> }[];
}

export interface UpdateFinanceProject extends TablesUpdate<"finance_project"> {
  categories: { finance_category: Tables<"finance_category"> }[];
  finance_client: Tables<"finance_client"> | null;
  adjustments: Tables<"finance_project_adjustment">[];
}

export interface InsertFinanceProject extends TablesInsert<"finance_project"> {
  categories: { finance_category: Tables<"finance_category"> }[];
  client: Tables<"finance_client"> | null;
}

export enum DeleteRecurringCashFlowMode {
  delete_all = "delete_all",
  keep_unlinked = "keep_unlinked",
}

export interface FinanceRule extends Tables<"finance_rule"> {
  financeCategoryIds: string[];
  timerProjectIds: string[];
}

export interface StoreFinanceProject extends Tables<"finance_project"> {
  adjustments: Tables<"finance_project_adjustment">[];
  categoryIds: string[];
}

export interface StoreSingleCashFlow extends Tables<"single_cash_flow"> {
  categoryIds: string[];
}

export interface StoreRecurringCashFlow extends Tables<"recurring_cash_flow"> {
  categoryIds: string[];
}

export interface OldFinanceProject extends Tables<"finance_project"> {
  adjustments: Tables<"finance_project_adjustment">[];
  finance_client: Tables<"finance_client"> | null;
  categories: Tables<"finance_category">[];
}

export type FinanceNavbarItem = {
  totalAmount: number;
  projectCount: number;
};

export type FinanceNavbarItems = {
  [key in FinanceProjectNavbarTab]: FinanceNavbarItem;
};

export enum FinanceProjectNavbarTab {
  All = "all",
  Upcoming = "upcoming",
  Overdue = "overdue",
  Paid = "paid",
}

export enum FinanceTab {
  Analysis = "Analysis",
  Projects = "Projects",
  Single = "Single",
  Recurring = "Recurring",
  Payout = "Payout",
}
