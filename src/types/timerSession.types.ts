import type { Tables } from "@/types/db.types";
import { Currency } from "@/types/settings.types";

export interface SessionListProps {
  sessions: Tables<"timerSession">[];
  projects?: Tables<"timerProject">[];
  folders?: Tables<"timer_project_folder">[];
  selectedSessions: string[];
  onSessionsChange: (sessions: string[]) => void;
  project?: Tables<"timerProject">;
  isOverview?: boolean;
}

export interface Earnings {
  amount: number;
  currency: Currency;
}

export interface EarningsBreakdown {
  paid: Earnings[];
  unpaid: Earnings[];
}

export type Year = {
  totalEarnings: EarningsBreakdown;
  totalTime: number;
  months: Record<
    number,
    {
      totalEarnings: EarningsBreakdown;
      totalTime: number;
      weeks: Record<
        number,
        {
          totalEarnings: EarningsBreakdown;
          totalTime: number;
          days: Record<
            string,
            {
              totalEarnings: EarningsBreakdown;
              totalTime: number;
              sessions: Tables<"timerSession">[];
            }
          >;
        }
      >;
    }
  >;
};

export interface TimePreset {
  value: string;
  label: string;
  days: number;
}
