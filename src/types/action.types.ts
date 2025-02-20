import { Tables } from '@/types/db.types';


// Error Response
interface ErrorResponse {
  success: false;
  data: null;
  error: string;
}

// Delete Success Response
interface DeleteSuccessResponse {
  success: true;
  data: null;
  error: null;
}
export type DeleteResponse = DeleteSuccessResponse | ErrorResponse;


// Session Responses

// Session List Success Response
interface SessionListSuccesResponse {
  success: true;
  data: Tables<'timerSession'>[];
  error: null;
}
export type SessionListResponse = SessionListSuccesResponse | ErrorResponse;


// Session Succes Response
interface SessionSuccesResponse {
  success: true;
  data: Tables<'timerSession'>;
  error: null;
}
export type SessionResponse = SessionSuccesResponse | ErrorResponse;
// Update Session Success Response


interface UpdateSessionSuccessResponse {
  success: true;
  data: Tables<'timerSession'>;
  error: null;
}
export type UpdateSessionResponse = UpdateSessionSuccessResponse | ErrorResponse;


// Delete Session Success Response
interface DeleteSessionSuccessResponse {
  success: true;
  data: null;
  error: null;
}
export type DeleteSessionResponse = DeleteSessionSuccessResponse | ErrorResponse;


// Project Responses

// Project List Success Response
interface ProjectListSuccesResponse {
  success: true;
  data: Tables<'timerProject'>[];
  error: null;
}
export type ProjectListResponse = ProjectListSuccesResponse | ErrorResponse;


// Project Success Response
interface ProjectSuccesResponse {
  success: true;
  data: Tables<'timerProject'>;
  error: null;
}
export type ProjectResponse = ProjectSuccesResponse | ErrorResponse;


// Update Project Success Response
interface UpdateProjectSuccessResponse {
  success: true;
  data: Tables<'timerProject'>;
  error: null;
}
export type UpdateProjectResponse = UpdateProjectSuccessResponse | ErrorResponse;


// Create Project Success Response
interface CreateProjectSuccessResponse {
  success: true;
  data: Tables<'timerProject'>;
  error: null;
}
export type CreateProjectResponse = CreateProjectSuccessResponse | ErrorResponse;
