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
  getAllSingleCashFlows,
  createSingleCashFlow,
  updateSingleCashFlow,
  deleteSingleCashFlow,
} from "./finance/singleCashFlowActions";
export {
  getAllRecurringCashFlows,
  createRecurringCashFlow,
  updateRecurringCashFlow,
  deleteRecurringCashFlow,
} from "./finance/recurringCashFlowActions";

// Group Actions
export { getAllGroups } from "./group/getAllGroups";
export {
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
} from "./group/groupActions";

// Grocery Item Actions
export {
  getGroceryItemsByGroup,
  getGroceryItemById,
  createGroceryItem,
  updateGroceryItem,
  deleteGroceryItem,
} from "./group/groceryItemActions";

// Profile Actions
export {
  getOtherProfiles as getAllProfiles,
  getProfile,
  createProfile,
  updateProfile,
  deleteProfile,
} from "./profile/profileActions";

// Friendship Actions
export {
  getAllFriendships,
  createFriendship,
  acceptFriendship,
  declineFriendship,
  deleteFriendship,
} from "./profile/friendshipActions";
