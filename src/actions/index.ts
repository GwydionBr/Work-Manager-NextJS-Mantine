//  Project Actions

export {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from "./work/timerProjectActions";

// Session Actions

export {
  getAllSessions,
  getProjectSessions,
  createSession,
  deleteSession,
  updateSession,
} from "./work/timerSessionActions";

// Auth Actions

export { login } from "./auth/email/loginEmail";
export { logout } from "./auth/logout";
export { signup } from "./auth/email/signupEmail";
export { signInWithGithub } from "./auth/github/signInWithGithub";

// Settings Actions

export { getSettings, updateSettings } from "./settings/settingsActions";

// Finance Actions

export {
  getAllIncomes,
  createIncome,
  updateIncome,
  deleteIncome,
} from "./finance/incomeActions";
export {
  getAllExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from "./finance/expenseActions";
export {
  getAllRecurringIncomes,
  createRecurringIncome,
  updateRecurringIncome,
  deleteRecurringIncome,
} from "./finance/recurringIncomeActions";
export {
  getAllRecurringExpenses,
  createRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,
} from "./finance/recurringExpenseActions";
