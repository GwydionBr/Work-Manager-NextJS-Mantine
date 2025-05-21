import { Tables } from "@/types/db.types";

// Liste der erlaubten Tabellen
export type TableNames =
  | "grocery_item"
  | "group"
  | "profiles"
  | "recurring_cash_flow"
  | "settings"
  | "single_cash_flow"
  | "timerProject"
  | "timerSession"
  | "friendships";

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
