'use client';

import { create } from 'zustand';
import * as actions from '@/actions';
import { Tables, TablesUpdate } from '@/types/db.types';


export interface TimerProject {
  project: Tables<'timerProject'>;
  sessions: Tables<'timerSession'>[];
}

interface WorkStore {
  projects: TimerProject[];
  activeProject: TimerProject | null;
  timerSessions: Tables<'timerSession'>[];
  fetchData: () => Promise<void>;
  setActiveProject: (id: string) => Promise<void>;
  updateProject: (project: TablesUpdate<'timerProject'>) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
}

export const useWorkStore = create<WorkStore>((set, get) => ({
  projects: [],
  activeProject: null,
  timerSessions: [],

  async fetchData() {
    const [projects, timerSessions] = await Promise.all([
      actions.getAllProjects(),
      actions.getAllSessions(),
    ]);

    if (!projects.success || !timerSessions.success) {
      return;
    }

    const projectsData = projects.data.map((project) => ({
      project,
      sessions: timerSessions.data.filter((session) => session.project_id === project.id),
    }));

    set({
      projects: projectsData,
      timerSessions: timerSessions.data
    });
  },


  async setActiveProject(id: string) {

    const { projects } = get();
    const project = projects.find((p) => p.project.id === id);

    if (!project) {
      return;
    }

    set({ activeProject: project });
  },


  updateProject: async (project) => {
    const { projects } = get();
    const updatedProject = await actions.updateProject({ updateProject: project });

    if (!updatedProject.success) {
      return false;
    }

    const updatedProjects = projects.map((p) => {
      if (p.project.id === project.id) {
        return {
          project: updatedProject.data,
          sessions: p.sessions,
        };
      }

      return p;
    });

    set({ projects: updatedProjects });
    set({ activeProject: updatedProjects.find((p) => p.project.id === project.id) });

    return true;
  },


  deleteProject: async (id) => {
    const { projects } = get();
    const deletedProject = await actions.deleteProject({projectId: id});

    if (!deletedProject.success) {
      return false;
    }

    const updatedProjects = projects.filter((p) => p.project.id !== id);
    set({ projects: updatedProjects });
    set({ activeProject: null });

    return true;
  },
}));