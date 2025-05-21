import {
  Currency,
  RoundingAmount,
  RoundingDirection,
  FinanceInterval,
} from "@/types/settings.types";

export const currencies: { value: Currency; label: string }[] = [
  { value: "USD", label: "$ (US Dollar)" },
  { value: "EUR", label: "€ (Euro)" },
  { value: "GBP", label: "£ (British Pound)" },
  { value: "CAD", label: "$ (Canadian Dollar)" },
  { value: "AUD", label: "$ (Australian Dollar)" },
  { value: "JPY", label: "¥ (Japanese Yen)" },
  { value: "CHF", label: "CHF (Swiss Franc)" },
  { value: "CNY", label: "¥ (Chinese Yuan)" },
  { value: "INR", label: "₹ (Indian Rupee)" },
  { value: "BRL", label: "R$ (Brazilian Real)" },
  { value: "VEF", label: "Bs (Venezuelan Bolívar)" },
];

export const shortCurrencies: { value: Currency; label: string }[] = [
  { value: "USD", label: "$" },
  { value: "EUR", label: "€" },
  { value: "GBP", label: "£" },
  { value: "CAD", label: "$" },
  { value: "AUD", label: "$" },
  { value: "JPY", label: "¥" },
  { value: "CHF", label: "CHF" },
  { value: "CNY", label: "¥" },
  { value: "INR", label: "₹" },
  { value: "BRL", label: "R$" },
  { value: "VEF", label: "Bs" },
];

export const roundingAmounts: { value: RoundingAmount; label: string }[] = [
  { value: "s", label: "Seconds" },
  { value: "min", label: "Minutes" },
  { value: "1/4h", label: "Quarter Hour" },
  { value: "1/2h", label: "Half Hour" },
  { value: "h", label: "Hour" },
];

export const roundingModes: { value: RoundingDirection; label: string }[] = [
  { value: "up", label: "Up" },
  { value: "down", label: "Down" },
  { value: "nearest", label: "Nearest" },
];

export const financeIntervals: { value: FinanceInterval; label: string }[] = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "1/4 year", label: "Quarter Year" },
  { value: "1/2 year", label: "Half Year" },
  { value: "year", label: "Year" },
];
