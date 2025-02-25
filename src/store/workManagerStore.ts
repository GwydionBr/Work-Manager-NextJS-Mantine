import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Tables } from '@/types/db.types';

interface WorkManagerState {
  activeProject: Tables<"timerProject"> | null;
  setActiveProject: (project: Tables<"timerProject">) => void;
}

export const useWorkManager = create(
  persist<WorkManagerState>(
    (set, get) => ({
      activeProject: null,
      setActiveProject: (project: Tables<"timerProject">) => set({ activeProject: project }),
    }),
    {
      name: 'workManager',
    }
  )
);