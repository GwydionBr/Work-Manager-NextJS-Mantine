'use client';

import { create } from 'zustand';
import * as actions from '@/actions';
import { Tables, TablesInsert, TablesUpdate } from '@/types/db.types';

export interface TimerProject {
  project: Tables<'timerProject'>;
  sessions: Tables<'timerSession'>[];
}

interface WorkStore {
  projects: TimerProject[];
  activeProject: TimerProject | null;
  timerSessions: Tables<'timerSession'>[];
  fetchData: () => Promise<void>;
  setActiveProject: (id: string) => void;
  addProject: (project: TablesInsert<'timerProject'>) => Promise<boolean>;
  addTimerSession: (session: TablesInsert<'timerSession'>) => Promise<boolean>;
  updateProject: (project: TablesUpdate<'timerProject'>) => Promise<boolean>;
  updateTimerSession: (session: TablesUpdate<'timerSession'>) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
  deleteTimerSession: (id: string) => Promise<boolean>;
}

const updateStore = (
  set: any,
  get: any,
  updatedProjects: TimerProject[],
  updatedSessions: Tables<'timerSession'>[]
) => {
  set({ projects: updatedProjects, timerSessions: updatedSessions });
  const activeProject = get().activeProject;
  if (activeProject) {
    set({
      activeProject: updatedProjects.find((p) => p.project.id === activeProject.project.id) || null,
    });
  }
};


export const useWorkStore = create<WorkStore>((set, get) => ({
  projects: [],
  activeProject: null,
  timerSessions: [],

  async fetchData() {
    const [projects, timerSessions] = await Promise.all([
      actions.getAllProjects(),
      actions.getAllSessions(),
    ]);

    if (!projects.success || !timerSessions.success) {return};

    const projectsData = projects.data.map((project) => ({
      project,
      sessions: timerSessions.data.filter((session) => session.project_id === project.id),
    }));

    if (projectsData.length !== 0) {
      set({ activeProject: projectsData[0] });
    }

    updateStore(set, get, projectsData, timerSessions.data);
  },

  setActiveProject(id) {
    const project = get().projects.find((p) => p.project.id === id);
    if (project) {set({ activeProject: project })};
  },

  async updateProject(project) {
    const updatedProject = await actions.updateProject({ project });
    if (!updatedProject.success) {return false};

    const updatedProjects = get().projects.map((p) =>
      p.project.id === project.id ? { project: updatedProject.data, sessions: p.sessions } : p
    );
    updateStore(set, get, updatedProjects, get().timerSessions);
    return true;
  },

  async deleteProject(id) {
    const deleted = await actions.deleteProject({ projectId: id });
    if (!deleted.success) {return false};

    const updatedProjects = get().projects.filter((p) => p.project.id !== id);
    updateStore(set, get, updatedProjects, get().timerSessions);
    return true;
  },

  async addProject(project) {
    const newProject = await actions.createProject({ project });
    if (!newProject.success) {return false};

    const updatedProjects = [...get().projects, { project: newProject.data, sessions: [] }];
    updateStore(set, get, updatedProjects, get().timerSessions);
    return true;
  },

  async addTimerSession(session) {
    const newSession = await actions.createSession({ session });
    if (!newSession.success) {return false};

    const updatedSessions = [...get().timerSessions, newSession.data];
    const updatedProjects = get().projects.map((p) =>
      p.project.id === session.project_id
        ? { project: p.project, sessions: [...p.sessions, newSession.data] }
        : p
    );
    updateStore(set, get, updatedProjects, updatedSessions);
    return true;
  },

  async deleteTimerSession(id) {
    const deleted = await actions.deleteSession({ sessionId: id });
    if (!deleted.success) {return false};

    const updatedSessions = get().timerSessions.filter((s) => s.id !== id);
    const updatedProjects = get().projects.map((p) => ({
      project: p.project,
      sessions: p.sessions.filter((s) => s.id !== id),
    }));
    updateStore(set, get, updatedProjects, updatedSessions);
    return true;
  },

  async updateTimerSession(session) {
    const updatedSession = await actions.updateSession({ session });
    if (!updatedSession.success) {return false};

    const updatedSessions = get().timerSessions.map((s) =>
      s.id === session.id ? updatedSession.data : s
    );
    const updatedProjects = get().projects.map((p) => ({
      project: p.project,
      sessions: p.sessions.map((s) => (s.id === session.id ? updatedSession.data : s)),
    }));
    updateStore(set, get, updatedProjects, updatedSessions);
    return true;
  },
}));
