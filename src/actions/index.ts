//  Project Actions


export { getAllTimerProjects } from "./work/timerProject/getAllTimerProjects";
export { createTimerProject } from "./work/timerProject/createTimerProject";
export { updateTimerProject } from "./work/timerProject/updateTimerProject";
export { deleteTimerProjects } from "./work/timerProject/deleteTimerProjects";

export {
  getAllProjectFolders,
  getProjectFolderById,
  createProjectFolder,
  updateProjectFolder,
  deleteProjectFolder,
} from "./work/timerProjectFolderActions";

// Task Actions

export { getAllTasks } from "./tasks/getAllTasks";
export { createTask } from "./tasks/createTask";
export { updateTask } from "./tasks/updateTask";
export { deleteTask } from "./tasks/deleteTask";

// Calendar Actions

export { getAllAppointments } from "./appointments/getAllAppointments";
export { createAppointment } from "./appointments/createAppointment";
export { updateAppointment } from "./appointments/updateAppointment";
export { deleteAppointment } from "./appointments/deleteAppointment";


// Session Actions

export { getAllSessions } from "./work/timerSessionActions";
export { createSessions } from "./work/timerSessionActions";
export { updateSession } from "./work/timerSessionActions";
export { deleteSessions } from "./work/timerSessionActions";
export { updateMultipleSessions } from "./work/timerSessionActions";

// Auth Actions

export { login } from "./auth/email/loginEmail";
export { logout } from "./auth/logout";
export { signup } from "./auth/email/signupEmail";
export { signInWithGithub } from "./auth/github/signInWithGithub";
export { deleteUser } from "./auth/deleteUser";

// Settings Actions

export { getSettings, updateSettings } from "./settings/settingsActions";

// Group Actions

export { getAllGroups } from "./group/getAllGroups";
export { getGroupById } from "./group/getGroupById";
export { deleteGroup } from "./group/deleteGroup";
export { updateGroup } from "./group/updateGroup";
export { createGroup } from "./group/createGroup";
export {
  acceptGroupRequest,
  declineGroupRequest,
} from "./group/answerGroupRequest";
export { insertGroupMembers } from "./group/insertGroupMemebers";
export { updateGroupMember } from "./group/updateGroupMember";
export { createSingleGroupTask } from "./group/task/createSingleTask";
export { createRecurringGroupTask } from "./group/task/createRecurringTask";
export { createGroupAppointment } from "./group/appointment/createGroupAppointment";

// Grocery Item Actions

export {
  getGroceryItemsByGroup,
  getGroceryItemById,
  createGroceryItem,
  updateGroceryItem,
  deleteGroceryItem,
} from "./group/grocery/groceryItemActions";

// Profile Actions

export {
  getOtherProfiles as getAllProfiles,
  getProfile,
  updateProfile,
} from "./profile/profileActions";

// Friendship Actions

export { getAllFriends } from "./profile/getAllFriends";
export {
  createFriendship,
  acceptFriendship,
  declineFriendship,
  deleteFriendship,
} from "./profile/friendshipActions";

// Notification Actions

export { getGroupRequests } from "./group/getGroupRequests";
