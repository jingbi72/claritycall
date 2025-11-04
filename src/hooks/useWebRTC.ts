import { useEffect, useRef, useCallback } from 'react';
import { useRoomStore } from '@/stores/useRoomStore';
import type { Participant, SignalMessage } from '@shared/types';
import { v4 as uuidv4 } from 'uuid';
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};
export function useWebRTC(roomId: string) {
  const localStream = useRoomStore(s => s.localStream);
  const {
    addPeerConnection,
    getPeerConnection,
    removePeerConnection,
    addRemoteStream,
    removeRemoteStream,
    addParticipant,
    removeParticipant,
    setParticipants,
  } = useRoomStore(s => ({
    addPeerConnection: s.addPeerConnection,
    getPeerConnection: s.getPeerConnection,
    removePeerConnection: s.removePeerConnection,
    addRemoteStream: s.addRemoteStream,
    removeRemoteStream: s.removeRemoteStream,
    addParticipant: s.addParticipant,
    removeParticipant: s.removeParticipant,
    setParticipants: s.setParticipants,
  }));
  const mySessionId = useRef(uuidv4());
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const sendSignal = useCallback(async (message: SignalMessage) => {
    try {
      await fetch(`/api/rooms/${roomId}/signal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });
    } catch (error) {
      console.error('Failed to send signal:', error);
    }
  }, [roomId]);
  const createPeerConnection = useCallback((participant: Participant) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal({
          type: 'ice-candidate',
          candidate: event.candidate,
          sender: mySessionId.current,
          recipient: participant.sessionId,
        });
      }
    };
    pc.ontrack = (event) => {
      addRemoteStream(participant.sessionId, event.streams[0]);
    };
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }
    addPeerConnection(participant.sessionId, pc);
    return pc;
  }, [localStream, sendSignal, addPeerConnection, addRemoteStream]);
  const handleNewParticipant = useCallback(async (participant: Participant) => {
    if (participant.sessionId === mySessionId.current) return;
    addParticipant(participant);
    const pc = createPeerConnection(participant);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    sendSignal({
      type: 'offer',
      sdp: offer.sdp,
      sender: mySessionId.current,
      recipient: participant.sessionId,
    });
  }, [addParticipant, createPeerConnection, sendSignal]);
  const handleSignalMessage = useCallback(async (message: SignalMessage) => {
    const { sender, type } = message;
    let pc = getPeerConnection(sender);
    if (type !== 'offer' && !pc) {
      console.warn(`Peer connection for ${sender} not found, creating one.`);
      const senderParticipant = useRoomStore.getState().participants.find(p => p.sessionId === sender);
      if (senderParticipant) {
        pc = createPeerConnection(senderParticipant);
      } else {
        console.error(`Participant ${sender} not found in store.`);
        return;
      }
    } else if (!pc && type === 'offer') {
        const senderParticipant = useRoomStore.getState().participants.find(p => p.sessionId === sender);
        if (senderParticipant) {
            pc = createPeerConnection(senderParticipant);
        } else {
            console.error(`Participant ${sender} not found in store.`);
            return;
        }
    }
    if (!pc) return;
    switch (type) {
      case 'offer':
        await pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: message.sdp }));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendSignal({
          type: 'answer',
          sdp: answer.sdp,
          sender: mySessionId.current,
          recipient: sender,
        });
        break;
      case 'answer':
        await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: message.sdp }));
        break;
      case 'ice-candidate':
        if (message.candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
        }
        break;
      case 'participant-joined':
        handleNewParticipant(message.participant);
        break;
      case 'participant-left':
        removePeerConnection(message.sessionId);
        removeRemoteStream(message.sessionId);
        removeParticipant(message.sessionId);
        break;
      default:
        console.warn('Unknown signal type:', type);
    }
  }, [getPeerConnection, createPeerConnection, sendSignal, handleNewParticipant, removePeerConnection, removeRemoteStream, removeParticipant]);
  const pollMessages = useCallback(async () => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/signal?sessionId=${mySessionId.current}`);
      if (response.ok) {
        const messages = await response.json() as SignalMessage[];
        for (const message of messages) {
          handleSignalMessage(message);
        }
      }
    } catch (error) {
      console.error('Error polling for messages:', error);
    }
  }, [roomId, handleSignalMessage]);
  const joinRoom = useCallback(async () => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: mySessionId.current, name: 'Guest' }),
      });
      if (response.ok) {
        const { participants } = await response.json() as { participants: Participant[] };
        setParticipants(participants);
        participants.forEach(p => {
          if (p.sessionId !== mySessionId.current) {
            handleNewParticipant(p);
          }
        });
        pollingInterval.current = setInterval(pollMessages, 2000);
      } else {
        console.error('Failed to join room');
      }
    } catch (error) {
      console.error('Error joining room:', error);
    }
  }, [roomId, setParticipants, handleNewParticipant, pollMessages]);
  const leaveRoom = useCallback(async () => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
    try {
      await fetch(`/api/rooms/${roomId}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: mySessionId.current }),
      });
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  }, [roomId]);
  useEffect(() => {
    if (localStream) {
      joinRoom();
    }
    return () => {
      leaveRoom();
    };
  }, [localStream, joinRoom, leaveRoom]);
  return { mySessionId: mySessionId.current };
}