import { Tables } from "./db.types";

export interface Payout extends Tables<"payout"> {
  cashflow: Tables<"single_cash_flow"> | null;
  timer_project: Tables<"timer_project"> | null;
  timer_sessions: Tables<"timer_session">[];
}

export interface FinanceRule extends Tables<"finance_rule"> {
  financeCategoryIds: string[];
  timerProjectIds: string[];
}

export interface FinanceProject extends Tables<"finance_project"> {
  adjustments: Tables<"finance_project_adjustment">[];
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
