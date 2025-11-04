import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Participant } from '@shared/types';
type RoomState = {
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  participants: Participant[];
  peerConnections: Map<string, RTCPeerConnection>;
  isMuted: boolean;
  isCameraOff: boolean;
  activeSpeakerId: string | null;
};
type RoomActions = {
  setLocalStream: (stream: MediaStream | null) => void;
  addRemoteStream: (sessionId: string, stream: MediaStream) => void;
  removeRemoteStream: (sessionId: string) => void;
  setParticipants: (participants: Participant[]) => void;
  addParticipant: (participant: Participant) => void;
  removeParticipant: (sessionId: string) => void;
  addPeerConnection: (sessionId: string, connection: RTCPeerConnection) => void;
  removePeerConnection: (sessionId: string) => void;
  getPeerConnection: (sessionId: string) => RTCPeerConnection | undefined;
  toggleMute: () => void;
  toggleCamera: () => void;
  setActiveSpeakerId: (sessionId: string | null) => void;
  reset: () => void;
};
const initialState: RoomState = {
  localStream: null,
  remoteStreams: new Map(),
  participants: [],
  peerConnections: new Map(),
  isMuted: false,
  isCameraOff: false,
  activeSpeakerId: null,
};
export const useRoomStore = create<RoomState & RoomActions>()(
  immer((set, get) => ({
    ...initialState,
    setLocalStream: (stream) => {
      set((state) => {
        state.localStream = stream;
      });
    },
    addRemoteStream: (sessionId, stream) => {
      set((state) => {
        state.remoteStreams.set(sessionId, stream);
      });
    },
    removeRemoteStream: (sessionId) => {
      set((state) => {
        state.remoteStreams.delete(sessionId);
      });
    },
    setParticipants: (participants) => {
      set((state) => {
        state.participants = participants;
      });
    },
    addParticipant: (participant) => {
      set((state) => {
        if (!state.participants.some(p => p.sessionId === participant.sessionId)) {
          state.participants.push(participant);
        }
      });
    },
    removeParticipant: (sessionId) => {
      set((state) => {
        state.participants = state.participants.filter(p => p.sessionId !== sessionId);
      });
    },
    addPeerConnection: (sessionId, connection) => {
      set((state) => {
        state.peerConnections.set(sessionId, connection);
      });
    },
    removePeerConnection: (sessionId) => {
      set((state) => {
        const pc = state.peerConnections.get(sessionId);
        if (pc) {
          pc.close();
          state.peerConnections.delete(sessionId);
        }
      });
    },
    getPeerConnection: (sessionId) => {
      return get().peerConnections.get(sessionId);
    },
    toggleMute: () => {
      set((state) => {
        const newMutedState = !state.isMuted;
        state.isMuted = newMutedState;
        if (state.localStream) {
          state.localStream.getAudioTracks().forEach(track => {
            track.enabled = !newMutedState;
          });
        }
      });
    },
    toggleCamera: () => {
      set((state) => {
        const newCameraOffState = !state.isCameraOff;
        state.isCameraOff = newCameraOffState;
        if (state.localStream) {
          state.localStream.getVideoTracks().forEach(track => {
            track.enabled = !newCameraOffState;
          });
        }
      });
    },
    setActiveSpeakerId: (sessionId) => {
      set((state) => {
        state.activeSpeakerId = sessionId;
      });
    },
    reset: () => {
      get().peerConnections.forEach(pc => pc.close());
      if (get().localStream) {
        get().localStream?.getTracks().forEach(track => track.stop());
      }
      set(initialState);
    },
  }))
);