import { Hono } from "hono";
import { Env } from './core-utils';
import type { ApiResponse, Room } from '@shared/types';
import { v4 as uuidv4 } from 'uuid';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    // Create a new room and return its ID
    app.post('/api/rooms', (c) => {
        const roomId = uuidv4();
        return c.json({ success: true, data: { roomId } } satisfies ApiResponse<{ roomId: string }>);
    });
    // Get information about a specific room
    app.get('/api/rooms/:roomId', async (c) => {
        const { roomId } = c.req.param();
        if (!roomId) {
            return c.json({ success: false, error: 'Room ID is required' }, 400);
        }
        const durableObjectStub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const room = await durableObjectStub.getRoom(roomId);
        if (!room) {
            return c.json({ success: false, error: 'Room not found' }, 404);
        }
        return c.json({ success: true, data: room } satisfies ApiResponse<Room>);
    });
}