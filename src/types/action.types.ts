import { Tables } from '@/types/db.types';

// Error Response
interface ErrorResponse {
  success: false;
  data: null;
  error: string;
}


// Session List Success Response
interface SessionListSuccesResponse {
  success: true;
  data: Tables<'timerSession'>[];
  error: null;
}
export type ServerSessionListResponse = SessionListSuccesResponse | ErrorResponse;


// Session Succes Response
interface SessionSuccesResponse {
  success: true;
  data: Tables<'timerSession'>;
  error: null;
}
export type ServerSessionResponse = SessionSuccesResponse | ErrorResponse;


// Project List Success Response
interface ProjectListSuccesResponse {
  success: true;
  data: Tables<'timerProject'>[];
  error: null;
}
export type ServerProjectListResponse = ProjectListSuccesResponse | ErrorResponse;


// Project Success Response
interface ProjectSuccesResponse {
  success: true;
  data: Tables<'timerProject'>;
  error: null;
}
export type ServerProjectResponse = ProjectSuccesResponse | ErrorResponse;