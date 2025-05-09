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

// Response after an error occurs
interface ErrorResponse {
  success: false;
  data: null;
  error: string;
}

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

// Common type for all API responses
export type ApiResponseList<T extends TableNames> =
  | SuccessResponseList<T>
  | ErrorResponse;

export type ApiResponseSingle<T extends TableNames> =
  | SuccessResponseSingle<T>
  | ErrorResponse;

  
export type DeleteResponse =
  | { success: true; data: null; error: null }
  | ErrorResponse;