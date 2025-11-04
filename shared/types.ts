// This type is available in the browser's global scope, but we define it here
// for type safety and consistency between the client and worker environments.
export interface RTCIceCandidateInit {
  candidate?: string | null;
  sdpMid?: string | null;
  sdpMLineIndex?: number | null;
  usernameFragment?: string | null;
}
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface Participant {
  id: string;
  sessionId: string;
  name: string;
}
export interface Room {
  id: string;
  participants: Participant[];
}
export type SignalMessage =
  | { type: 'offer'; sdp: string | undefined; sender: string; recipient: string }
  | { type: 'answer'; sdp: string | undefined; sender: string; recipient: string }
  | { type: 'ice-candidate'; candidate: RTCIceCandidateInit; sender: string; recipient: string }
  | { type: 'participant-joined'; participant: Participant }
  | { type: 'participant-left'; sessionId: string };