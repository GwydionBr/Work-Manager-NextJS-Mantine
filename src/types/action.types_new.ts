import { Tables } from "@/types/db.types";

// Liste der erlaubten Tabellen
export type TableNames =
  | "timerProject"
  | "timerSession"
  | "expense"
  | "income"
  | "recurringExpense"
  | "recurringIncome"
  | "settings"
  | "profiles";

// Basis-Fehler-Response
interface ErrorResponse {
  success: false;
  data: null;
  error: string;
}

// Basis-Erfolgs-Response mit generischer Einschränkung
interface SuccessResponseList<T extends TableNames> {
  success: true;
  data: Tables<T>[];
  error: null;
}

interface SuccessResponseSingle<T extends TableNames> {
  success: true;
  data: Tables<T>;
  error: null;
}

// Gemeinsamer Typ für alle API-Responses
export type ApiResponseList<T extends TableNames> =
  | SuccessResponseList<T>
  | ErrorResponse;

export type ApiResponseSingle<T extends TableNames> =
  | SuccessResponseSingle<T>
  | ErrorResponse;

// Vordefinierte Typen für spezifische Endpunkte
export type DeleteResponse =
  | { success: true; data: null; error: null }
  | ErrorResponse;
export type TimerProjectResponse = ApiResponseList<"timerProject">;
export type TimerSessionResponse = ApiResponseList<"timerSession">;
export type ExpenseResponse = ApiResponseList<"expense">;
export type IncomeResponse = ApiResponseList<"income">;
export type RecurringExpenseResponse = ApiResponseList<"recurringExpense">;
export type RecurringIncomeResponse = ApiResponseList<"recurringIncome">;
export type SettingsResponse = ApiResponseSingle<"settings">;
export type ProfilesResponse = ApiResponseList<"profiles">;
