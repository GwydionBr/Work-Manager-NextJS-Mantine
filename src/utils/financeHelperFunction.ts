import { Tables, TablesInsert } from "@/types/db.types";
import {
  StoreRecurringCashFlow,
  StoreSingleCashFlow,
} from "@/types/finance.types";
import { FinanceInterval } from "@/types/settings.types";
import {
  addMonths,
  addDays,
  addWeeks,
  addQuarters,
  addYears,
  isSameDay,
} from "date-fns";

const getCorrectDay = (date: Date, anchorDay: number) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  return Math.min(anchorDay, lastDayOfMonth);
};

/**
 * Get the next date for a given interval and start date
 * @param interval - The interval to use
 * @param startDate - The start date to use
 * @returns The next date
 */
export const getNextDate = (
  interval: FinanceInterval,
  startDate: Date
): Date => {
  const today = new Date();
  let candidate = new Date(startDate);
  const anchorDay = candidate.getDate();

  // If today is before the start date, the next valid occurrence is the start date itself
  if (today < candidate) {
    return candidate;
  }

  // If today falls exactly on an occurrence, return today
  if (isSameDay(candidate, today)) {
    return today;
  }

  // Otherwise, advance from the start date in the chosen interval until we reach today or later
  const advance = (date: Date): Date => {
    switch (interval) {
      case "day":
        return addDays(date, 1);
      case "week":
        return addWeeks(date, 1);
      case "month":
        let newMonthDate = addMonths(date, 1);
        newMonthDate.setDate(getCorrectDay(newMonthDate, anchorDay));
        return newMonthDate;
      case "1/4 year":
        let newQuarterDate = addQuarters(date, 1);
        newQuarterDate.setDate(getCorrectDay(newQuarterDate, anchorDay));
        return newQuarterDate;
      case "1/2 year":
        let newHalfYearDate = addMonths(date, 6);
        newHalfYearDate.setDate(getCorrectDay(newHalfYearDate, anchorDay));
        return newHalfYearDate;
      case "year":
        let newYearDate = addYears(date, 1);
        newYearDate.setDate(getCorrectDay(newYearDate, anchorDay));
        return newYearDate;
      default:
        return date;
    }
  };

  while (candidate < today && !isSameDay(candidate, today)) {
    const next = advance(candidate);
    // Prevent infinite loops in case of an unknown interval
    if (next.getTime() === candidate.getTime()) break;
    candidate = next;
  }

  return isSameDay(candidate, today) ? today : candidate;
};

interface ProcessedRecurringCashFlows {
  pastAndCurrentFlows: (TablesInsert<"single_cash_flow"> & {
    categoryIds: string[];
  })[];
  futureFlows: StoreSingleCashFlow[];
}

export const processRecurringCashFlows = (
  recurringCashFlows: StoreRecurringCashFlow[],
  existingSingleCashFlows: StoreSingleCashFlow[]
): ProcessedRecurringCashFlows => {
  const pastAndCurrentFlows: (TablesInsert<"single_cash_flow"> & {
    categoryIds: string[];
  })[] = [];
  const futureFlows: StoreSingleCashFlow[] = [];
  const today = new Date();
  const sixMonthsFromNow = addMonths(today, 6);

  recurringCashFlows.forEach((flow) => {
    const startDate = new Date(flow.start_date);
    const anchorDay = startDate.getDate();
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
          finance_client_id: flow.finance_client_id,
          categoryIds: flow.categoryIds,
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
            finance_project_id: null,
            finance_client_id: flow.finance_client_id,
            category_id: null,
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
          currentDate.setDate(getCorrectDay(currentDate, anchorDay));
          break;
        case "1/4 year":
          currentDate = addQuarters(currentDate, 1);
          currentDate.setDate(getCorrectDay(currentDate, anchorDay));
          break;
        case "1/2 year":
          currentDate = addMonths(currentDate, 6);
          currentDate.setDate(getCorrectDay(currentDate, anchorDay));
          break;
        case "year":
          currentDate = addYears(currentDate, 1);
          currentDate.setDate(getCorrectDay(currentDate, anchorDay));
          break;
      }
    }
  });

  return {
    pastAndCurrentFlows,
    futureFlows,
  };
};
