export type RoundingAmount = "s" | "min" | "1/4h" | "1/2h" | "h";
export type RoundingDirection = "up" | "down" | "nearest";
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
export type FinanceInterval = "day" | "week" | "month" | "1/4 year" | "1/2 year" | "year";