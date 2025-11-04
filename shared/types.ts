export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface Participant {
  id: string; // User ID, could be persistent
  sessionId: string; // Unique ID for the current session/connection
  name: string;
}
export interface Room {
  id: string;
  participants: Participant[];
}
// WebRTC Signaling Messages
export type SignalMessage =
  | { type: 'offer'; sdp: string | undefined; sender: string; recipient: string }
  | { type: 'answer'; sdp: string | undefined; sender: string; recipient: string }
  | { type: 'ice-candidate'; candidate: RTCIceCandidateInit; sender: string; recipient: string }
  | { type: 'participant-joined'; participant: Participant }
  | { type: 'participant-left'; sessionId: string };