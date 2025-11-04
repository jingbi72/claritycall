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