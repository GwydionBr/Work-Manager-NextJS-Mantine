import { Tables } from "@/types/db.types";

// Liste der erlaubten Tabellen
export type TableNames =
  | "group"
  | "group_member"
  | "grocery_item"
  | "group_task"
  | "group_appointment"
  | "recurring_group_task"
  | "profiles"
  | "recurring_cash_flow"
  | "settings"
  | "single_cash_flow"
  | "timerProject"
  | "timerSession"
  | "friendships"
  | "finance_category"
  | "finance_rule"
  | "finance_rule_category"
  | "finance_rule_timer_project"
  | "timer_project_folder"
  | "payout";

// Response after an error occurs
export interface ErrorResponse {
  success: false;
  data: null;
  error: string;
}

export interface SuccessResponseList<T extends TableNames> {
  success: true;
  data: Tables<T>[];
  error: null;
}

export interface SuccessResponseSingle<T extends TableNames> {
  success: true;
  data: Tables<T>;
  error: null;
}

// Common type for all API responses
export type ApiResponseList<T extends TableNames> =
  | SuccessResponseList<T>
  | ErrorResponse;

export type ApiResponseSingle<T extends TableNames> =
  | SuccessResponseSingle<T>
  | ErrorResponse;

export type SimpleResponse =
  | { success: true; data: null; error: null }
  | ErrorResponse;
