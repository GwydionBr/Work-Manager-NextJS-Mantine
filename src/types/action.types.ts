import { Tables } from "@/types/db.types";

// Response after an error occurs
export interface ErrorResponse {
  success: false;
  data: null;
  error: string;
}

export interface SuccessResponseList<T> {
  success: true;
  data: T[];
  error: null;
}

export interface SuccessResponseSingle<T> {
  success: true;
  data: T;
  error: null;
}

// Generic API responses
export type ApiResponseSingle<T> = SuccessResponseSingle<T> | ErrorResponse;

export type ApiResponseList<T> = SuccessResponseList<T> | ErrorResponse;

export type SimpleResponse =
  | { success: true; data: null; error: null }
  | ErrorResponse;

export type SuccessPayoutResponse = {
  success: true;
  data: {
    cashFlow: Tables<"single_cash_flow">;
    payout: Tables<"payout">;
  };
  error: null;
};
