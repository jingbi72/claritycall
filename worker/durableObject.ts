import { DurableObject } from "cloudflare:workers";
import type { Participant, Room, SignalMessage } from '@shared/types';
interface RoomState {
  id: string;
  participants: Map<string, Participant>;
  // Key is sessionId of the recipient
  signalQueues: Map<string, SignalMessage[]>;
}
export class GlobalDurableObject extends DurableObject {
  private async getRooms(): Promise<Map<string, RoomState>> {
    const rooms = await this.ctx.storage.get<Map<string, RoomState>>("rooms_v2");
    return rooms || new Map<string, RoomState>();
  }
  private async saveRooms(rooms: Map<string, RoomState>): Promise<void> {
    await this.ctx.storage.put("rooms_v2", rooms);
  }
  private async broadcast(roomId: string, message: SignalMessage, rooms: Map<string, RoomState>): Promise<void> {
    const room = rooms.get(roomId);
    if (!room) return;
    for (const participant of room.participants.values()) {
      if (!room.signalQueues.has(participant.sessionId)) {
        room.signalQueues.set(participant.sessionId, []);
      }
      room.signalQueues.get(participant.sessionId)!.push(message);
    }
    await this.saveRooms(rooms);
  }
  async joinRoom(roomId: string, participant: Participant): Promise<Participant[]> {
    const rooms = await this.getRooms();
    let room = rooms.get(roomId);
    if (!room) {
      room = {
        id: roomId,
        participants: new Map(),
        signalQueues: new Map(),
      };
    }
    const existingParticipants = Array.from(room.participants.values());
    room.participants.set(participant.sessionId, participant);
    // Ensure a queue exists for the new participant
    if (!room.signalQueues.has(participant.sessionId)) {
      room.signalQueues.set(participant.sessionId, []);
    }
    rooms.set(roomId, room);
    // Announce the new participant to others
    await this.broadcast(roomId, { type: 'participant-joined', participant }, rooms);
    return existingParticipants;
  }
  async leaveRoom(roomId: string, sessionId: string): Promise<void> {
    const rooms = await this.getRooms();
    const room = rooms.get(roomId);
    if (!room) return;
    room.participants.delete(sessionId);
    room.signalQueues.delete(sessionId); // Clean up message queue
    if (room.participants.size === 0) {
      rooms.delete(roomId);
    } else {
      rooms.set(roomId, room);
    }
    await this.broadcast(roomId, { type: 'participant-left', sessionId }, rooms);
  }
  async addSignalMessage(roomId: string, message: SignalMessage): Promise<void> {
    const rooms = await this.getRooms();
    const room = rooms.get(roomId);
    if (!room) return;
    if ('recipient' in message) {
      const { recipient } = message;
      if (!room.signalQueues.has(recipient)) {
        room.signalQueues.set(recipient, []);
      }
      room.signalQueues.get(recipient)!.push(message);
      rooms.set(roomId, room);
      await this.saveRooms(rooms);
    }
  }
  async getSignalMessages(roomId: string, sessionId: string): Promise<SignalMessage[]> {
    const rooms = await this.getRooms();
    const room = rooms.get(roomId);
    if (!room || !room.signalQueues.has(sessionId)) {
      return [];
    }
    const messages = room.signalQueues.get(sessionId)!;
    room.signalQueues.set(sessionId, []); // Clear the queue after retrieval
    rooms.set(roomId, room);
    await this.saveRooms(rooms);
    return messages;
  }
}