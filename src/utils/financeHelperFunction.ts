import { Tables } from "@/types/db.types";
import {
  addMonths,
  addDays,
  addWeeks,
  addQuarters,
  addYears,
  isSameDay,
} from "date-fns";

export const processRecurringCashFlows = (
  recurringCashFlows: Tables<"recurring_cash_flow">[],
  singleCashFlows: Tables<"single_cash_flow">[]
) => {
  const processedRecurringCashFlows = recurringCashFlows.map((flow) => {
    const startDate = new Date(flow.start_date);
    const endDate = flow.end_date ? new Date(flow.end_date) : null;
    const sixMonthsFromNow = addMonths(new Date(), 6);

    // Calculate the actual end date (either the recurring flow's end date or 6 months from now, whichever comes first)
    const actualEndDate =
      endDate && endDate < sixMonthsFromNow ? endDate : sixMonthsFromNow;

    const generatedSingleFlows: Tables<"single_cash_flow">[] = [];
    let currentDate = new Date(startDate);

    while (currentDate <= actualEndDate) {
      // Check if this date already exists in singleCashFlows
      const existingFlow = singleCashFlows.find(
        (singleFlow) =>
          isSameDay(new Date(singleFlow.date), currentDate) &&
          singleFlow.title === flow.title &&
          singleFlow.amount === flow.amount &&
          singleFlow.type === flow.type
      );

      if (!existingFlow) {
        generatedSingleFlows.push({
          id: crypto.randomUUID(),
          amount: flow.amount,
          currency: flow.currency,
          date: currentDate.toISOString(),
          title: flow.title,
          type: flow.type,
          is_active: true,
          user_id: flow.user_id,
          created_at: new Date().toISOString(),
          changed_date: null,
          is_from_recurring: true,
        });
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

    return {
      ...flow,
      generatedSingleFlows,
    };
  });

  return processedRecurringCashFlows;
};
