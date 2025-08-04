"use server";

import { createClient } from "@/utils/supabase/server";
import { SimpleResponse } from "@/types/action.types";
import { Currency } from "@/types/settings.types";

interface PayoutSessionsProps {
  sessionIds: string[];
  startValue: number;
  startCurrency: Currency;
  endValue: number | null;
  endCurrency: Currency | null;
}

export async function payoutSessions({
  sessionIds,
  startValue,
  startCurrency,
  endValue,
  endCurrency,
}: PayoutSessionsProps): Promise<SimpleResponse> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, data: null, error: "User not found" };
  }

  // Get the sessions with project information to access category_id
  const { data: sessions, error: sessionsError } = await supabase
    .from("timerSession")
    .select(
      `
      *,
      timerProject!inner(
        id,
        title,
        cash_flow_category_id,
        currency
      )
    `
    )
    .in("id", sessionIds)
    .eq("payed", false);

  if (sessionsError) {
    return { success: false, data: null, error: sessionsError.message };
  }

  if (!sessions || sessions.length === 0) {
    return { success: false, data: null, error: "No unpaid sessions found" };
  }

  // Group sessions by currency and category to create separate income entries
  const sessionsByCurrencyAndCategory = sessions.reduce(
    (acc, session) => {
      const currency = session.currency;
      const categoryId = session.timerProject?.cash_flow_category_id || null;
      const key = `${currency}-${categoryId || "no-category"}`;

      if (!acc[key]) {
        acc[key] = {
          currency,
          categoryId,
          sessions: [],
          totalAmount: 0,
        };
      }

      const earnings = session.hourly_payment
        ? Number(((session.active_seconds * session.salary) / 3600).toFixed(2))
        : 0;

      acc[key].sessions.push(session);
      acc[key].totalAmount += earnings;

      return acc;
    },
    {} as Record<
      string,
      {
        currency: string;
        categoryId: string | null;
        sessions: typeof sessions;
        totalAmount: number;
      }
    >
  );

  // Start a transaction
  const { error: updateError } = await supabase
    .from("timerSession")
    .update({ payed: true })
    .in("id", sessionIds);

  if (updateError) {
    return { success: false, data: null, error: updateError.message };
  }

  // Create income entries for each currency and category combination
  const incomeEntries = Object.values(sessionsByCurrencyAndCategory)
    .filter((group) => group.totalAmount > 0)
    .map((group) => ({
      title: `Work Payout - ${group.sessions.length} session${group.sessions.length > 1 ? "s" : ""}`,
      amount: group.totalAmount,
      currency: group.currency as any,
      date: new Date().toISOString(),
      type: "income" as const,
      user_id: user.id,
      category_id: group.categoryId,
    }));

  if (incomeEntries.length > 0) {
    const { error: incomeError } = await supabase
      .from("single_cash_flow")
      .insert(incomeEntries);

    if (incomeError) {
      return { success: false, data: null, error: incomeError.message };
    }
  }

  return { success: true, data: null, error: null };
}
