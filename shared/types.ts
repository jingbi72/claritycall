export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface Participant {
  id: string;
  name: string;
}
export interface Room {
  id: string;
  participants: Participant[];
}