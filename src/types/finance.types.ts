import { Tables } from "./db.types";

export interface FinanceRule extends Tables<"finance_rule"> {
  financeCategoryIds: string[];
  timerProjectIds: string[];
}

export interface FinanceProject extends Tables<"finance_project"> {
  adjustments: Tables<"finance_project_adjustment">[];
}