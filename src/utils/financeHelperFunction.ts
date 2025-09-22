import { Tables, TablesInsert } from "@/types/db.types";
import { FinanceInterval } from "@/types/settings.types";
import {
  addMonths,
  addDays,
  addWeeks,
  addQuarters,
  addYears,
  isSameDay,
} from "date-fns";

export const getNextDate = (
  interval: FinanceInterval,
  startDate: Date
): Date => {
  switch (interval) {
    case "day":
      return addDays(startDate, 1);
    case "week":
      return addWeeks(startDate, 1);
    case "month":
      return addMonths(startDate, 1);
    case "1/4 year":
      return addQuarters(startDate, 1);
    case "1/2 year":
      return addMonths(startDate, 6);
    case "year":
      return addYears(startDate, 1);
    default:
      return startDate;
  }
};

interface ProcessedRecurringCashFlows {
  pastAndCurrentFlows: TablesInsert<"single_cash_flow">[];
  futureFlows: Tables<"single_cash_flow">[];
}

export const processRecurringCashFlows = (
  recurringCashFlows: Tables<"recurring_cash_flow">[],
  existingSingleCashFlows: Tables<"single_cash_flow">[]
): ProcessedRecurringCashFlows => {
  const pastAndCurrentFlows: TablesInsert<"single_cash_flow">[] = [];
  const futureFlows: Tables<"single_cash_flow">[] = [];
  const today = new Date();
  const sixMonthsFromNow = addMonths(today, 6);

  recurringCashFlows.forEach((flow) => {
    const startDate = new Date(flow.start_date);
    const endDate = flow.end_date ? new Date(flow.end_date) : null;

    // Calculate the actual end date (either the recurring flow's end date or 6 months from now, whichever comes first)
    const actualEndDate =
      endDate && endDate < sixMonthsFromNow ? endDate : sixMonthsFromNow;

    let currentDate = new Date(startDate);

    while (currentDate <= actualEndDate) {
      // Check if this date already exists in existingSingleCashFlows
      const existingFlow = existingSingleCashFlows.find(
        (singleFlow) =>
          isSameDay(new Date(singleFlow.date), currentDate) &&
          singleFlow.recurring_cash_flow_id === flow.id
      );

      if (!existingFlow) {
        const baseFlow = {
          amount: flow.amount,
          currency: flow.currency,
          date: currentDate.toISOString(),
          title: flow.title,
          type: flow.type,
          is_active: true,
          user_id: flow.user_id,
          recurring_cash_flow_id: flow.id,
          category_id: flow.category_id,
        };

        if (currentDate <= today) {
          // Past or current flow - only include fields needed for insertion
          pastAndCurrentFlows.push(baseFlow);
        } else {
          // Future flow - include all fields
          futureFlows.push({
            ...baseFlow,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            changed_date: null,
            category_id: flow.category_id,
            finance_project_adjustment_id: null,
            finance_project_id: null,
          });
        }
      }

      // Calculate next date based on interval
      switch (flow.interval) {
        case "day":
          currentDate = addDays(currentDate, 1);
          break;
        case "week":
          currentDate = addWeeks(currentDate, 1);
          break;
        case "month":
          currentDate = addMonths(currentDate, 1);
          break;
        case "1/4 year":
          currentDate = addQuarters(currentDate, 1);
          break;
        case "1/2 year":
          currentDate = addMonths(currentDate, 6);
          break;
        case "year":
          currentDate = addYears(currentDate, 1);
          break;
      }
    }
  });

  return {
    pastAndCurrentFlows,
    futureFlows,
  };
};
