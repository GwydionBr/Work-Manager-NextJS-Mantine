// src/stores/timeTrackerManagerStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TimerState } from "./timeTrackerStore";
import { Currency, RoundingDirection } from "@/types/settings.types";

export interface TimerData {
  id: string;
  projectId: string;
  projectTitle: string;
  currency: Currency;
  salary: number;
  hourlyPayment: boolean;
  userId: string;
  roundingInterval: number;
  roundingMode: RoundingDirection;
  state: TimerState;
  activeSeconds: number;
  pausedSeconds: number;
  startTime: number | null;
  tempStartTime: number | null;
  storedActiveSeconds: number;
  storedPausedSeconds: number;
  moneyEarned: string;
  activeTime: string;
  roundedActiveTime: string;
  pausedTime: string;
}

interface TimeTrackerManagerState {
  timers: Record<string, TimerData>;

  // Timer Management
  addTimer: (timerData: Omit<TimerData, "id">) => string;
  removeTimer: (timerId: string) => void;
  updateTimer: (timerId: string, updates: Partial<TimerData>) => void;
  getTimer: (timerId: string) => TimerData | undefined;
  getAllTimers: () => TimerData[];
}

export const useTimeTrackerManager = create(
  persist<TimeTrackerManagerState>(
    (set, get) => ({
      timers: {} as Record<string, TimerData>,

      addTimer: (timerData) => {
        const id = crypto.randomUUID();
        const newTimer: TimerData = {
          id,
          ...timerData,
        };

        set((state) => {
          return {
            timers: { ...state.timers, [id]: newTimer },
          };
        });

        return id;
      },

      removeTimer: (timerId) => {
        set((state) => {
          const { [timerId]: _, ...rest } = state.timers;
          return {
            timers: rest,
          };
        });
      },

      updateTimer: (timerId, updates) => {
        set((state) => {
          const timer = state.timers[timerId];
          if (!timer) return state;

          return {
            timers: {
              ...state.timers,
              [timerId]: { ...timer, ...updates },
            },
          };
        });
      },

      getTimer: (timerId) => {
        return get().timers[timerId];
      },

      getAllTimers: () => {
        return Object.values(get().timers);
      },
    }),
    {
      name: "time-tracker-manager-storage",
    }
  )
);
