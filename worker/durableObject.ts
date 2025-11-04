import { DurableObject } from "cloudflare:workers";
import type { Participant, Room } from '@shared/types';
// **DO NOT MODIFY THE CLASS NAME**
export class GlobalDurableObject extends DurableObject {
    private async getRooms(): Promise<Map<string, Room>> {
        const rooms = await this.ctx.storage.get<Map<string, Room>>("rooms");
        return rooms || new Map<string, Room>();
    }
    private async saveRooms(rooms: Map<string, Room>): Promise<void> {
        await this.ctx.storage.put("rooms", rooms);
    }
    async getRoom(roomId: string): Promise<Room | undefined> {
        const rooms = await this.getRooms();
        return rooms.get(roomId);
    }
    async joinRoom(roomId: string, participant: Participant): Promise<Room> {
        const rooms = await this.getRooms();
        let room = rooms.get(roomId);
        if (!room) {
            room = { id: roomId, participants: [] };
        }
        // Avoid adding duplicate participants
        if (!room.participants.some(p => p.id === participant.id)) {
            room.participants.push(participant);
        }
        rooms.set(roomId, room);
        await this.saveRooms(rooms);
        return room;
    }
}