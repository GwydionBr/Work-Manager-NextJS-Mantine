import { Database } from "./db.types";

export type RoundingAmount =  "min" | "1/4h" | "1/2h" | "h" | "custom";
export type RoundingDirection = "up" | "down" | "nearest";
export type RoundingInTimeSections = "5min" | "10min" | "15min" | "20min" | "30min" | "1h";
export type Locale = Database["public"]["Enums"]["locales"];

export type Currency =
  | "USD"
  | "EUR"
  | "GBP"
  | "CAD"
  | "AUD"
  | "JPY"
  | "CHF"
  | "CNY"
  | "INR"
  | "BRL"
  | "VEF";


export type CashFlowType = "income" | "expense";
export type FinanceInterval =
  | "day"
  | "week"
  | "month"
  | "1/4 year"
  | "1/2 year"
  | "year";

